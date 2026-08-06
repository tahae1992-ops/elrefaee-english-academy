-- Assessment Engine: Unit Checkpoint Quiz + Mastery Gating (SRS FR-06/
-- FR-08, roadmap Phase 7's remaining scope). Extends the Placement
-- Test's existing assessment schema rather than duplicating it --
-- `attempts`/`responses` are already attempt-kind-agnostic; only
-- `item_bank`/`test_blueprints` need a way to scope rows to a specific
-- unit, and a new immutable results table since checkpoint outcomes
-- (pass/fail + score percent) are a different shape than placement's
-- CEFR-level results.

ALTER TABLE "assessment"."item_bank"
  ADD COLUMN "unit_id" uuid REFERENCES "curriculum"."units"("id");

ALTER TABLE "assessment"."test_blueprints"
  ADD COLUMN "kind" varchar(20) NOT NULL DEFAULT 'placement',
  ADD COLUMN "unit_id" uuid REFERENCES "curriculum"."units"("id");

ALTER TABLE "assessment"."test_blueprints"
  ADD CONSTRAINT "test_blueprints_kind_check" CHECK ("kind" IN ('placement', 'unit_checkpoint'));

-- One checkpoint blueprint per unit (placement's single 'placement'-key
-- blueprint has no unit_id, so this partial index only ever applies to
-- checkpoint rows).
CREATE UNIQUE INDEX "test_blueprints_one_per_unit" ON "assessment"."test_blueprints" ("unit_id") WHERE "kind" = 'unit_checkpoint';

/** Immutable, mirrors `results`' own DDD §3.9 rule — corrections are a new attempt, never an edit. */
CREATE TABLE "assessment"."checkpoint_results" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "attempt_id" uuid NOT NULL UNIQUE REFERENCES "assessment"."attempts"("id"),
  "user_id" uuid NOT NULL REFERENCES "identity"."user_profiles"("id"),
  "unit_id" uuid NOT NULL REFERENCES "curriculum"."units"("id"),
  "score_percent" numeric(5, 2) NOT NULL,
  "passed" boolean NOT NULL,
  -- { [skill]: { correct: number, total: number } } -- FR-06's exception
  -- flow: "surfaces exactly which skill(s) fell below threshold."
  "skill_breakdown" jsonb NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "checkpoint_results_user_id_idx" ON "assessment"."checkpoint_results" ("user_id");

ALTER TABLE "assessment"."checkpoint_results" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checkpoint_results_select_own" ON "assessment"."checkpoint_results"
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
