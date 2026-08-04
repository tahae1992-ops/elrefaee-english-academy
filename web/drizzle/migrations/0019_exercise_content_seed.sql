-- Exercise Engine seed: migrates the 15 multiple_choice practice
-- exercises already embedded in lesson payloads into real, standalone
-- exercise content_items (type='exercise'), and adds 6 new exercises
-- (true_false, fill_in_blank, matching, ordering, short_answer,
-- sentence_building) so all 7 supported types are real, seeded, and
-- reachable through the existing 5 lessons. Each lesson's
-- controlled_practice block (always blocks[2]) is surgically
-- rewritten to hold exerciseIds (references) + updated instructions,
-- replacing the old embedded "exercises" key -- the rest of the
-- lesson payload (warm_up/presentation/task/wrap_up) is untouched.
--
-- Split into separate statements (insert, then one UPDATE per
-- lesson) rather than one big WITH chain, since a WITH clause's
-- CTEs don't persist across statement boundaries and Postgres only
-- allows one data-modifying statement per WITH chain.

WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1)
INSERT INTO "curriculum"."content_items" ("academy_id", "type", "cefr_level", "status", "payload")
SELECT academy.id, 'exercise'::"shared"."content_type", 'a1'::"shared"."cefr_level", 'published'::"shared"."content_status", v.payload::jsonb
FROM academy, (VALUES
  ('{"exerciseType":"multiple_choice","prompt":"Someone says ''Hi, I''m Ana.'' What do you say?","options":["Hi, I''m Marco. Nice to meet you.","Goodbye, Ana.","I don''t know."],"correctOptionIndex":0,"explanation":"When someone introduces themselves, the polite response is to introduce yourself back and say ''Nice to meet you.''"}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"How do you ask someone''s name?","options":["What''s your name?","How old are you?","Where you name?"],"correctOptionIndex":0,"explanation":"''What''s your name?'' is the correct way to ask for someone''s name."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"Complete: ''___ name is Wael.''","options":["My","I","Me"],"correctOptionIndex":0,"explanation":"''My name is...'' uses the possessive adjective ''my''."}'::jsonb),
  ('{"exerciseType":"true_false","prompt":"True or False: ''Nice to meet you'' is something you say when you meet someone for the first time.","correctAnswer":true,"explanation":"''Nice to meet you'' is a polite phrase used specifically when meeting someone for the first time."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"I ___ from Egypt.","options":["am","is","are"],"correctOptionIndex":0,"explanation":"Use ''am'' with the subject ''I''."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"She ___ a doctor.","options":["am","is","are"],"correctOptionIndex":1,"explanation":"Use ''is'' with ''he/she/it''."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"They ___ from Morocco.","options":["am","is","are"],"correctOptionIndex":2,"explanation":"Use ''are'' with ''they/we/you''."}'::jsonb),
  ('{"exerciseType":"fill_in_blank","prompt":"Complete the sentence: I ___ a teacher.","acceptedAnswers":["am"],"explanation":"Use ''am'' with the subject ''I'' when describing your job."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"This is my brother. ___ name is Adam.","options":["His","Her","Their"],"correctOptionIndex":0,"explanation":"''His'' is the possessive adjective for a male (''brother'')."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"That is my mother. ___ name is Huda.","options":["His","Her","Its"],"correctOptionIndex":1,"explanation":"''Her'' is the possessive adjective for a female (''mother'')."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"These are my parents. ___ house is big.","options":["His","Her","Their"],"correctOptionIndex":2,"explanation":"''Their'' is the possessive adjective for a plural subject (''parents'')."}'::jsonb),
  ('{"exerciseType":"matching","prompt":"Match each family word to its meaning.","pairs":[["brother","a male sibling"],["sister","a female sibling"],["parents","your mother and father"]],"explanation":"These are common words for describing your family."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"I ___ up at 7 o''clock.","options":["wake","wakes","waking"],"correctOptionIndex":0,"explanation":"Use the base form ''wake'' with the subject ''I''."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"She ___ to work every day.","options":["go","goes","going"],"correctOptionIndex":1,"explanation":"Add ''-es'' for third-person singular (''she'') in the simple present."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"We ___ dinner at 8 pm.","options":["have","has","having"],"correctOptionIndex":0,"explanation":"Use the base form ''have'' with the subject ''we''."}'::jsonb),
  ('{"exerciseType":"ordering","prompt":"Put the words in the correct order to make a sentence.","items":["I","wake","up","at","seven"],"explanation":"The correct word order is: I wake up at seven."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"I like ___ books.","options":["read","reads","reading"],"correctOptionIndex":2,"explanation":"Use the -ing form (gerund) after ''like''."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"She loves ___ music.","options":["listening to","listen to","listens to"],"correctOptionIndex":0,"explanation":"Use the -ing form (gerund) after ''loves''."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"They hate ___ up early.","options":["get","getting","gets"],"correctOptionIndex":1,"explanation":"Use the -ing form (gerund) after ''hate''."}'::jsonb),
  ('{"exerciseType":"short_answer","prompt":"What is the opposite of ''love''? (one word)","acceptedAnswers":["hate"],"explanation":"''Hate'' is the opposite of ''love'' when talking about strong feelings."}'::jsonb),
  ('{"exerciseType":"sentence_building","prompt":"Build a sentence saying that you like reading books.","chunks":["I","like","reading","books"],"explanation":"The correct sentence is: ''I like reading books.''"}'::jsonb)
) AS v(payload);

