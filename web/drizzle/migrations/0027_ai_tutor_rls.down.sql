DROP POLICY IF EXISTS "tutor_conversations_select_own" ON "ai"."tutor_conversations";
DROP POLICY IF EXISTS "tutor_messages_select_own" ON "ai"."tutor_messages";

ALTER TABLE "ai"."tutor_conversations" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "ai"."tutor_messages" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "ai"."prompt_templates" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "ai"."interactions" DISABLE ROW LEVEL SECURITY;
