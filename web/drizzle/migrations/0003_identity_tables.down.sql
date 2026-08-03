-- Rollback for 0003_identity_tables.sql.
-- Safe while these tables are empty of real (non-seed) data — same
-- caveat as 0000's and 0001's rollbacks: revisit before running this
-- once any real user/role/academy row exists.
DROP TABLE IF EXISTS "identity"."refresh_token_registry";
DROP TABLE IF EXISTS "identity"."user_roles";
DROP TABLE IF EXISTS "identity"."role_permissions";
DROP TABLE IF EXISTS "identity"."user_profiles";
DROP TABLE IF EXISTS "identity"."roles";
DROP TABLE IF EXISTS "identity"."permissions";
DROP TABLE IF EXISTS "academy"."academies";
DROP TYPE IF EXISTS "shared"."cefr_level";
