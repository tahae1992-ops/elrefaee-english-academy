-- RLS for the AI Tutor's tables (SRS §12.2).
--
-- tutor_conversations/tutor_messages: self-scoped SELECT only, same
-- zero-client-write pattern as every other learner-owned table in this
-- schema (vocabulary_review_state, exercise_attempts, streaks) — all
-- writes go through the service-role connection via the AI Gateway's
-- use-cases, never directly from a client role. tutor_messages has no
-- direct user_id column (it belongs to a conversation), so its policy
-- joins through tutor_conversations.
--
-- prompt_templates/interactions: zero-policy-by-design, same pattern
-- as assessment.item_bank — internal system/cost-tracking data with no
-- learner-facing read path; RLS is enabled (satisfying the "every
-- table has RLS" rule) but access is service-role only.
ALTER TABLE "ai"."tutor_conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai"."tutor_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai"."prompt_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai"."interactions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tutor_conversations_select_own" ON "ai"."tutor_conversations"
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "tutor_messages_select_own" ON "ai"."tutor_messages"
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "ai"."tutor_conversations" tc
      WHERE tc.id = "ai"."tutor_messages"."conversation_id" AND tc.user_id = auth.uid()
    )
  );
