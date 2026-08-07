-- EXPAND step 1 of the Supabase Auth -> Clerk migration.
--
-- Today src/lib/auth.ts treats the Supabase user id AS athletes.id. Fifteen
-- tables cascade off athletes.id, so re-keying the table to Clerk's user ids
-- would mean rewriting every one of them under load. Instead we give athletes a
-- dedicated column for the external auth id and leave athletes.id alone as a
-- stable internal key. After this, swapping auth providers is a one-column
-- change rather than a fifteen-table rewrite.
--
-- Nullable on purpose: existing rows have no Clerk id yet, and four of the
-- nineteen athletes are coach-invited roster rows that have never signed in at
-- all, so this column must stay permanently nullable. Adding a nullable column
-- with no default is instant in Postgres and takes no table rewrite.
--
-- Backfill is deliberately NOT here — it needs the Clerk user export and is a
-- data migration, applied separately at cutover.

ALTER TABLE athletes ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

COMMENT ON COLUMN athletes.clerk_user_id IS
  'Clerk user id (user_...). Null until the athlete first signs in via Clerk. '
  'Lookup key for authentication only — never use it as a foreign key; '
  'athletes.id remains the internal identity that other tables reference.';
