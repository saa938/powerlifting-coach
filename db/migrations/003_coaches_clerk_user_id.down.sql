-- Rollback for 003. Never run automatically.
--
-- Safe only while no code reads coaches.clerk_user_id. Dropping it discards the
-- coach-to-Clerk mapping and returns coach authentication to the unverified
-- email path — do not roll this back and leave it there. coaches.id and the
-- eleven tables that reference it are untouched.

ALTER TABLE coaches DROP COLUMN IF EXISTS clerk_user_id;
DELETE FROM schema_migrations WHERE name = '003_coaches_clerk_user_id.sql';
