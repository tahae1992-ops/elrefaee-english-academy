DROP POLICY IF EXISTS "streaks_select_own" ON "engagement"."streaks";
DROP POLICY IF EXISTS "daily_goals_select_own" ON "engagement"."daily_goals";
DROP POLICY IF EXISTS "badges_select_authenticated" ON "engagement"."badges";
DROP POLICY IF EXISTS "user_badges_select_own" ON "engagement"."user_badges";

ALTER TABLE "engagement"."streaks" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "engagement"."daily_goals" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "engagement"."badges" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "engagement"."user_badges" DISABLE ROW LEVEL SECURITY;
