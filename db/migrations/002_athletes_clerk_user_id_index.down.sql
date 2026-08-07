-- migrate:no-transaction
--
-- Rollback for 002. Never run automatically.
--
-- CONCURRENTLY on the way out too, so dropping the index does not block reads
-- or writes on athletes. IF EXISTS also cleans up an INVALID index left behind
-- by a failed CREATE INDEX CONCURRENTLY in 002.

DROP INDEX CONCURRENTLY IF EXISTS idx_athletes_clerk_user_id;
DELETE FROM schema_migrations WHERE name = '002_athletes_clerk_user_id_index.sql';
