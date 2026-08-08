-- Phase 19 (Beta Release) — "feedback instrumentation." Lives in the
-- shared schema (not a 12th bounded-context schema, DDD §1 fixes the
-- count at 11), the same placement as audit_log/rate_limit_buckets.
-- All writes go through SubmitFeedbackUseCase's own service-role
-- connection, never a direct client-role INSERT (same pattern as
-- exercise_attempts/progress_records) -- the self-scoped SELECT
-- policy below is defensive, ahead of any UI that reads it back.
CREATE TYPE "shared"."feedback_category" AS ENUM ('bug', 'suggestion', 'other');
CREATE TYPE "shared"."feedback_status" AS ENUM ('new', 'reviewed', 'resolved');

CREATE TABLE "shared"."feedback_submissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "identity"."user_profiles"("id") ON DELETE CASCADE,
  "category" "shared"."feedback_category" NOT NULL,
  "message" text NOT NULL,
  "page_url" varchar(500),
  "status" "shared"."feedback_status" NOT NULL DEFAULT 'new',
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "feedback_submissions_user_id_idx" ON "shared"."feedback_submissions" ("user_id");
CREATE INDEX "feedback_submissions_status_idx" ON "shared"."feedback_submissions" ("status");

ALTER TABLE "shared"."feedback_submissions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_submissions_select_own" ON "shared"."feedback_submissions"
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
