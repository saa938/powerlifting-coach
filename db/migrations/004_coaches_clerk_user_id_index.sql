-- migrate:no-transaction
--
-- EXPAND step 4: one coach per Clerk user, and an indexed sign-in lookup.
-- Separate file from 003 because CREATE INDEX CONCURRENTLY cannot run inside a
-- transaction block. NULLs are distinct in a UNIQUE index, so coach rows that
-- have not yet been claimed by a verified Clerk sign-in coexist fine.

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_coaches_clerk_user_id
  ON coaches (clerk_user_id);
