-- Pre-A1 Unit Checkpoint Quizzes (SRS FR-06/FR-08), same pattern as
-- 0032_unit_checkpoint_seed.sql. Discovered while live-testing the
-- real learner journey: computeUnitAccess (learning/domain) requires
-- the previous unit's checkpoint to be passed before the next unit
-- unlocks, and no checkpoint content existed for any Pre-A1 unit --
-- meaning a real Pre-A1 student would complete all 4 lessons of Unit 1
-- and then be permanently locked out of Unit 2. Without this
-- migration, "a real test student can complete the level" (Rev. 3
-- Quality Gate) is not achievable. 6 auto-scored multiple_choice items
-- per unit, passThresholdPercent 0.7, testing exactly what each unit's
-- lessons taught -- same scope/threshold as the existing A1 checkpoints.

-- Unit 1 "First Words" -- blueprint
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
target_unit AS (
  SELECT u.id FROM "curriculum"."units" u
  JOIN "curriculum"."content_items" ci ON ci.id = u.content_item_id
  WHERE ci.payload->>'title' = 'First Words'
)
INSERT INTO "assessment"."test_blueprints" ("academy_id", "key", "kind", "unit_id", "rules")
SELECT academy.id, 'checkpoint:' || target_unit.id, 'unit_checkpoint', target_unit.id,
  '{"itemCount": 6, "passThresholdPercent": 0.7, "skills": ["grammar", "vocabulary"]}'::jsonb
FROM academy, target_unit;

-- Unit 2 "Me and My World" -- blueprint
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
target_unit AS (
  SELECT u.id FROM "curriculum"."units" u
  JOIN "curriculum"."content_items" ci ON ci.id = u.content_item_id
  WHERE ci.payload->>'title' = 'Me and My World'
)
INSERT INTO "assessment"."test_blueprints" ("academy_id", "key", "kind", "unit_id", "rules")
SELECT academy.id, 'checkpoint:' || target_unit.id, 'unit_checkpoint', target_unit.id,
  '{"itemCount": 6, "passThresholdPercent": 0.7, "skills": ["grammar", "vocabulary"]}'::jsonb
FROM academy, target_unit;

-- Unit 3 "Everyday Things" -- blueprint
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
target_unit AS (
  SELECT u.id FROM "curriculum"."units" u
  JOIN "curriculum"."content_items" ci ON ci.id = u.content_item_id
  WHERE ci.payload->>'title' = 'Everyday Things'
)
INSERT INTO "assessment"."test_blueprints" ("academy_id", "key", "kind", "unit_id", "rules")
SELECT academy.id, 'checkpoint:' || target_unit.id, 'unit_checkpoint', target_unit.id,
  '{"itemCount": 6, "passThresholdPercent": 0.7, "skills": ["grammar", "vocabulary"]}'::jsonb
FROM academy, target_unit;

-- Unit 4 "Around Me" -- blueprint
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
target_unit AS (
  SELECT u.id FROM "curriculum"."units" u
  JOIN "curriculum"."content_items" ci ON ci.id = u.content_item_id
  WHERE ci.payload->>'title' = 'Around Me'
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
  WHERE ci.payload->>'title' = 'First Words'
)
INSERT INTO "assessment"."item_bank" ("academy_id", "skill", "cefr_level", "difficulty", "item_type", "unit_id", "prompt", "scoring_key")
SELECT academy.id, v.skill::"shared"."skill_type", 'pre_a1'::"shared"."cefr_level", 1.0, 'multiple_choice', target_unit.id, v.prompt::jsonb, v.scoring_key::jsonb
FROM academy, target_unit, (VALUES
  ('grammar', '{"prompt":"Choose the small (lowercase) letter for the big letter B.","options":["b","p","d"]}', '{"correctOptionIndex":0,"explanation":"''b'' is the lowercase form of ''B''."}'),
  ('grammar', '{"prompt":"The letter S makes which sound?","options":["/s/","/m/","/b/"]}', '{"correctOptionIndex":0,"explanation":"S makes the /s/ sound, like in ''sun''."}'),
  ('vocabulary', '{"prompt":"What number is ''zero''?","options":["0","1","10"]}', '{"correctOptionIndex":0,"explanation":"''Zero'' is the word for the number 0."}'),
  ('vocabulary', '{"prompt":"What do you say when you leave someone?","options":["Hello","Goodbye","Good morning"]}', '{"correctOptionIndex":1,"explanation":"''Goodbye'' is used when you are leaving."}'),
  ('vocabulary', '{"prompt":"What do you say when you don''t understand?","options":["I don''t understand","Thank you","Goodbye"]}', '{"correctOptionIndex":0,"explanation":"''I don''t understand'' tells someone you need help."}'),
  ('grammar', '{"prompt":"Put in order: one, two, ___","options":["three","five","ten"]}', '{"correctOptionIndex":0,"explanation":"The order is one, two, three."}')
) AS v(skill, prompt, scoring_key);

