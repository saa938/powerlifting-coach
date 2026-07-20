import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { execute, queryOne } from '@/lib/db';
import type { ProfileV1 } from '@liftly/shared-types';

export const dynamic = 'force-dynamic';

export async function GET() {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const row = await queryOne<{ profile_json: string | null; name: string | null }>(
    'SELECT profile_json, name FROM athletes WHERE id = ?',
    [session.id],
  );
  const profile = row?.profile_json
    ? (JSON.parse(row.profile_json) as Record<string, unknown>)
    : null;

  const body: ProfileV1 = {
    v: 1,
    hasProfile: !!profile,
    profile,
    email: session.email,
    name: row?.name ?? session.name,
  };
  return NextResponse.json(body);
}

export async function PUT(req: NextRequest) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const incoming = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!incoming || typeof incoming !== 'object') {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  // Merge over any existing profile so partial edits don't wipe fields.
  const row = await queryOne<{ profile_json: string | null }>(
    'SELECT profile_json FROM athletes WHERE id = ?',
    [session.id],
  );
  const existing = row?.profile_json ? (JSON.parse(row.profile_json) as Record<string, unknown>) : {};
  const merged = { ...existing, ...incoming };
  const name = typeof merged.name === 'string' ? merged.name : session.name;

  await execute('UPDATE athletes SET name = ?, profile_json = ? WHERE id = ?', [
    name,
    JSON.stringify(merged),
    session.id,
  ]);

  const body: ProfileV1 = {
    v: 1,
    hasProfile: true,
    profile: merged,
    email: session.email,
    name: name ?? null,
  };
  return NextResponse.json(body);
}
