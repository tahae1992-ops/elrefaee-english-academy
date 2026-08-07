-- Certification exam content + disclaimer templates (SRS FR-11,
-- Master Blueprint §8, roadmap Phase 14).
--
-- No new item_bank rows: Master Blueprint §6 states items are
-- "authored once, reused everywhere, scored differently per
-- context" -- the a1 certification exam reuses the exact same
-- unit-agnostic (unit_id IS NULL) a1 item pool the Placement Test
-- already seeded (listening/reading/grammar/vocabulary x2 each,
-- speaking x1), rather than authoring a duplicate pool. Only B1 and
-- below are in MVP scope (PRD §7.11); only A1 curriculum content
-- exists in this codebase so far, so A1 is the only certification
-- blueprint seeded today -- higher levels get their own blueprint
-- row the same way once that level's course content lands.
--
-- Disclaimer template is a placeholder pending the real legal-review
-- sign-off the roadmap names explicitly as a non-engineering blocker
-- for Phase 14 -- do not treat this wording as final/approved.

INSERT INTO "shared"."certificate_templates" ("template_key", "locale", "body") VALUES
  ('disclaimer', 'en', 'This certificate confirms that the holder has demonstrated mastery of the {level} level of Elrefaee English Academy''s CEFR-aligned curriculum, based on a comprehensive multi-skill assessment (Listening, Reading, Grammar, Vocabulary, and Speaking). It does not represent government, university, or other third-party accreditation. [Placeholder text pending legal review.]'),
  ('disclaimer', 'ar', 'تؤكد هذه الشهادة أن حاملها أظهر إتقانًا لمستوى {level} من منهج أكاديمية الرفاعي لغة إنجليزية المتوافق مع إطار المرجعية الأوروبية المشترك للغات (CEFR)، استنادًا إلى تقييم شامل متعدد المهارات (الاستماع والقراءة والقواعد والمفردات والمحادثة). لا تمثل هذه الشهادة اعتمادًا حكوميًا أو جامعيًا أو من أي جهة خارجية أخرى. [نص مؤقت بانتظار المراجعة القانونية.]')
;

WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1)
INSERT INTO "assessment"."test_blueprints" ("academy_id", "key", "kind", "cefr_level", "rules")
SELECT academy.id, 'certification:a1', 'certification_exam', 'a1'::"shared"."cefr_level",
  '{"itemCount": 9, "passThresholdPercent": 0.7, "gradedSkills": ["listening", "reading", "grammar", "vocabulary"], "timeLimitMinutes": 20, "cooldownDays": 14, "maxFailuresBeforeEscalation": 3}'::jsonb
FROM academy;
