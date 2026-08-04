-- Rollback for 0011_curriculum_tables.sql.
DROP TABLE IF EXISTS "curriculum"."courses";
DROP TABLE IF EXISTS "curriculum"."content_items";
DROP TYPE IF EXISTS "shared"."content_type";
DROP TYPE IF EXISTS "shared"."content_status";
