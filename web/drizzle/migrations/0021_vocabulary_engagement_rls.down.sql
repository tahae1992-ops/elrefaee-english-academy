DROP POLICY IF EXISTS "vocabulary_entries_select_authenticated" ON "curriculum"."vocabulary_entries";
DROP POLICY IF EXISTS "vocabulary_review_state_select_own" ON "learning"."vocabulary_review_state";
DROP POLICY IF EXISTS "xp_transactions_select_own" ON "engagement"."xp_transactions";
DROP POLICY IF EXISTS "xp_balances_select_own" ON "engagement"."xp_balances";

ALTER TABLE "curriculum"."vocabulary_entries" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "learning"."vocabulary_review_state" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "engagement"."xp_transactions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "engagement"."xp_balances" DISABLE ROW LEVEL SECURITY;