WITH lesson_exercise_ids AS (
  SELECT ci.id, keys.ord
  FROM "curriculum"."content_items" ci
  JOIN (VALUES
    ('Someone says ''Hi, I''m Ana.'' What do you say?', 1),
    ('How do you ask someone''s name?', 2),
    ('Complete: ''___ name is Wael.''', 3),
    ('True or False: ''Nice to meet you'' is something you say when you meet someone for the first time.', 4)
  ) AS keys(prompt, ord) ON ci.payload->>'prompt' = keys.prompt
  WHERE ci.type = 'exercise'
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(
  jsonb_set(payload #- '{blocks,2,exercises}', '{blocks,2,exerciseIds}',
    (SELECT jsonb_agg(id ORDER BY ord) FROM lesson_exercise_ids)
  ),
  '{blocks,2,instructions}', '"Answer each question about greetings and introductions."'::jsonb
)
WHERE id = 'e727403d-6b07-4be0-9958-651f6e697dd9';

WITH lesson_exercise_ids AS (
  SELECT ci.id, keys.ord
  FROM "curriculum"."content_items" ci
  JOIN (VALUES
    ('I ___ from Egypt.', 1),
    ('She ___ a doctor.', 2),
    ('They ___ from Morocco.', 3),
    ('Complete the sentence: I ___ a teacher.', 4)
  ) AS keys(prompt, ord) ON ci.payload->>'prompt' = keys.prompt
  WHERE ci.type = 'exercise'
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(
  jsonb_set(payload #- '{blocks,2,exercises}', '{blocks,2,exerciseIds}',
    (SELECT jsonb_agg(id ORDER BY ord) FROM lesson_exercise_ids)
  ),
  '{blocks,2,instructions}', '"Choose or complete the correct form."'::jsonb
)
WHERE id = '8ae9d096-bd3d-4ce7-ba23-886ac3c284ef';

WITH lesson_exercise_ids AS (
  SELECT ci.id, keys.ord
  FROM "curriculum"."content_items" ci
  JOIN (VALUES
    ('This is my brother. ___ name is Adam.', 1),
    ('That is my mother. ___ name is Huda.', 2),
    ('These are my parents. ___ house is big.', 3),
    ('Match each family word to its meaning.', 4)
  ) AS keys(prompt, ord) ON ci.payload->>'prompt' = keys.prompt
  WHERE ci.type = 'exercise'
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(
  jsonb_set(payload #- '{blocks,2,exercises}', '{blocks,2,exerciseIds}',
    (SELECT jsonb_agg(id ORDER BY ord) FROM lesson_exercise_ids)
  ),
  '{blocks,2,instructions}', '"Choose the correct possessive, then match the family words."'::jsonb
)
WHERE id = '674c22b7-9014-4b51-9a5f-99068d8d0299';

WITH lesson_exercise_ids AS (
  SELECT ci.id, keys.ord
  FROM "curriculum"."content_items" ci
  JOIN (VALUES
    ('I ___ up at 7 o''clock.', 1),
    ('She ___ to work every day.', 2),
    ('We ___ dinner at 8 pm.', 3),
    ('Put the words in the correct order to make a sentence.', 4)
  ) AS keys(prompt, ord) ON ci.payload->>'prompt' = keys.prompt
  WHERE ci.type = 'exercise'
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(
  jsonb_set(payload #- '{blocks,2,exercises}', '{blocks,2,exerciseIds}',
    (SELECT jsonb_agg(id ORDER BY ord) FROM lesson_exercise_ids)
  ),
  '{blocks,2,instructions}', '"Choose the correct verb form, then put the words in order."'::jsonb
)
WHERE id = '8b64b5b4-ba56-4afe-9e0c-89bfcff4f99e';

WITH lesson_exercise_ids AS (
  SELECT ci.id, keys.ord
  FROM "curriculum"."content_items" ci
  JOIN (VALUES
    ('I like ___ books.', 1),
    ('She loves ___ music.', 2),
    ('They hate ___ up early.', 3),
    ('What is the opposite of ''love''? (one word)', 4),
    ('Build a sentence saying that you like reading books.', 5)
  ) AS keys(prompt, ord) ON ci.payload->>'prompt' = keys.prompt
  WHERE ci.type = 'exercise'
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(
  jsonb_set(payload #- '{blocks,2,exercises}', '{blocks,2,exerciseIds}',
    (SELECT jsonb_agg(id ORDER BY ord) FROM lesson_exercise_ids)
  ),
  '{blocks,2,instructions}', '"Choose the correct form, then answer and build sentences."'::jsonb
)
WHERE id = '1a7848e3-76eb-4011-be34-3a85c830e210';


