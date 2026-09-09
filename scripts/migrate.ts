// Forward-only migration runner for db/migrations/*.sql.
//
// db/schema.sql provisions a *fresh* database (npm run db:init). It cannot
// safely evolve one that already holds rows, so every change to a live schema
// goes here instead as a numbered, immutable file.
//
// Rules this enforces:
//   - each file runs exactly once, recorded in schema_migrations
//   - files run in filename order, inside a transaction
//   - a file whose first line is `-- migrate:no-transaction` runs outside one,
//     for statements Postgres forbids in a transaction block (notably
//     CREATE INDEX CONCURRENTLY)
//
// Usage:
//   npm run db:migrate           apply everything pending
//   npm run db:migrate -- --dry  list what would run, touch nothing
import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set (see .env.example).');
  process.exit(1);
}

const dryRun = process.argv.includes('--dry');
const dir = path.join(process.cwd(), 'db', 'migrations');
if (!fs.existsSync(dir)) {
  console.error(`No migrations directory at ${dir}`);
  process.exit(1);
}

// `.down.sql` files are the documented rollback path; they are never applied
// automatically — a rollback in production is a deliberate, reviewed act.
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.sql') && !f.endsWith('.down.sql'))
  .sort();

const sql = postgres(url, { prepare: false, ssl: 'require', max: 1, idle_timeout: 20 });

async function main() {
  // --dry must be strictly read-only, so the bookkeeping table is only created
  // on a real run. When it does not exist yet, nothing has been applied.
  const [{ exists }] = await sql<{ exists: boolean }[]>`
    SELECT to_regclass('public.schema_migrations') IS NOT NULL AS exists`;

  if (!exists && dryRun) {
    console.log('schema_migrations does not exist yet — a real run would create it.');
  }
  if (!exists && !dryRun) {
    await sql`
      CREATE TABLE schema_migrations (
        name        TEXT PRIMARY KEY,
        applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;
  }

  const done = new Set(
    exists
      ? (await sql<{ name: string }[]>`SELECT name FROM schema_migrations`).map((r) => r.name)
      : [],
  );
  const pending = files.filter((f) => !done.has(f));

  if (pending.length === 0) {
    console.log(`Up to date — ${done.size} migration(s) already applied.`);
    return;
  }

  console.log(`${pending.length} pending migration(s):`);
  for (const f of pending) console.log(`  - ${f}`);
  if (dryRun) {
    console.log('\n--dry: nothing was applied.');
    return;
  }

  for (const name of pending) {
    const body = fs.readFileSync(path.join(dir, name), 'utf8');
    const noTx = /^\s*--\s*migrate:no-transaction/m.test(body.split('\n')[0] ?? '');
    process.stdout.write(`applying ${name}${noTx ? ' (no transaction)' : ''} ... `);

    try {
      if (noTx) {
        await sql.unsafe(body);
        await sql`INSERT INTO schema_migrations (name) VALUES (${name})`;
      } else {
        await sql.begin(async (tx) => {
          await tx.unsafe(body);
          await tx`INSERT INTO schema_migrations (name) VALUES (${name})`;
        });
      }
      console.log('ok');
    } catch (err) {
      console.log('FAILED');
      console.error(err instanceof Error ? err.message : err);
      console.error(
        noTx
          ? `\n${name} ran outside a transaction, so it may be partially applied. ` +
              'Inspect the database before retrying.'
          : `\n${name} was rolled back. No changes were made.`,
      );
      process.exitCode = 1;
      return;
    }
  }
  console.log('\nDone.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => sql.end({ timeout: 5 }));
