-- Unit Checkpoint quiz content (SRS FR-06/FR-08), authored per the
-- project's established "Claude generates content, user reviews/
-- approves" workflow -- items test exactly what each unit's lessons
-- actually taught (grammar + vocabulary skills only; this MVP scope
-- doesn't checkpoint reading/listening/speaking, which the Placement
-- Test's own item bank already covers at the course-entry level).
-- 6 auto-scored multiple_choice items per unit, passThresholdPercent
-- 0.7 -- same threshold the placement diagnostic already uses.
-- Each unit's blueprint + items are inserted as their own statement
-- (not chained through one WITH) so there's no ambiguity about
-- whether a data-modifying CTE actually executes.

-- Unit 1 "Everyday Introductions" -- blueprint
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
target_unit AS (
  SELECT u.id FROM "curriculum"."units" u
  JOIN "curriculum"."content_items" ci ON ci.id = u.content_item_id
  WHERE ci.payload->>'title' = 'Everyday Introductions'
)
INSERT INTO "assessment"."test_blueprints" ("academy_id", "key", "kind", "unit_id", "rules")
SELECT academy.id, 'checkpoint:' || target_unit.id, 'unit_checkpoint', target_unit.id,
  '{"itemCount": 6, "passThresholdPercent": 0.7, "skills": ["grammar", "vocabulary"]}'::jsonb
FROM academy, target_unit;

-- Unit 2 "Daily Routines" -- blueprint
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
target_unit AS (
  SELECT u.id FROM "curriculum"."units" u
  JOIN "curriculum"."content_items" ci ON ci.id = u.content_item_id
  WHERE ci.payload->>'title' = 'Daily Routines'
)
INSERT INTO "assessment"."test_blueprints" ("academy_id", "key", "kind", "unit_id", "rules")
SELECT academy.id, 'checkpoint:' || target_unit.id, 'unit_checkpoint', target_unit.id,
  '{"itemCount": 6, "passThresholdPercent": 0.7, "skills": ["grammar", "vocabulary"]}'::jsonb
FROM academy, target_unit;

-- Unit 1 items
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
target_unit AS (
  SELECT u.id FROM "curriculum"."units" u
  JOIN "curriculum"."content_items" ci ON ci.id = u.content_item_id
  WHERE ci.payload->>'title' = 'Everyday Introductions'
)
INSERT INTO "assessment"."item_bank" ("academy_id", "skill", "cefr_level", "difficulty", "item_type", "unit_id", "prompt", "scoring_key")
SELECT academy.id, v.skill::"shared"."skill_type", 'a1'::"shared"."cefr_level", 1.5, 'multiple_choice', target_unit.id, v.prompt::jsonb, v.scoring_key::jsonb
FROM academy, target_unit, (VALUES
  ('grammar', '{"prompt":"___, my name is Sara.","options":["Hello","She","From","Nice"]}', '{"correctOptionIndex":0,"explanation":"Use ''Hello'' or ''Hi'' to greet someone before you introduce yourself."}'),
  ('grammar', '{"prompt":"Hi, I''m Tom. ___ your name?","options":["Who''s","What''s","Where''s","How''s"]}', '{"correctOptionIndex":1,"explanation":"To ask someone''s name, say ''What''s your name?''"}'),
  ('grammar', '{"prompt":"I ___ from Egypt.","options":["is","are","am","be"]}', '{"correctOptionIndex":2,"explanation":"Use ''am'' with ''I'': I am from Egypt."}'),
  ('grammar', '{"prompt":"She ___ a student.","options":["am","is","are","be"]}', '{"correctOptionIndex":1,"explanation":"Use ''is'' with ''she/he/it'': She is a student."}'),
  ('grammar', '{"prompt":"This is ___ sister. Her name is Layla.","options":["I","me","my","mine"]}', '{"correctOptionIndex":2,"explanation":"''My'' is a possessive adjective, used before a noun: my sister."}'),
  ('vocabulary', '{"prompt":"My father and mother are my ___.","options":["friends","parents","brothers","teachers"]}', '{"correctOptionIndex":1,"explanation":"''Parents'' means your father and mother together."}')
) AS v(skill, prompt, scoring_key);

-- Unit 2 items
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
target_unit AS (
  SELECT u.id FROM "curriculum"."units" u
  JOIN "curriculum"."content_items" ci ON ci.id = u.content_item_id
  WHERE ci.payload->>'title' = 'Daily Routines'
)
INSERT INTO "assessment"."item_bank" ("academy_id", "skill", "cefr_level", "difficulty", "item_type", "unit_id", "prompt", "scoring_key")
SELECT academy.id, v.skill::"shared"."skill_type", 'a1'::"shared"."cefr_level", 1.5, 'multiple_choice', target_unit.id, v.prompt::jsonb, v.scoring_key::jsonb
FROM academy, target_unit, (VALUES
  ('grammar', '{"prompt":"I ___ up at 7 am.","options":["wake","wakes","waking","woke"]}', '{"correctOptionIndex":0,"explanation":"Use the base form with ''I'': I wake up at 7 am."}'),
  ('grammar', '{"prompt":"She ___ to work in the morning.","options":["go","goes","going","went"]}', '{"correctOptionIndex":1,"explanation":"Add -s for he/she/it in the simple present: she goes."}'),
  ('grammar', '{"prompt":"We ___ dinner at 8 pm.","options":["has","have","having","had"]}', '{"correctOptionIndex":1,"explanation":"Use the base form with ''we'': we have dinner."}'),
  ('grammar', '{"prompt":"I like ___ in the pool every summer.","options":["swim","swims","swimming","swam"]}', '{"correctOptionIndex":2,"explanation":"''Like'' is followed by a verb + -ing: I like swimming."}'),
  ('grammar', '{"prompt":"He loves ___ football on weekends.","options":["play","plays","played","playing"]}', '{"correctOptionIndex":3,"explanation":"''Love'' is followed by a verb + -ing: he loves playing."}'),
  ('vocabulary', '{"prompt":"What do most people do first thing after they wake up?","options":["go to work","have breakfast","go to sleep","have dinner"]}', '{"correctOptionIndex":1,"explanation":"After waking up, people usually have breakfast."}')
) AS v(skill, prompt, scoring_key);