-- Unit 2 items
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
target_unit AS (
  SELECT u.id FROM "curriculum"."units" u
  JOIN "curriculum"."content_items" ci ON ci.id = u.content_item_id
  WHERE ci.payload->>'title' = 'Me and My World'
)
INSERT INTO "assessment"."item_bank" ("academy_id", "skill", "cefr_level", "difficulty", "item_type", "unit_id", "prompt", "scoring_key")
SELECT academy.id, v.skill::"shared"."skill_type", 'pre_a1'::"shared"."cefr_level", 1.0, 'multiple_choice', target_unit.id, v.prompt::jsonb, v.scoring_key::jsonb
FROM academy, target_unit, (VALUES
  ('grammar', '{"prompt":"I ___ Sara.","options":["am","is","are"]}', '{"correctOptionIndex":0,"explanation":"Use ''am'' with ''I'': I am Sara."}'),
  ('grammar', '{"prompt":"This ___ my book.","options":["is","am","are"]}', '{"correctOptionIndex":0,"explanation":"Use ''is'' with ''this'': This is my book."}'),
  ('vocabulary', '{"prompt":"A man who has children is your ___.","options":["father","sister","friend"]}', '{"correctOptionIndex":0,"explanation":"''Father'' is the male parent."}'),
  ('vocabulary', '{"prompt":"My mother and father are my ___.","options":["parents","children","friends"]}', '{"correctOptionIndex":0,"explanation":"''Parents'' means your mother and father together."}'),
  ('grammar', '{"prompt":"I am ___ Egypt.","options":["from","at","in"]}', '{"correctOptionIndex":0,"explanation":"Use ''from'' before a country: I am from Egypt."}'),
  ('vocabulary', '{"prompt":"How do you ask where someone is from?","options":["Where are you from?","What is your name?","How old are you?"]}', '{"correctOptionIndex":0,"explanation":"''Where are you from?'' asks about a person''s country."}')
) AS v(skill, prompt, scoring_key);

-- Unit 3 items
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
target_unit AS (
  SELECT u.id FROM "curriculum"."units" u
  JOIN "curriculum"."content_items" ci ON ci.id = u.content_item_id
  WHERE ci.payload->>'title' = 'Everyday Things'
)
INSERT INTO "assessment"."item_bank" ("academy_id", "skill", "cefr_level", "difficulty", "item_type", "unit_id", "prompt", "scoring_key")
SELECT academy.id, v.skill::"shared"."skill_type", 'pre_a1'::"shared"."cefr_level", 1.0, 'multiple_choice', target_unit.id, v.prompt::jsonb, v.scoring_key::jsonb
FROM academy, target_unit, (VALUES
  ('vocabulary', '{"prompt":"What color is the sky?","options":["blue","red","yellow"]}', '{"correctOptionIndex":0,"explanation":"The sky is blue."}'),
  ('grammar', '{"prompt":"Choose the correct word: ___ apple (starts with a vowel sound)","options":["a","an","the"]}', '{"correctOptionIndex":1,"explanation":"Use ''an'' before a vowel sound: an apple."}'),
  ('grammar', '{"prompt":"Choose the correct word: ___ book (starts with a consonant sound)","options":["a","an","the"]}', '{"correctOptionIndex":0,"explanation":"Use ''a'' before a consonant sound: a book."}'),
  ('grammar', '{"prompt":"One book, two ___.","options":["books","book","bookes"]}', '{"correctOptionIndex":0,"explanation":"Add -s to make ''book'' plural: books."}'),
  ('grammar', '{"prompt":"One cat, two ___.","options":["cats","cates","cat"]}', '{"correctOptionIndex":0,"explanation":"Add -s to make ''cat'' plural: cats."}'),
  ('vocabulary', '{"prompt":"I ___ a phone in my bag.","options":["have","has","am"]}', '{"correctOptionIndex":0,"explanation":"Use ''have'' with ''I'': I have a phone."}')
) AS v(skill, prompt, scoring_key);

-- Unit 4 items
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
target_unit AS (
  SELECT u.id FROM "curriculum"."units" u
  JOIN "curriculum"."content_items" ci ON ci.id = u.content_item_id
  WHERE ci.payload->>'title' = 'Around Me'
)
INSERT INTO "assessment"."item_bank" ("academy_id", "skill", "cefr_level", "difficulty", "item_type", "unit_id", "prompt", "scoring_key")
SELECT academy.id, v.skill::"shared"."skill_type", 'pre_a1'::"shared"."cefr_level", 1.0, 'multiple_choice', target_unit.id, v.prompt::jsonb, v.scoring_key::jsonb
FROM academy, target_unit, (VALUES
  ('vocabulary', '{"prompt":"What day comes after Friday?","options":["Saturday","Sunday","Monday"]}', '{"correctOptionIndex":0,"explanation":"After Friday comes Saturday."}'),
  ('grammar', '{"prompt":"The book is ___ the table.","options":["on","in","at"]}', '{"correctOptionIndex":0,"explanation":"''On'' describes something on top of a surface."}'),
  ('grammar', '{"prompt":"The pen is ___ the box.","options":["in","on","at"]}', '{"correctOptionIndex":0,"explanation":"''In'' describes something inside a container."}'),
  ('vocabulary', '{"prompt":"3:00 is three ___.","options":["o''clock","half","minute"]}', '{"correctOptionIndex":0,"explanation":"We say ''o''clock'' for an exact hour."}'),
  ('grammar', '{"prompt":"''Half past three'' means ___.","options":["3:30","3:00","4:00"]}', '{"correctOptionIndex":0,"explanation":"''Half past'' means 30 minutes after the hour."}'),
  ('vocabulary', '{"prompt":"''Today'' means ___.","options":["the day happening now","tomorrow","yesterday"]}', '{"correctOptionIndex":0,"explanation":"''Today'' is the current day."}')
) AS v(skill, prompt, scoring_key);
