-- Rollback for 0018_exercise_attempts_rls.sql.
DROP POLICY IF EXISTS "exercise_attempts_select_own" ON "learning"."exercise_attempts";
ALTER TABLE "learning"."exercise_attempts" DISABLE ROW LEVEL SECURITY;
