-- A1 curriculum, Phase 1e: Unit Checkpoint Quizzes for the 2 new units
-- (Shopping and Numbers, My Week), completing the same
-- assessment.test_blueprints + assessment.item_bank pattern already
-- seeded for Units 1-2 in 0032 -- 6 auto-scored multiple_choice items
-- per unit (5 grammar + 1 vocabulary), passThresholdPercent 0.7,
-- testing exactly what each unit's 4 lessons taught.

-- Unit 3 "Shopping and Numbers" -- blueprint
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
target_unit AS (
  SELECT u.id FROM "curriculum"."units" u
  JOIN "curriculum"."content_items" ci ON ci.id = u.content_item_id
  WHERE ci.payload->>'title' = 'Shopping and Numbers'
)
INSERT INTO "assessment"."test_blueprints" ("academy_id", "key", "kind", "unit_id", "rules")
SELECT academy.id, 'checkpoint:' || target_unit.id, 'unit_checkpoint', target_unit.id,
  '{"itemCount": 6, "passThresholdPercent": 0.7, "skills": ["grammar", "vocabulary"]}'::jsonb
FROM academy, target_unit;

-- Unit 4 "My Week" -- blueprint
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
target_unit AS (
  SELECT u.id FROM "curriculum"."units" u
  JOIN "curriculum"."content_items" ci ON ci.id = u.content_item_id
  WHERE ci.payload->>'title' = 'My Week'
)
INSERT INTO "assessment"."test_blueprints" ("academy_id", "key", "kind", "unit_id", "rules")
SELECT academy.id, 'checkpoint:' || target_unit.id, 'unit_checkpoint', target_unit.id,
  '{"itemCount": 6, "passThresholdPercent": 0.7, "skills": ["grammar", "vocabulary"]}'::jsonb
FROM academy, target_unit;

-- Unit 3 items
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
target_unit AS (
  SELECT u.id FROM "curriculum"."units" u
  JOIN "curriculum"."content_items" ci ON ci.id = u.content_item_id
  WHERE ci.payload->>'title' = 'Shopping and Numbers'
)
INSERT INTO "assessment"."item_bank" ("academy_id", "skill", "cefr_level", "difficulty", "item_type", "unit_id", "prompt", "scoring_key")
SELECT academy.id, v.skill::"shared"."skill_type", 'a1'::"shared"."cefr_level", 1.5, 'multiple_choice', target_unit.id, v.prompt::jsonb, v.scoring_key::jsonb
FROM academy, target_unit, (VALUES
  ('grammar', '{"prompt":"''___ is this shirt?''","options":["How much","How many","How old","How far"]}', '{"correctOptionIndex":0,"explanation":"''How much'' asks about price."}'),
  ('grammar', '{"prompt":"20 = ___","options":["twenty","twelve","two","twenty-one"]}', '{"correctOptionIndex":0,"explanation":"''Twenty'' is the word for the number 20."}'),
  ('grammar', '{"prompt":"This bag is ___ than that one.","options":["big","bigger","biggest","more big"]}', '{"correctOptionIndex":1,"explanation":"Add ''-er'' to short adjectives to compare two things: big → bigger."}'),
  ('grammar', '{"prompt":"A shop worker says ''___?'' to offer help.","options":["Can I help you","How old are you","Where are you from","What''s your name"]}', '{"correctOptionIndex":0,"explanation":"''Can I help you?'' is the standard phrase shop workers use to offer help."}'),
  ('grammar', '{"prompt":"My phone is old. I want a ___ phone.","options":["new","old","big","small"]}', '{"correctOptionIndex":0,"explanation":"''New'' is the opposite of ''old'' and fits wanting a replacement."}'),
  ('vocabulary', '{"prompt":"A person who buys things at a store is a ___.","options":["customer","seller","store","price"]}', '{"correctOptionIndex":0,"explanation":"A ''customer'' is a person who buys things at a store."}')
) AS v(skill, prompt, scoring_key);

-- Unit 4 items
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
target_unit AS (
  SELECT u.id FROM "curriculum"."units" u
  JOIN "curriculum"."content_items" ci ON ci.id = u.content_item_id
  WHERE ci.payload->>'title' = 'My Week'
)
INSERT INTO "assessment"."item_bank" ("academy_id", "skill", "cefr_level", "difficulty", "item_type", "unit_id", "prompt", "scoring_key")
SELECT academy.id, v.skill::"shared"."skill_type", 'a1'::"shared"."cefr_level", 1.5, 'multiple_choice', target_unit.id, v.prompt::jsonb, v.scoring_key::jsonb
FROM academy, target_unit, (VALUES
  ('grammar', '{"prompt":"I ___ coffee, but I don''t like tea.","options":["like","likes","liking","liked"]}', '{"correctOptionIndex":0,"explanation":"Use the base form ''like'' with the subject ''I''."}'),
  ('grammar', '{"prompt":"I ___ tea. (negative)","options":["don''t like","doesn''t like","not like","no like"]}', '{"correctOptionIndex":0,"explanation":"''Don''t like'' is the negative form for ''I''."}'),
  ('grammar', '{"prompt":"I ___ wake up early. (100% of the time)","options":["always","never","sometimes","rarely"]}', '{"correctOptionIndex":0,"explanation":"''Always'' means 100% of the time."}'),
  ('grammar', '{"prompt":"I ___ eat breakfast at noon. (0% of the time)","options":["never","always","often","usually"]}', '{"correctOptionIndex":0,"explanation":"''Never'' means 0% of the time."}'),
  ('grammar', '{"prompt":"I often ___ to work.","options":["walk often","often walk","walking often","walked often"]}', '{"correctOptionIndex":1,"explanation":"Frequency adverbs like ''often'' usually go before the main verb."}'),
  ('vocabulary', '{"prompt":"What do you do in your ___ time?","options":["free","busy","work","school"]}', '{"correctOptionIndex":0,"explanation":"''Free time'' is time when you are not working or studying."}')
) AS v(skill, prompt, scoring_key);
