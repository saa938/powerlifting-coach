-- EXPAND step 3: the same external-auth-id column for coaches.
--
-- Mirrors 001 for the coaches table, because coach identity is moving to Clerk
-- alongside athlete identity. Eleven tables cascade off coaches.id, so as with
-- athletes we keep coaches.id as the internal key and authenticate against this
-- column instead.
--
-- This one is not merely a provider swap. Coach login today is
-- POST /api/coach/auth/login -> getOrCreateCoach(email) -> setCoachSession(id),
-- with no password, no email verification and no token: submitting a coach's
-- email is sufficient to assume their session, and because admin rights are
-- derived from the logged-in coach's email via ADMIN_EMAILS, submitting an
-- admin's email grants the admin console. Populating this column is what makes
-- a coach session provable rather than asserted.
--
-- Nullable for the same reason as athletes.clerk_user_id: existing coach rows
-- have no Clerk identity until their first verified sign-in, and coaches can be
-- created as records before anyone signs in as them.

ALTER TABLE coaches ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

COMMENT ON COLUMN coaches.clerk_user_id IS
  'Clerk user id (user_...). Null until the coach first signs in via Clerk. '
  'Lookup key for authentication only — never use it as a foreign key; '
  'coaches.id remains the internal identity that other tables reference.';
