// Coach auth — the coach identity for a Clerk user.
//
// This used to be a `pl_coach_session` cookie holding a raw coach id, minted by
// POST /api/coach/auth/login from nothing but a submitted email address. That
// meant anyone could assume any coach's session by typing their email, and
// because admin rights are derived from the session coach's email via
// ADMIN_EMAILS, typing an admin's email granted the admin console. Both the
// cookie and that route are gone: a coach session is now a Clerk session whose
// verified identity resolves to a coaches row.
//
// One Clerk user can be both a lifter and a coach — the two are separate rows
// keyed by the same clerk_user_id, which is what the old two-cookie setup was
// really buying. Every coach-initiated read/write on an athlete must still go
// through requireCoachOwns — that is the tenant-isolation boundary.
import { execute, queryOne, uuid } from './db';
import { clerkUserId, clerkVerifiedIdentity } from './clerk-identity';

export interface SessionCoach {
  id: string;
  email: string;
  name: string | null;
}

interface CoachRow extends SessionCoach {
  clerk_user_id: string | null;
}

const COLUMNS = 'id, email, name, clerk_user_id';

function toSession(row: CoachRow): SessionCoach {
  return { id: row.id, email: row.email, name: row.name };
}

/**
 * The coaches row for the signed-in Clerk user, or null.
 *
 * Deliberately does NOT create anything: being signed in does not make you a
 * coach. Provisioning happens only through enrollCurrentUserAsCoach(), from the
 * one explicit opt-in on the coach sign-in page.
 */
export async function getCoachSession(): Promise<SessionCoach | null> {
  const userId = await clerkUserId();
  if (!userId) return null;

  const linked = await queryOne<CoachRow>(
    `SELECT ${COLUMNS} FROM coaches WHERE clerk_user_id = ?`,
    [userId],
  );
  if (linked) return toSession(linked);

  return claimCoachByEmail(userId);
}

/**
 * Bind a Clerk identity to a pre-existing coaches row by verified email — the
 * coaches who predate Clerk, and rows seeded by scripts/seed-coaches. Same
 * atomic claim as lib/auth: guarded UPDATE, then re-read and verify ownership
 * before trusting it. Returns null when no coach row matches.
 */
async function claimCoachByEmail(userId: string): Promise<SessionCoach | null> {
  const identity = await clerkVerifiedIdentity();
  if (!identity) return null;

  const existing = await queryOne<CoachRow>(
    `SELECT ${COLUMNS} FROM coaches WHERE email = ?`,
    [identity.email],
  );
  if (!existing) return null;
  if (existing.clerk_user_id && existing.clerk_user_id !== userId) return null;

  await execute(
    'UPDATE coaches SET clerk_user_id = ?, name = COALESCE(name, ?) WHERE id = ? AND clerk_user_id IS NULL',
    [userId, identity.name, existing.id],
  );

  const claimed = await queryOne<CoachRow>(`SELECT ${COLUMNS} FROM coaches WHERE id = ?`, [
    existing.id,
  ]);
  if (!claimed || claimed.clerk_user_id !== userId) return null;
  return toSession(claimed);
}

/**
 * Turn the signed-in Clerk user into a coach: claim an existing row by verified
 * email, or create one. The single provisioning entry point, called only by
 * POST /api/coach/auth/enroll behind an explicit button on the sign-in page.
 * Returns null if there is no signed-in, email-verified Clerk user.
 */
export async function enrollCurrentUserAsCoach(): Promise<SessionCoach | null> {
  const userId = await clerkUserId();
  if (!userId) return null;

  const existing = await getCoachSession();
  if (existing) return existing;

  const identity = await clerkVerifiedIdentity();
  if (!identity) return null;

  await execute(
    'INSERT INTO coaches (id, email, name, clerk_user_id, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING',
    [uuid(), identity.email, identity.name, userId, Date.now()],
  );

  // Read back rather than assuming the insert won: a concurrent double-submit
  // no-ops on the email unique index, and the row it collided with is the one
  // this user should get.
  return getCoachSession();
}

export async function requireCoach(): Promise<SessionCoach> {
  const s = await getCoachSession();
  if (!s) throw new Error('UNAUTHORIZED');
  return s;
}

export async function coachOwnsAthlete(coachId: string, athleteId: string): Promise<boolean> {
  const row = await queryOne(
    "SELECT 1 AS one FROM coach_athletes WHERE coach_id = ? AND athlete_id = ? AND status = 'active'",
    [coachId, athleteId],
  );
  return !!row;
}

// The object-level authorization gate for every coach action on an athlete.
export async function requireCoachOwns(athleteId: string): Promise<SessionCoach> {
  const coach = await requireCoach();
  if (!(await coachOwnsAthlete(coach.id, athleteId))) throw new Error('FORBIDDEN');
  return coach;
}
