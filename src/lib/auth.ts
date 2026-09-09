// Auth: Clerk owns the session; Postgres owns the athlete row.
//
// athletes.id is an internal key that fifteen tables cascade off, and it is NOT
// the auth provider's id. The provider's id lives in athletes.clerk_user_id
// (added by db/migrations/001). That indirection is the whole reason this file
// changed provider without a fifteen-table rewrite — keep it that way: never
// reintroduce "the auth id IS athletes.id".
//
// Sign-in/sign-up UI is Clerk's <SignIn/> (see app/login); sign-out is Clerk's
// signOut() from the nav. There is no local file DB here — all access goes
// through the Postgres helpers in ./db (Vercel's filesystem is read-only).
import { execute, queryOne, uuid } from './db';
import { clerkUserId, clerkVerifiedIdentity } from './clerk-identity';

export interface SessionAthlete {
  id: string;
  email: string;
  name: string | null;
  hasProfile: boolean;
}

interface AthleteRow {
  id: string;
  email: string;
  name: string | null;
  profile_json: string | null;
  clerk_user_id: string | null;
}

const COLUMNS = 'id, email, name, profile_json, clerk_user_id';

function toSession(row: AthleteRow): SessionAthlete {
  return { id: row.id, email: row.email, name: row.name, hasProfile: !!row.profile_json };
}

export async function getSession(): Promise<SessionAthlete | null> {
  // Cookie-only check — no Clerk API call. Native shells that send
  // `Authorization: Bearer <clerk session token>` instead of a cookie are
  // handled by Clerk's middleware, so they need nothing special here.
  const userId = await clerkUserId();
  if (!userId) return null;

  const linked = await queryOne<AthleteRow>(
    `SELECT ${COLUMNS} FROM athletes WHERE clerk_user_id = ?`,
    [userId],
  );
  if (linked) return toSession(linked);

  // No row carries this Clerk id yet — first sign-in for this identity.
  return linkAthlete(userId);
}

/**
 * Bind a Clerk identity to an athlete row, exactly once per user.
 *
 * Three cases, in order:
 *  1. An athlete already exists with this VERIFIED email — a lifter who
 *     predates Clerk, or a roster row a coach pre-created by email. Claim it,
 *     so they keep their program, logs and coach link instead of forking a
 *     second account.
 *  2. Someone already claimed that email under a different Clerk id. Refuse:
 *     handing over the row would be account takeover.
 *  3. Nobody matches — provision a fresh athlete under a NEW internal uuid.
 */
async function linkAthlete(userId: string): Promise<SessionAthlete | null> {
  const identity = await clerkVerifiedIdentity();
  // No verified primary email → not safe to match anyone. Callers see this as
  // logged out; Clerk's own flows will have the user verify before they land.
  if (!identity) return null;
  const { email, name } = identity;

  const existing = await queryOne<AthleteRow>(
    `SELECT ${COLUMNS} FROM athletes WHERE email = ?`,
    [email],
  );

  if (existing) {
    if (existing.clerk_user_id && existing.clerk_user_id !== userId) return null;

    // `AND clerk_user_id IS NULL` makes the claim atomic: if a concurrent first
    // request already claimed the row, this updates nothing rather than
    // stealing it. COALESCE fills in a name only when the row has none, so a
    // coach-typed roster name is never overwritten by the Clerk profile.
    await execute(
      'UPDATE athletes SET clerk_user_id = ?, name = COALESCE(name, ?) WHERE id = ? AND clerk_user_id IS NULL',
      [userId, name, existing.id],
    );

    // Re-read rather than trusting the pre-update snapshot: the guard above may
    // have matched zero rows, and returning a session for a row we do not own
    // is the one mistake this whole file exists to prevent.
    const claimed = await queryOne<AthleteRow>(
      `SELECT ${COLUMNS} FROM athletes WHERE id = ?`,
      [existing.id],
    );
    if (!claimed || claimed.clerk_user_id !== userId) return null;
    return toSession(claimed);
  }

  // ON CONFLICT DO NOTHING covers the race where two first requests arrive
  // together: one insert wins on the email/clerk_user_id unique indexes and the
  // other no-ops, then both read back the winner.
  await execute(
    'INSERT INTO athletes (id, email, name, clerk_user_id, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING',
    [uuid(), email, name, userId, Date.now()],
  );

  const created = await queryOne<AthleteRow>(
    `SELECT ${COLUMNS} FROM athletes WHERE clerk_user_id = ?`,
    [userId],
  );
  return created ? toSession(created) : null;
}

export async function requireSession(): Promise<SessionAthlete> {
  const s = await getSession();
  if (!s) throw new Error('UNAUTHORIZED');
  return s;
}

// Get-or-create by email, for flows where the athlete hasn't signed in yet
// (coach roster invites). Deliberately leaves clerk_user_id null — the row is
// unclaimed until that person signs in through Clerk themselves, at which point
// linkAthlete() above adopts it by verified email.
export async function getOrCreateAthleteByEmail(
  email: string,
  name?: string,
): Promise<SessionAthlete> {
  const normalized = email.trim().toLowerCase();
  const existing = await queryOne<AthleteRow>(
    `SELECT ${COLUMNS} FROM athletes WHERE email = ?`,
    [normalized],
  );
  if (existing) return toSession(existing);

  const id = uuid();
  await execute('INSERT INTO athletes (id, email, name, created_at) VALUES (?, ?, ?, ?)', [
    id,
    normalized,
    name ?? null,
    Date.now(),
  ]);
  return { id, email: normalized, name: name ?? null, hasProfile: false };
}
