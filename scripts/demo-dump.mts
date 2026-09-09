// Dump a template athlete's profile + program JSON to base the demo seed on.
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
    const a = await sql`select id, name, profile_json from athletes where email = 'liftlysupport@gmail.com'`;
    const p = await sql`select program_json, current_week, current_block from programs where athlete_id = ${a[0].id} order by created_at desc limit 1`;
    fs.writeFileSync('scripts/.tmpl-profile.json', a[0].profile_json ?? '{}');
    fs.writeFileSync('scripts/.tmpl-program.json', p[0]?.program_json ?? '{}');
    console.log('PROFILE keys:', Object.keys(JSON.parse(a[0].profile_json ?? '{}')));
    const prog = JSON.parse(p[0]?.program_json ?? '{}');
    console.log('PROGRAM name:', prog.name, '| weeks:', prog.weeks?.length, '| totalWeeks:', prog.totalWeeks, '| block:', prog.currentBlock);
    console.log('current_week:', p[0]?.current_week, '| current_block:', p[0]?.current_block);
    if (prog.weeks?.[0]) {
      console.log('WEEK1 days:', prog.weeks[0].days?.map((d:any)=>d.dayName));
      console.log('WEEK1 day1 exercises:', prog.weeks[0].days?.[0]?.exercises?.map((e:any)=>e.name));
    }
  } catch (e) { console.error('ERR', e); } finally { await sql.end(); }
})();
