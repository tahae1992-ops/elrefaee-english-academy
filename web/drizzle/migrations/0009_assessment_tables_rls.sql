-- RLS for the Placement Test's assessment tables (SRS §12.2).
--
-- item_bank/test_blueprints: zero client policies, deliberately —
-- item_bank.scoring_key must never be directly readable by a client
-- role (it would let a learner read correct answers), and nothing in
-- this app queries these tables except our own server-side route
-- handlers via the `postgres`-role connection, which bypasses RLS
-- entirely. Same zero-policy-by-design pattern as
-- identity.refresh_token_registry (0004_identity_tables_rls.sql).
--
-- attempts/responses/results: a learner may read (never write — all
-- writes go through the service-bypassing connection) their own rows
-- only.
ALTER TABLE "assessment"."item_bank" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assessment"."test_blueprints" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assessment"."attempts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assessment"."responses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assessment"."results" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attempts_select_own" ON "assessment"."attempts"
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "responses_select_own" ON "assessment"."responses"
  FOR SELECT TO authenticated
  USING (
    attempt_id IN (SELECT id FROM "assessment"."attempts" WHERE user_id = auth.uid())
  );

CREATE POLICY "results_select_own" ON "assessment"."results"
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
