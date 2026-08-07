-- Certificates (Master Blueprint §8, SRS FR-11, roadmap Phase 14).
-- Extends the same test_blueprints/attempts/responses machinery
-- already built for placement + unit checkpoint, rather than a
-- separate exam-taking pipeline (API Spec §8.1's sequence diagram:
-- a certification exam is assembled/attempted/submitted through the
-- exact same generic /assessment-attempts endpoints, distinguished
-- only by the blueprint's kind). `certification_results` is a new
-- table for the same reason `checkpoint_results` was: a level-end,
-- multi-skill pass/fail+breakdown outcome is a different shape than
-- placement's CEFR-level result.

ALTER TABLE "assessment"."test_blueprints"
  ADD COLUMN "cefr_level" "shared"."cefr_level";

ALTER TABLE "assessment"."test_blueprints"
  DROP CONSTRAINT IF EXISTS "test_blueprints_kind_check";

ALTER TABLE "assessment"."test_blueprints"
  ADD CONSTRAINT "test_blueprints_kind_check" CHECK ("kind" IN ('placement', 'unit_checkpoint', 'certification_exam'));

-- One certification-exam blueprint per level (checkpoint scopes by
-- unit_id; certification scopes by cefr_level instead).
CREATE UNIQUE INDEX "test_blueprints_one_per_level" ON "assessment"."test_blueprints" ("academy_id", "cefr_level") WHERE "kind" = 'certification_exam';

/** Immutable, mirrors checkpoint_results' own shape/rule. pending_review_count: free-text (Speaking) responses are excluded from scorePercent/passed (human-review scoring isn't built yet -- same disclosed MVP gap as placement/checkpoint) but the count is surfaced so the result is never silently partial. */
CREATE TABLE "assessment"."certification_results" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "attempt_id" uuid NOT NULL UNIQUE REFERENCES "assessment"."attempts"("id"),
  "user_id" uuid NOT NULL REFERENCES "identity"."user_profiles"("id"),
  "cefr_level" "shared"."cefr_level" NOT NULL,
  "score_percent" numeric(5, 2) NOT NULL,
  "passed" boolean NOT NULL,
  -- { [skill]: { correct: number, total: number } }
  "skill_breakdown" jsonb NOT NULL,
  "pending_review_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "certification_results_user_id_idx" ON "assessment"."certification_results" ("user_id");

ALTER TABLE "assessment"."certification_results" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certification_results_select_own" ON "assessment"."certification_results"
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

/** DDD §3.4's certificate schema. Immutable except the active->revoked status transition (no revoke workflow built yet -- named gap, no doc anywhere specifies a revocation actor/endpoint). disclaimer_text/locale are frozen at issuance from shared.certificate_templates, not live-linked, so a later template edit never rewrites an already-issued certificate. */
CREATE TABLE "assessment"."certificates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "identity"."user_profiles"("id"),
  "academy_id" uuid NOT NULL REFERENCES "academy"."academies"("id"),
  "cefr_level" "shared"."cefr_level" NOT NULL,
  "result_id" uuid NOT NULL UNIQUE REFERENCES "assessment"."certification_results"("id"),
  "issuer" varchar(120) NOT NULL DEFAULT 'Elrefaee English Academy',
  "verification_code" varchar(20) NOT NULL UNIQUE,
  "disclaimer_text" text NOT NULL,
  "locale" varchar(35) NOT NULL DEFAULT 'en' REFERENCES "shared"."supported_locales"("locale"),
  "status" varchar(10) NOT NULL DEFAULT 'active',
  "issued_at" timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE "assessment"."certificates"
  ADD CONSTRAINT "certificates_status_check" CHECK ("status" IN ('active', 'revoked'));

-- Looked up by the public, unauthenticated verification endpoint
-- (SRS FR-11 / API Spec §7.4) -- indexed since it has no auth gate
-- to lean on for narrowing the scan.
CREATE UNIQUE INDEX "certificates_verification_code_idx" ON "assessment"."certificates" ("verification_code");
CREATE INDEX "certificates_user_id_idx" ON "assessment"."certificates" ("user_id");

ALTER TABLE "assessment"."certificates" ENABLE ROW LEVEL SECURITY;

-- Self-scoped SELECT only, same pattern as every other learner-owned
-- table. The public verification endpoint reads through the app's
-- own privileged DB connection (src/shared/infrastructure/db/client.ts),
-- not a per-request Supabase client scoped to the visitor's (absent)
-- JWT, so it is unaffected by this policy -- this is the same
-- zero-anon-read-path pattern already established for item_bank.
CREATE POLICY "certificates_select_own" ON "assessment"."certificates"
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
