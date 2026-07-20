import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { execute, uuid } from '@/lib/db';
import { liftOf } from '@/lib/programming';
import { computeHandoff } from '@/lib/handoff';
import { sessionLogInputSchema, type SessionLogResultV1 } from '@liftly/shared-types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const parsed = sessionLogInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  const input = parsed.data;
  const date = input.date ?? new Date().toISOString().slice(0, 10);

  const id = uuid();
  await execute(
    'INSERT INTO session_logs (id, athlete_id, date, week_number, day_number, exercises_json, notes, bodyweight, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      session.id,
      date,
      input.weekNumber,
      input.dayNumber,
      JSON.stringify(input.exercises),
      input.notes ?? null,
      input.bodyweight ?? null,
      Date.now(),
    ],
  );

  if (input.bodyweight) {
    await execute(
      `INSERT INTO bodyweight_logs (id, athlete_id, date, bodyweight, created_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(athlete_id, date) DO UPDATE SET bodyweight = excluded.bodyweight`,
      [uuid(), session.id, date, input.bodyweight, Date.now()],
    );
  }

  const loggedLifts = [...new Set(input.exercises.map((e) => liftOf(e.exercise)))];
  const handoff = await computeHandoff(session.id, loggedLifts, input.weekNumber, input.dayNumber);

  const body: SessionLogResultV1 = {
    v: 1,
    ok: true,
    sessionId: id,
    adaptations: handoff.adaptations,
    filmLift: handoff.filmLift,
  };
  return NextResponse.json(body);
}
