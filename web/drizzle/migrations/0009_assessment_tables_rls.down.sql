DROP POLICY IF EXISTS "results_select_own" ON "assessment"."results";
DROP POLICY IF EXISTS "responses_select_own" ON "assessment"."responses";
DROP POLICY IF EXISTS "attempts_select_own" ON "assessment"."attempts";

ALTER TABLE "assessment"."results" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "assessment"."responses" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "assessment"."attempts" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "assessment"."test_blueprints" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "assessment"."item_bank" DISABLE ROW LEVEL SECURITY;
