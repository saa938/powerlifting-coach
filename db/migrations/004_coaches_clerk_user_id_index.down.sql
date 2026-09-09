-- migrate:no-transaction
--
-- Rollback for 004. Never run automatically. CONCURRENTLY on the way out so it
-- does not block reads or writes on coaches; IF EXISTS also cleans up an
-- INVALID index left behind by a failed CREATE INDEX CONCURRENTLY in 004.

DROP INDEX CONCURRENTLY IF EXISTS idx_coaches_clerk_user_id;
DELETE FROM schema_migrations WHERE name = '004_coaches_clerk_user_id_index.sql';
