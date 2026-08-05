-- RLS for the Gamification Engine's tables (SRS §12.2).
--
-- streaks/daily_goals: self-scoped SELECT only, same zero-client-write
-- pattern as xp_transactions/xp_balances/vocabulary_review_state — all
-- writes go through the service-role connection via this module's
-- use-cases, never directly from a client role.
--
-- badges: read-only reference data (small, near-static, per DB Design
-- §3.7), same open-SELECT pattern as vocabulary_entries/units/lessons.
--
-- user_badges: self-scoped SELECT — a learner's own earned badges are
-- personal progress data, not public by default (leaderboards, which
-- would need a different, opt-in-scoped policy, are explicitly out of
-- scope for this slice per SRS FR-18's "Should Have" priority).
ALTER TABLE "engagement"."streaks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "engagement"."daily_goals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "engagement"."badges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "engagement"."user_badges" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "streaks_select_own" ON "engagement"."streaks"
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "daily_goals_select_own" ON "engagement"."daily_goals"
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "badges_select_authenticated" ON "engagement"."badges"
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "user_badges_select_own" ON "engagement"."user_badges"
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
