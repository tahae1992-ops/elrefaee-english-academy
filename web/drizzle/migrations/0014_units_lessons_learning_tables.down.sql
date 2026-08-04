-- Rollback for 0014_units_lessons_learning_tables.sql.
DROP TABLE IF EXISTS "learning"."progress_records";
DROP TABLE IF EXISTS "learning"."enrollments";
DROP TABLE IF EXISTS "curriculum"."lessons";
DROP TABLE IF EXISTS "curriculum"."units";
