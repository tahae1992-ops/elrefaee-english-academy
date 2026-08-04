-- Rollback for 0015_units_lessons_learning_rls.sql.
DROP POLICY IF EXISTS "progress_records_select_own" ON "learning"."progress_records";
DROP POLICY IF EXISTS "enrollments_select_own" ON "learning"."enrollments";
DROP POLICY IF EXISTS "lessons_select_authenticated" ON "curriculum"."lessons";
DROP POLICY IF EXISTS "units_select_authenticated" ON "curriculum"."units";
ALTER TABLE "learning"."progress_records" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "learning"."enrollments" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "curriculum"."lessons" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "curriculum"."units" DISABLE ROW LEVEL SECURITY;
