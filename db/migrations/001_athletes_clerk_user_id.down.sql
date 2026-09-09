-- Rollback for 001. Never run automatically.
--
-- Safe only while no code reads athletes.clerk_user_id — i.e. before the Clerk
-- cutover, or after a full revert to the Supabase Auth code path. Dropping this
-- column discards the mapping between athletes and their Clerk identities, so
-- re-running the backfill from the Clerk export would be required to restore
-- it. Everything else about an athlete is untouched: athletes.id and all
-- fifteen dependent tables are unaffected, which is the point of the design.

ALTER TABLE athletes DROP COLUMN IF EXISTS clerk_user_id;
DELETE FROM schema_migrations WHERE name = '001_athletes_clerk_user_id.sql';
