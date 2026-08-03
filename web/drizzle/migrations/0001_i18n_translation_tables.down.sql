-- Rollback for 0001_i18n_translation_tables.sql.
-- Safe while these tables are empty of real (non-seed) data — same
-- caveat as 0000's rollback: revisit before running this once any
-- academy admin has actually edited a template through the CMS.
DROP TABLE IF EXISTS "notifications"."templates";
DROP TABLE IF EXISTS "shared"."certificate_templates";
DROP TABLE IF EXISTS "shared"."supported_locales";
