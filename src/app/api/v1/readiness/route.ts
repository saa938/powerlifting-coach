import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { execute, query, uuid } from '@/lib/db';
import { assessReadinessLog } from '@/lib/readiness';
import { readinessInputSchema, type ReadinessGetV1, type ReadinessLog } from '@liftly/shared-types';

export const dynamic = 'force-dynamic';

interface ReadinessRow {
  id: string;
  date: string;
  sleep: number;
  energy: number;
  soreness: number;
  stress: number;
  pain: number | null;
  pain_note: string | null;
  note: string | null;
  created_at: number;
}

function rowToLog(athleteId: string, r: ReadinessRow): ReadinessLog {
  return {
    id: r.id,
    athleteId,
    date: r.date,
    sleep: r.sleep,
    energy: r.energy,
    soreness: r.soreness,
    stress: r.stress,
    pain: r.pain,
    painNote: r.pain_note,
    note: r.note,
    createdAt: r.created_at,
  };
}

async function buildResponse(athleteId: string): Promise<ReadinessGetV1> {
  const rows = await query<ReadinessRow>(
    'SELECT id, date, sleep, energy, soreness, stress, pain, pain_note, note, created_at FROM readiness_logs WHERE athlete_id = ? ORDER BY date DESC LIMIT 30',
    [athleteId],
  );
  const history = rows.map((r) => rowToLog(athleteId, r));
  const todayIso = new Date().toISOString().slice(0, 10);
  const today = history.find((h) => h.date === todayIso) ?? null;
  return {
    v: 1,
    today,
    assessment: today ? assessReadinessLog(today) : null,
    history,
  };
}

export async function GET() {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return NextResponse.json(await buildResponse(session.id));
}

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const parsed = readinessInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  const b = parsed.data;

  await execute(
    `INSERT INTO readiness_logs
       (id, athlete_id, date, sleep, energy, soreness, stress, pain, pain_note, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(athlete_id, date) DO UPDATE SET
       sleep = excluded.sleep, energy = excluded.energy, soreness = excluded.soreness,
       stress = excluded.stress, pain = excluded.pain, pain_note = excluded.pain_note,
       note = excluded.note`,
    [uuid(), session.id, b.date, b.sleep, b.energy, b.soreness, b.stress, b.pain, b.painNote, b.note, Date.now()],
  );

  return NextResponse.json(await buildResponse(session.id));
}
