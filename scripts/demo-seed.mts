// Seeds a THROWAWAY demo athlete (verified Clerk user + rich Postgres data)
// for the Liftly UI demo recording. Idempotent: safe to re-run.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import postgres from 'postgres';
import { createClerkClient } from '@clerk/backend';
// Inlined from src/lib/calculations.ts (macroTargets + deps) to avoid ESM interop.
type AthleteProfile = any;
type MealPlan = any;
const LB_PER_KG = 2.2046226218;
const toKg = (w: number, unit: string) => (unit === 'kg' ? w : w / LB_PER_KG);
function parseHeightCm(h: string): number {
  const t = h.trim().toLowerCase();
  if (t.endsWith('cm')) return parseFloat(t);
  const ft = t.match(/(\d+)\s*['′]\s*(\d+(?:\.\d+)?)/);
  if (ft) return Math.round((parseInt(ft[1], 10) * 12 + parseFloat(ft[2])) * 2.54);
  const n = parseFloat(t);
  return !isNaN(n) && n > 100 && n < 230 ? n : 175;
}
function bmr(p: AthleteProfile): number {
  if (p.bodyFatPct && p.bodyFatPct > 5 && p.bodyFatPct < 50) {
    const lean = toKg(p.bodyweight, p.unit) * (1 - p.bodyFatPct / 100);
    return Math.round(370 + 21.6 * lean);
  }
  const base = 10 * toKg(p.bodyweight, p.unit) + 6.25 * parseHeightCm(p.height) - 5 * p.age;
  return Math.round(p.sex === 'male' ? base + 5 : base - 161);
}
const activityMultiplier = (d: number) => (d <= 3 ? 1.55 : d <= 5 ? 1.65 : 1.725);
const tdee = (p: AthleteProfile) => Math.round(bmr(p) * activityMultiplier(p.trainingDaysPerWeek));
function phaseAdjustment(p: AthleteProfile): number {
  if (p.phaseGoal === 'gaining') return p.experience === 'novice' ? 400 : 250;
  if (p.phaseGoal === 'cutting') return -400;
  return 0;
}
function macroTargets(p: AthleteProfile) {
  const kg = toKg(p.bodyweight, p.unit);
  const _bmr = bmr(p), _tdee = tdee(p), adj = phaseAdjustment(p);
  const calories = _tdee + adj;
  let proteinPerKg = 1.8;
  if (p.phaseGoal === 'cutting') proteinPerKg = 2.3;
  else if (p.phaseGoal === 'gaining') proteinPerKg = 2.0;
  const protein_g = Math.round(kg * proteinPerKg);
  let fat_g = Math.round((calories * 0.25) / 9);
  if (fat_g * 9 < calories * 0.15) fat_g = Math.round((calories * 0.15) / 9);
  const fatPerKg = fat_g / kg;
  const carbs_g = Math.max(0, Math.round((calories - protein_g * 4 - fat_g * 9) / 4));
  const carbsPerKg = carbs_g / kg;
  const meals = Math.max(3, Math.min(6, p.mealsPerDay ?? 4));
  return { calories, protein_g, carbs_g, fat_g, proteinPerKg, fatPerKg, carbsPerKg,
    perMealProteinG: Math.round(protein_g / meals), bmr: _bmr, tdee: _tdee, phaseAdjustment: adj };
}

// --- env ---
const envPath = path.join(process.cwd(), '.env.local');
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const EMAIL = 'liftly.demo@gmail.com';
const PASSWORD = 'LiftlyDemo2026!';
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
const sql = postgres(process.env.DATABASE_URL!, { prepare: false, ssl: 'require', max: 1 });
const id = () => crypto.randomUUID();
const ts = (d: Date) => d.getTime();

// --- persona ---
const profile: AthleteProfile = {
  name: 'Marcus Hale',
  email: EMAIL,
  age: 27,
  sex: 'male',
  bodyweight: 84,
  unit: 'kg',
  height: `5'11"`,
  bodyFatPct: 14,
  targetWeightClass: 83,
  experience: 'intermediate',
  currentMaxes: { squat: 185, bench: 125, deadlift: 230 },
  squatStyle: 'high_bar',
  deadliftStance: 'conventional',
  benchGrip: 'medium',
  equipment: 'raw',
  trainingDaysPerWeek: 4,
  goal: 'meet_prep',
  meetDate: '2026-08-22',
  injuries: 'None currently. Mild right shoulder tweak resolved last block.',
  dietaryRestrictions: ['none'],
  phaseGoal: 'gaining',
  mealsPerDay: 4,
  allergies: '',
  foodPreferences: 'High-protein, Mediterranean-leaning. Loves Greek yogurt, salmon, rice.',
};

(async () => {
  try {
    // 1) Create (or reuse) the Clerk user. skipPasswordChecks lets the fixed
    //    demo password through Clerk's breach/strength rules. Emails created
    //    via the Backend API come back already verified, which is what the
    //    claim-by-verified-email path in lib/auth requires on first sign-in.
    const existing = await clerk.users.getUserList({ emailAddress: [EMAIL], limit: 1 });
    const clerkUser =
      existing.data[0] ??
      (await clerk.users.createUser({
        emailAddress: [EMAIL],
        password: PASSWORD,
        skipPasswordChecks: true,
      }));
    const clerkUserId = clerkUser.id;
    console.log('clerk user id:', clerkUserId);

    // 2) Athlete row. Note athletes.id is an INTERNAL uuid, not the auth id —
    //    the Clerk id lives in clerk_user_id. Reuse the existing row's id when
    //    re-running so the fifteen tables cascading off it stay attached.
    const arows = await sql`select id from athletes where email = ${EMAIL} limit 1`;
    const athleteId: string = arows[0]?.id ?? id();

    await sql`insert into athletes (id, email, name, profile_json, clerk_user_id, created_at)
      values (${athleteId}, ${EMAIL}, ${profile.name}, ${JSON.stringify(profile)}, ${clerkUserId}, ${ts(new Date('2026-05-20'))})
      on conflict (id) do update set name = excluded.name, profile_json = excluded.profile_json,
        clerk_user_id = excluded.clerk_user_id`;

    // 3) Program — reuse a real generated 12-week template, retitled for the persona.
    const tmpl = JSON.parse(fs.readFileSync('scripts/.tmpl-program.json', 'utf8'));
    tmpl.athlete = profile.name;
    await sql`delete from programs where athlete_id = ${athleteId}`;
    await sql`insert into programs (id, athlete_id, program_json, current_week, current_block, created_at)
      values (${id()}, ${athleteId}, ${JSON.stringify(tmpl)}, 4, 'Accumulation', ${ts(new Date('2026-05-20'))})`;

    // 4) Session logs — 3 completed weeks, 4 days/week, progressive overload.
    await sql`delete from session_logs where athlete_id = ${athleteId}`;
    const dayPlan = [
      { name: 'Squat Focus', lift: 'Competition Squat', base: 150, reps: 5, acc: 'Pause Squat', accBase: 120 },
      { name: 'Bench Focus (High Intensity)', lift: 'Competition Bench', base: 100, reps: 4, acc: 'Close-Grip Bench', accBase: 82 },
      { name: 'Deadlift Focus', lift: 'Competition Deadlift', base: 185, reps: 3, acc: 'Romanian Deadlift', accBase: 130 },
      { name: 'Bench Focus (Moderate-High Intensity)', lift: 'Competition Bench', base: 92, reps: 6, acc: 'Incline Bench', accBase: 65 },
    ];
    // 12 sessions ending ~5 days ago (today = 2026-06-23), every ~2 days.
    let date = new Date('2026-05-28');
    let inserted = 0;
    for (let w = 0; w < 3; w++) {
      for (let d = 0; d < 4; d++) {
        const p = dayPlan[d];
        const top = p.base + w * 5; // +5kg/week
        const sets = [
          { reps: p.reps, weight: top, actualRPE: 7.5 + w * 0.5 },
          { reps: p.reps, weight: top, actualRPE: 8 + w * 0.5 },
          { reps: p.reps, weight: Math.round(top * 0.95), actualRPE: 8 },
        ];
        const accSets = [
          { reps: 8, weight: p.accBase + w * 2.5, actualRPE: 8 },
          { reps: 8, weight: p.accBase + w * 2.5, actualRPE: 8.5 },
        ];
        const exercises = [
          { exercise: p.lift, sets },
          { exercise: p.acc, sets: accSets },
        ];
        const ds = date.toISOString().slice(0, 10);
        await sql`insert into session_logs (id, athlete_id, date, week_number, day_number, exercises_json, notes, bodyweight, created_at)
          values (${id()}, ${athleteId}, ${ds}, ${w + 1}, ${d + 1}, ${JSON.stringify(exercises)},
                  ${d === 0 ? 'Felt strong, bar speed good.' : null}, ${83 + w * 0.4}, ${ts(date)})`;
        inserted++;
        date = new Date(date.getTime() + 2 * 86400000); // +2 days
      }
      date = new Date(date.getTime() + 86400000); // extra rest day between weeks
    }
    console.log('session_logs:', inserted);

    // 5) Bodyweight logs — gentle upward trend (gaining phase).
    await sql`delete from bodyweight_logs where athlete_id = ${athleteId}`;
    let bwDate = new Date('2026-05-26');
    let bw = 83.0;
    let bwN = 0;
    while (bwDate <= new Date('2026-06-22')) {
      const ds = bwDate.toISOString().slice(0, 10);
      const noise = (Math.random() - 0.5) * 0.5;
      const val = Math.round((bw + noise) * 10) / 10;
      await sql`insert into bodyweight_logs (id, athlete_id, date, bodyweight, created_at)
        values (${id()}, ${athleteId}, ${ds}, ${val}, ${ts(bwDate)})
        on conflict (athlete_id, date) do nothing`;
      bw += 0.06; // ~1.7kg over the month
      bwDate = new Date(bwDate.getTime() + 86400000);
      bwN++;
    }
    console.log('bodyweight_logs:', bwN);

    // 6) Readiness — today, green.
    await sql`delete from readiness_logs where athlete_id = ${athleteId}`;
    await sql`insert into readiness_logs (id, athlete_id, date, sleep, energy, soreness, stress, pain, note, created_at)
      values (${id()}, ${athleteId}, '2026-06-23', 8, 7, 3, 3, 1, 'Ready to push squats today.', ${Date.now()})`;

    // 7) Meal plan — targets computed exactly as the app does (so it is not "stale").
    const targets = macroTargets(profile);
    const meals = [
      { name: 'Breakfast', timing: '7:30 AM', protein_g: 48, carbs_g: 80, fat_g: 18, calories: 674,
        items: [ { food: 'Greek yogurt (0%)', quantity: '300 g' }, { food: 'Oats', quantity: '80 g' }, { food: 'Blueberries', quantity: '100 g' }, { food: 'Whey isolate', quantity: '1 scoop' } ] },
      { name: 'Lunch', timing: '12:30 PM', protein_g: 55, carbs_g: 95, fat_g: 22, calories: 798,
        items: [ { food: 'Chicken breast', quantity: '200 g' }, { food: 'White rice', quantity: '250 g cooked' }, { food: 'Olive oil', quantity: '1 tbsp' }, { food: 'Mixed greens', quantity: '1 bowl' } ] },
      { name: 'Pre/Post-Training', timing: '5:30 PM', protein_g: 40, carbs_g: 90, fat_g: 8, calories: 592,
        items: [ { food: 'Whey isolate', quantity: '1.5 scoops' }, { food: 'Cream of rice', quantity: '100 g' }, { food: 'Banana', quantity: '1 large' } ] },
      { name: 'Dinner', timing: '8:30 PM', protein_g: 55, carbs_g: 70, fat_g: 30, calories: 770,
        items: [ { food: 'Salmon fillet', quantity: '200 g' }, { food: 'Sweet potato', quantity: '250 g' }, { food: 'Avocado', quantity: '1/2' }, { food: 'Asparagus', quantity: '150 g' } ] },
    ];
    const plan: MealPlan = {
      dailyTotals: targets,
      meals,
      preWorkout: 'Cream of rice + whey 60–90 min out; keep fat low for fast digestion.',
      postWorkout: 'Fast carbs + 40 g protein within an hour of the last heavy set.',
      notes: [
        'Protein anchored at ~2.0 g/kg for the gaining phase.',
        'Carbs cycled higher on squat & deadlift days.',
        'Hydration: 3.5–4 L/day; sodium liberal around heavy sessions.',
      ],
    };
    await sql`delete from meal_plans where athlete_id = ${athleteId}`;
    await sql`insert into meal_plans (id, athlete_id, plan_json, targets_json, steer, created_at)
      values (${id()}, ${athleteId}, ${JSON.stringify(plan)}, ${JSON.stringify(targets)}, null, ${Date.now()})`;
    console.log('meal_plan targets:', targets.calories, 'kcal /', targets.protein_g, 'g protein');

    console.log('\nSEED OK →', EMAIL, '/', PASSWORD);
  } catch (e) {
    console.error('SEED FAILED:', e);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
})();
