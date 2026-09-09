import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { athleteEntitlement } from '@/lib/limits';
import type { UsageV1 } from '@liftly/shared-types';

export const dynamic = 'force-dynamic';

export async function GET() {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const ent = await athleteEntitlement(session.id);

  const body: UsageV1 = {
    v: 1,
    plan: ent.plan,
    accountType: 'athlete',
    limits: {},
  };
  return NextResponse.json(body);
}
