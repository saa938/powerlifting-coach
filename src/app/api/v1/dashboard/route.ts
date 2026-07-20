import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { getProgramData } from '@/lib/program';
import { assessReadinessLog } from '@/lib/readiness';
import type { DashboardV1, ReadinessLog } from '@liftly/shared-types';

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

/** Consecutive-day streak ending today or yesterday. */
function streakFrom(dates: string[]): number {
  if (dates.length === 0) return 0;
  const set = new Set(dates);
  const day = new Date();
  // Allow the streak to "hold" if they haven't logged yet today.
  if (!set.has(day.toISOString().slice(0, 10))) day.setUTCDate(day.getUTCDate() - 1);
  let streak = 0;
  while (set.has(day.toISOString().slice(0, 10))) {
    streak += 1;
    day.setUTCDate(day.getUTCDate() - 1);
  }
  return streak;
}

export async function GET() {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const programData = await getProgramData(session.id);
  const unit = programData?.profile.unit ?? 'lbs';

  let today: DashboardV1['today'] = null;
  if (programData) {
    const week =
      programData.program.weeks.find((w) => w.weekNumber === programData.currentWeek) ??
      programData.program.weeks[0];
    const day = week?.days[0];
    if (week && day) {
      today = {
        weekNumber: week.weekNumber,
        dayNumber: day.dayNumber,
        dayName: day.dayName,
        exerciseCount: day.exercises.length,
      };
    }
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const rRow = await queryOne<ReadinessRow>(
    'SELECT id, date, sleep, energy, soreness, stress, pain, pain_note, note, created_at FROM readiness_logs WHERE athlete_id = ? AND date = ?',
    [session.id, todayIso],
  );
  const readinessToday = rRow ? assessReadinessLog(rowToLog(session.id, rRow)) : null;

  const dateRows = await query<{ date: string }>(
    'SELECT DISTINCT date FROM session_logs WHERE athlete_id = ? ORDER BY date DESC',
    [session.id],
  );
  const dates = dateRows.map((d) => d.date);

  const body: DashboardV1 = {
    v: 1,
    name: session.name,
    hasProfile: session.hasProfile,
    unit,
    today,
    readinessToday,
    streakDays: streakFrom(dates),
    lastSessionDate: dates[0] ?? null,
  };
  return NextResponse.json(body);
}
