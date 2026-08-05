-- RLS for the Review Engine's vocabulary/XP tables (SRS §12.2).
--
-- vocabulary_entries: read-only reference/authored data, same
-- open-SELECT pattern as units/lessons (0015_units_lessons_learning_rls.sql)
-- -- the row itself isn't sensitive; actual visibility (published only)
-- is enforced in the application layer's repository query, matching the
-- existing exercise/lesson convention.
--
-- vocabulary_review_state/xp_transactions/xp_balances: self-scoped
-- SELECT only, same zero-client-write pattern as
-- enrollments/progress_records/exercise_attempts -- all writes go
-- through the service-role connection via each module's use-cases,
-- never directly from a client role.
ALTER TABLE "curriculum"."vocabulary_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "learning"."vocabulary_review_state" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "engagement"."xp_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "engagement"."xp_balances" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vocabulary_entries_select_authenticated" ON "curriculum"."vocabulary_entries"
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "vocabulary_review_state_select_own" ON "learning"."vocabulary_review_state"
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "xp_transactions_select_own" ON "engagement"."xp_transactions"
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "xp_balances_select_own" ON "engagement"."xp_balances"
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
