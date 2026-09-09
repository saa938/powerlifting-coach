import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { query } from '@/lib/db';
import type { FormCheckListV1, LiftType, RpeConfidence } from '@liftly/shared-types';

export const dynamic = 'force-dynamic';

export async function GET() {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const rows = await query<{
    id: string;
    lift_type: string;
    estimated_rpe: number | null;
    rpe_confidence: string | null;
    created_at: number;
  }>(
    'SELECT id, lift_type, estimated_rpe, rpe_confidence, created_at FROM form_checks WHERE athlete_id = ? ORDER BY created_at DESC LIMIT 50',
    [session.id],
  );

  const body: FormCheckListV1 = {
    v: 1,
    items: rows.map((r) => ({
      id: r.id,
      liftType: r.lift_type as LiftType,
      createdAt: r.created_at,
      estimatedRPE: r.estimated_rpe,
      rpeConfidence: (r.rpe_confidence as RpeConfidence | null) ?? null,
      thumbnailUrl: null,
    })),
  };
  return NextResponse.json(body);
}
