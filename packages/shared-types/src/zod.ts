// Runtime validation schemas shared by the API (request parsing) and the mobile
// client (optimistic validation before send). Keep these in lockstep with the
// domain types in ./types.ts.
import { z } from 'zod';

const score1to10 = z.number().int().min(1).max(10);

/** Daily readiness self-report (POST /api/v1/readiness). */
export const readinessInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // ISO yyyy-mm-dd
  sleep: score1to10,
  energy: score1to10,
  soreness: score1to10,
  stress: score1to10,
  pain: score1to10.nullable().default(null),
  painNote: z.string().max(500).nullable().default(null),
  note: z.string().max(1000).nullable().default(null),
});
export type ReadinessInput = z.infer<typeof readinessInputSchema>;

/** One logged working set. */
export const sessionSetSchema = z.object({
  reps: z.number().int().min(0).max(100),
  weight: z.number().min(0).max(2000),
  actualRPE: z.number().min(1).max(10),
});

/** One exercise's worth of logged sets. */
export const sessionExerciseSchema = z.object({
  exercise: z.string().min(1),
  sets: z.array(sessionSetSchema).min(1),
});

/** Session log submission (POST /api/v1/session/log). */
export const sessionLogInputSchema = z.object({
  weekNumber: z.number().int().min(1),
  dayNumber: z.number().int().min(1),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  exercises: z.array(sessionExerciseSchema).min(1),
  bodyweight: z.number().min(0).max(700).optional(),
  notes: z.string().max(2000).optional(),
});
export type SessionLogInput = z.infer<typeof sessionLogInputSchema>;

/** Chat turn (POST /api/v1/chat). */
export const chatSendSchema = z.object({
  message: z.string().min(1).max(4000),
});
export type ChatSendInput = z.infer<typeof chatSendSchema>;

/** Nutrition generation trigger (POST /api/v1/nutrition/generate). */
export const nutritionGenerateSchema = z.object({
  steer: z.string().max(2000).optional(),
  optimize: z.boolean().optional(),
});
export type NutritionGenerateInput = z.infer<typeof nutritionGenerateSchema>;
