-- RLS for the Lesson Viewer's units/lessons/learning tables (SRS §12.2).
--
-- units/lessons: read-only reference data, same pattern as `courses`
-- (0012_curriculum_tables_rls.sql) -- the row itself (a unit/lesson
-- exists at this order_index) isn't sensitive, and locked units are
-- meant to be visibly-present-but-locked in the UI (doc 08 §4.9), not
-- hidden. Actual content-access gating (can this learner read THIS
-- lesson's content right now) is enforced in the application layer
-- (GetLessonUseCase), per SRS FR-04's explicit "access denied
-- server-side, not just hidden in the UI" acceptance criterion --
-- RLS alone can't express "the previous unit's lessons are all
-- completed," so it isn't asked to.
--
-- enrollments/progress_records: self-scoped SELECT only, same
-- zero-client-write pattern as assessment.attempts/results -- all
-- writes go through the service-role connection via this module's
-- use-cases, never directly from a client role.
ALTER TABLE "curriculum"."units" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "curriculum"."lessons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "learning"."enrollments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "learning"."progress_records" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "units_select_authenticated" ON "curriculum"."units"
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "lessons_select_authenticated" ON "curriculum"."lessons"
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "enrollments_select_own" ON "learning"."enrollments"
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "progress_records_select_own" ON "learning"."progress_records"
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
