-- migrate:no-transaction
--
-- EXPAND step 2: enforce one athlete per Clerk user, and make the sign-in
-- lookup an index hit rather than a sequential scan.
--
-- Separate file from 001 because CREATE INDEX CONCURRENTLY cannot run inside a
-- transaction block, and the runner wraps every other migration in one.
--
-- A UNIQUE index (not a UNIQUE constraint) is what we want here: Postgres
-- treats NULLs as distinct, so the four roster-invited athletes with no Clerk
-- id coexist happily, while two athletes can never share one Clerk identity.
--
-- CONCURRENTLY is overkill on nineteen rows, but it is the correct habit and
-- costs nothing here. Note it does not roll back cleanly: if this fails it can
-- leave an INVALID index behind, which the .down.sql drops.

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_athletes_clerk_user_id
  ON athletes (clerk_user_id);
