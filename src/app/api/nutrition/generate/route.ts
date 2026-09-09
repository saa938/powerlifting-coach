import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import { execute, queryOne, uuid } from '@/lib/db';
import { isAiKeyError } from '@/lib/ai';
import type { AiMessage } from '@/lib/ai';
import { assertAiAllowed, recordAiCall, QuotaError, RateLimitError } from '@/lib/limits';
import { buildNutritionUserPrompt } from '@/lib/prompts/nutrition';
import { generateValidatedPlan } from '@/lib/nutrition-generate';
import { macroTargets } from '@/lib/calculations';
import type { AthleteProfile } from '@/lib/types';

const Body = z.object({ steer: z.string().max(500).optional() });

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    await assertAiAllowed('athlete', session.id);
  } catch (err) {
    if (err instanceof QuotaError) {
      return NextResponse.json(
        { error: 'You’ve reached your AI generation limit for this period. Upgrade for more.', quota: err.info },
        { status: 402 },
      );
    }
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: 'Too many AI requests — wait a moment and try again.' },
        { status: 429 },
      );
    }
    throw err;
  }

  const raw = await req.json().catch(() => ({}));
  const parsed = Body.safeParse(raw ?? {});
  const steer = parsed.success ? parsed.data.steer?.trim() || null : null;

  const row = await queryOne<{ profile_json: string }>(
    'SELECT profile_json FROM athletes WHERE id = ?',
    [session.id],
  );
  if (!row?.profile_json) {
    return NextResponse.json({ error: 'profile missing' }, { status: 400 });
  }
  const profile = JSON.parse(row.profile_json) as AthleteProfile;
  const targets = macroTargets(profile);

  const messages: AiMessage[] = [
    { role: 'user', content: buildNutritionUserPrompt(profile, targets, steer ?? undefined) },
  ];

  let plan;
  let violations;
  try {
    ({ plan, violations } = await generateValidatedPlan(profile, messages));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'AI call failed';
    return NextResponse.json({ error: msg }, { status: isAiKeyError(err) ? 400 : 502 });
  }

  if (!plan) {
    if (violations.length) {
      return NextResponse.json(
        {
          error:
            'Could not generate a plan that fully meets your dietary restrictions/allergies. ' +
            'Try simplifying them or generating again.',
          violations,
        },
        { status: 422 },
      );
    }
    return NextResponse.json({ error: 'failed to parse meal plan' }, { status: 500 });
  }

  const id = uuid();
  const createdAt = Date.now();
  await execute(
    'INSERT INTO meal_plans (id, athlete_id, plan_json, targets_json, steer, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, session.id, JSON.stringify(plan), JSON.stringify(targets), steer, createdAt],
  );
  await recordAiCall('athlete', session.id, 'nutrition');

  return NextResponse.json({ ok: true, plan, id, createdAt, steer });
}
