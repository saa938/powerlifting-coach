// Throwaway exploration: find an athlete with rich data for the demo.
import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

const envPath = path.join(process.cwd(), '.env.local');
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const sql = postgres(process.env.DATABASE_URL!, { prepare: false, ssl: 'require', max: 1 });

(async () => {
  try {
    const athletes = await sql`
      select a.id, a.email, a.name,
             (a.profile_json is not null) as has_profile,
             (select count(*) from programs p where p.athlete_id = a.id) as programs,
             (select count(*) from session_logs s where s.athlete_id = a.id) as sessions,
             (select count(*) from bodyweight_logs b where b.athlete_id = a.id) as bw,
             (select count(*) from form_checks f where f.athlete_id = a.id) as forms,
             (select count(*) from meal_plans m where m.athlete_id = a.id) as meals
      from athletes a
      order by sessions desc nulls last, programs desc
      limit 15
    `;
    console.log('TOP ATHLETES BY DATA:');
    for (const a of athletes) {
      console.log(JSON.stringify(a));
    }
    const total = await sql`select count(*)::int as n from athletes`;
    console.log('TOTAL ATHLETES:', total[0].n);
  } catch (e) {
    console.error('ERR', e);
  } finally {
    await sql.end();
  }
})();
