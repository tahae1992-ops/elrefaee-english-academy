-- Rollback for 0012_curriculum_tables_rls.sql.
DROP POLICY IF EXISTS "courses_select_authenticated" ON "curriculum"."courses";
DROP POLICY IF EXISTS "content_items_select_published" ON "curriculum"."content_items";
ALTER TABLE "curriculum"."courses" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "curriculum"."content_items" DISABLE ROW LEVEL SECURITY;
