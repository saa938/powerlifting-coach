// Regression: hitting an admin route unauthenticated must not starve the
// Postgres pool.
//
// The admin pages fetch admin data at the top of the page component while the
// *layout* is what enforces `getAdmin()`. In the App Router a layout and its
// page render concurrently, so an anonymous request starts those admin queries
// before the layout's redirect wins. The redirect then abandons the in-flight
// queries mid-result, and because src/lib/db.ts pools with `max: 1` the single
// connection is never returned — every later DB-backed route hangs forever.
//
// This boots a real production server so the failure mode (a wedged pool that
// survives the request that caused it) is reproduced end to end. It needs a
// prior `npm run build` and a reachable DATABASE_URL, so it is deliberately not
// part of the fast `npm test` unit suite — see `npm run test:integration`.
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env.QA_PORT ?? 3211);
const BASE = `http://127.0.0.1:${PORT}`;

// `next start` inherits the parent env, and .env.local is only auto-loaded by
// the Next CLI itself, so nothing extra is needed here beyond the build output.
function loadEnvLocal() {
  const file = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
  }
}

async function get(pathname: string, timeoutMs: number): Promise<number> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(BASE + pathname, { redirect: 'manual', signal: ac.signal });
    return res.status;
  } catch {
    return 0; // timed out or connection error
  } finally {
    clearTimeout(timer);
  }
}

let server: ChildProcess | undefined;

describe('admin routes must not starve the DB pool', () => {
  before(async () => {
    loadEnvLocal();
    assert.ok(
      fs.existsSync(path.join(process.cwd(), '.next', 'BUILD_ID')),
      'no production build found — run `npm run build` first',
    );
    assert.ok(process.env.DATABASE_URL, 'DATABASE_URL must be set for this integration test');

    server = spawn(
      process.platform === 'win32' ? 'npx.cmd' : 'npx',
      ['next', 'start', '-p', String(PORT)],
      { stdio: 'ignore', shell: process.platform === 'win32' },
    );

    for (let i = 0; i < 60; i++) {
      if ((await get('/pricing', 2000)) === 200) return;
      await new Promise((r) => setTimeout(r, 1000));
    }
    throw new Error('server did not become ready');
  });

  after(() => {
    server?.kill();
  });

  it('serves a DB-backed public page before any admin request', async () => {
    assert.equal(await get('/coaches', 30_000), 200);
  });

  it('bounces an anonymous admin request to the coach login', async () => {
    assert.equal(await get('/admin', 30_000), 307);
  });

  it('still serves DB-backed pages after an anonymous admin request', async () => {
    // The pool is process-wide: if /admin leaked its connection, this hangs.
    assert.equal(await get('/coaches', 20_000), 200);
  });

  it('still serves DB-backed pages after every admin route', async () => {
    await get('/admin/reviews', 30_000);
    await get('/admin/reports', 30_000);
    assert.equal(await get('/coaches', 20_000), 200);
  });
});
