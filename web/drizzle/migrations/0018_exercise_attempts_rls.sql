-- RLS for the Exercise Engine's attempt-tracking table (SRS §12.2).
-- Self-scoped SELECT only, same zero-client-write pattern as
-- assessment.attempts/results and learning.progress_records -- all
-- writes go through the service-role connection via
-- RecordExerciseAttemptUseCase, never directly from a client role.
ALTER TABLE "learning"."exercise_attempts" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exercise_attempts_select_own" ON "learning"."exercise_attempts"
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
