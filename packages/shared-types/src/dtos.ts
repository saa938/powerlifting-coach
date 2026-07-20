// Versioned mobile API DTOs (the `/api/v1/*` surface). Additive-only: never
// remove or repurpose a field — add new optional fields so older app builds keep
// working. Each response carries `v` for future migrations.
import type {
  Unit,
  ProgramWeek,
  ReadinessAssessment,
  ReadinessLog,
  MealPlan,
  MacroTargets,
  ChatMessage,
  FormCheckResult,
  LiftType,
  RpeConfidence,
} from './types';

export interface ProgramV1 {
  v: 1;
  hasProgram: boolean;
  unit?: Unit;
  programId?: string;
  name?: string;
  currentBlock?: string;
  currentWeek?: number;
  totalWeeks?: number;
  week?: ProgramWeek | null;
}

export interface DashboardV1 {
  v: 1;
  name: string | null;
  hasProfile: boolean;
  unit: Unit;
  today: {
    weekNumber: number;
    dayNumber: number;
    dayName: string;
    exerciseCount: number;
  } | null;
  readinessToday: ReadinessAssessment | null;
  streakDays: number;
  lastSessionDate: string | null;
}

export interface ProgressE1RMPointV1 {
  date: string; // ISO yyyy-mm-dd
  squat?: number;
  bench?: number;
  deadlift?: number;
  total?: number;
}

export interface ProgressBWPointV1 {
  date: string;
  bw: number;
  rolling7?: number;
}

export interface ProgressVolumePointV1 {
  week: string; // ISO yyyy-mm-dd, start of week
  squat: number;
  bench: number;
  deadlift: number;
}

export interface ProgressPRSetV1 {
  squat: number | null;
  bench: number | null;
  deadlift: number | null;
  total: number | null;
}

/**
 * Native Progress surface. Thin, versioned DTO derived from the same
 * `getProgressData` the web server component uses, plus a server-computed PR
 * summary so the Android/iOS clients stay thin.
 */
export interface ProgressV1 {
  v: 1;
  unit: Unit;
  summary: {
    best: ProgressPRSetV1;
    current: ProgressPRSetV1;
    latestBodyweight: number | null;
  };
  e1rms: ProgressE1RMPointV1[];
  bodyweight: ProgressBWPointV1[];
  volume: ProgressVolumePointV1[];
}

export interface ReadinessGetV1 {
  v: 1;
  today: ReadinessLog | null;
  assessment: ReadinessAssessment | null;
  history: ReadinessLog[];
}

export interface SessionLogResultV1 {
  v: 1;
  ok: true;
  sessionId: string;
  adaptations: {
    lift: LiftType;
    exerciseName: string;
    whenLabel: string;
    plannedWeight: number;
    suggestedWeight: number;
    reason: string;
    deload: boolean;
    changed: boolean;
    unit: Unit;
  }[];
  filmLift: 'squat' | 'bench' | 'deadlift' | null;
}

export interface NutritionV1 {
  v: 1;
  targets: MacroTargets | null;
  plan: MealPlan | null;
  steer: string | null;
  stale: boolean;
  createdAt: number | null;
}

export interface ChatHistoryV1 {
  v: 1;
  messages: ChatMessage[];
}

export interface FormCheckListItemV1 {
  id: string;
  liftType: LiftType;
  createdAt: number;
  estimatedRPE: number | null;
  rpeConfidence: RpeConfidence | null;
  thumbnailUrl: string | null;
}

export interface FormCheckListV1 {
  v: 1;
  items: FormCheckListItemV1[];
}

export interface FormCheckDetailV1 {
  v: 1;
  result: FormCheckResult;
}

/** Signed direct-upload ticket so large videos skip the API body limit. */
export interface FormCheckUploadTicketV1 {
  v: 1;
  uploadUrl: string;
  method: 'PUT' | 'POST';
  headers?: Record<string, string>;
  storagePath: string;
  formCheckId: string;
}

export interface UsageV1 {
  v: 1;
  plan: 'free' | 'pro' | 'coach';
  accountType: 'athlete' | 'coach';
  limits: Record<string, { used: number; limit: number | null }>;
}

export interface ProfileV1 {
  v: 1;
  hasProfile: boolean;
  // The full AthleteProfile JSON when present (kept loose here so the mobile
  // onboarding form owns the field-level shape via the Zod schema).
  profile: Record<string, unknown> | null;
  email: string;
  name: string | null;
}

export interface OkV1 {
  v: 1;
  ok: true;
}

export interface EntitlementSyncV1 {
  v: 1;
  ok: true;
  plan: 'free' | 'pro' | 'coach';
}
