import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { query } from '@/lib/db';
import type { ChatHistoryV1, ChatMessage } from '@liftly/shared-types';

export const dynamic = 'force-dynamic';

// GET chat history for the native app. Sending a message (with streaming +
// coaching context) is handled by POST /api/chat, which already accepts bearer
// auth; the app appends optimistically and re-fetches this on completion.
export async function GET() {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const rows = await query<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: number;
  }>(
    'SELECT id, role, content, created_at FROM chat_messages WHERE athlete_id = ? ORDER BY created_at ASC LIMIT 100',
    [session.id],
  );

  const messages: ChatMessage[] = rows.map((r) => ({
    id: r.id,
    athleteId: session.id,
    role: r.role,
    content: r.content,
    createdAt: r.created_at,
  }));

  const body: ChatHistoryV1 = { v: 1, messages };
  return NextResponse.json(body);
}
