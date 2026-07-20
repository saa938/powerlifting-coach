import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import type { FormCheckDetailV1, CvAnalysis, FormCheckResult, LiftType, RpeConfidence } from '@liftly/shared-types';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const row = await queryOne<{
    id: string;
    lift_type: string;
    video_path: string | null;
    frames_count: number;
    user_context: string;
    ai_analysis: string;
    estimated_rpe: number | null;
    rpe_confidence: string | null;
    load_kg: number | null;
    cv_json: string | null;
    created_at: number;
  }>(
    'SELECT id, lift_type, video_path, frames_count, user_context, ai_analysis, estimated_rpe, rpe_confidence, load_kg, cv_json, created_at FROM form_checks WHERE id = ? AND athlete_id = ?',
    [params.id, session.id],
  );

  if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });

  let cv: CvAnalysis | null = null;
  if (row.cv_json) {
    try {
      cv = JSON.parse(row.cv_json) as CvAnalysis;
    } catch {
      cv = null;
    }
  }

  const result: FormCheckResult = {
    id: row.id,
    athleteId: session.id,
    liftType: row.lift_type as LiftType,
    videoPath: row.video_path,
    framesCount: row.frames_count,
    userContext: row.user_context,
    aiAnalysis: row.ai_analysis,
    estimatedRPE: row.estimated_rpe,
    rpeConfidence: (row.rpe_confidence as RpeConfidence | null) ?? null,
    loadKg: row.load_kg,
    cv,
    createdAt: row.created_at,
  };

  const body: FormCheckDetailV1 = { v: 1, result };
  return NextResponse.json(body);
}
