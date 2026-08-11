-- A1 curriculum, Phase 1a: new units (3, 4) + all 11 new/backfill
-- lesson shells (title/objective/teacherNote; blocks:[] placeholder,
-- filled in 0053). Zero edits to the 5 live lessons or Units 1-2's
-- existing rows -- this migration only INSERTs new units/lessons under
-- the existing A1 course.

-- Unit 3 + Unit 4
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
course AS (SELECT id FROM "curriculum"."courses" WHERE cefr_level = 'a1' LIMIT 1),
unit_content_items AS (
  INSERT INTO "curriculum"."content_items" ("academy_id", "type", "cefr_level", "status", "payload")
  SELECT academy.id, 'lesson'::"shared"."content_type", 'a1'::"shared"."cefr_level", 'published'::"shared"."content_status", v.payload::jsonb
  FROM academy, (VALUES
    ('{"title":"Shopping and Numbers","description":"Go shopping, ask about prices, and compare things -- the numbers and phrases you need in a store."}'::jsonb),
    ('{"title":"My Week","description":"Talk about what you like, how often you do things, and how you spend your free time."}'::jsonb)
  ) AS v(payload)
  RETURNING id, payload->>'title' AS title
),
unit_order AS (
  SELECT * FROM (VALUES ('Shopping and Numbers', 3), ('My Week', 4)) AS m(title, order_index)
)
INSERT INTO "curriculum"."units" ("course_id", "content_item_id", "order_index")
SELECT course.id, uci.id, uo.order_index
FROM course, unit_content_items uci
JOIN unit_order uo ON uo.title = uci.title;

-- 11 lesson shells
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1)
INSERT INTO "curriculum"."content_items" ("academy_id", "type", "cefr_level", "status", "payload")
SELECT academy.id, 'lesson'::"shared"."content_type", 'a1'::"shared"."cefr_level", 'published'::"shared"."content_status", v.payload::jsonb
FROM academy, (VALUES
  ('{"title":"Nice to Meet You","objective":"I can introduce myself fully -- name, origin, and family -- in one natural conversation.","teacherNote":{"objective":"Consolidation lesson combining Meeting People + Talking About Yourself + Family and Friends into one role-play; the 4th lesson this unit was missing.","timing":"25-30 min.","commonErrors":"Reverting to isolated sentences instead of a connected introduction.","extension":"Introduce yourself to a real new person using everything from this unit."},"blocks":[]}'::jsonb),
  ('{"title":"On Weekdays / On Weekends","objective":"I can contrast what I usually do on weekdays versus weekends.","teacherNote":{"objective":"Learners use weekday/weekend and usually/sometimes to contrast routines; the 3rd lesson this unit was missing.","timing":"25-30 min.","commonErrors":"Using ''in'' instead of ''on'' with weekday/weekend.","extension":"Write your own weekday and weekend schedule."},"blocks":[]}'::jsonb),
  ('{"title":"A Typical Day","objective":"I can narrate a full day from morning to night in connected sentences.","teacherNote":{"objective":"Review/consolidation of the whole unit -- routines, likes/dislikes, weekday/weekend -- as one narrated day; the 4th lesson this unit was missing.","timing":"25-30 min.","commonErrors":"Losing time-expression variety (repeating ''and then'' instead of at/in/on).","extension":"Record yourself narrating your real day."},"blocks":[]}'::jsonb),
  ('{"title":"At the Store","objective":"I can name basic shopping vocabulary and understand ''Can I help you?''","teacherNote":{"objective":"Learners recognize store/buy/sell/customer and the core shop-greeting function.","timing":"25-30 min.","commonErrors":"Confusing buy/sell direction (who does which)."},"blocks":[]}'::jsonb),
  ('{"title":"How Much Is It?","objective":"I can ask and understand prices using numbers 20-100.","teacherNote":{"objective":"Learners use ''How much is/are...?'' and recognize larger numbers plus price/expensive/cheap.","timing":"25-30 min.","commonErrors":"Confusing is/are with singular/plural prices."},"blocks":[]}'::jsonb),
  ('{"title":"This One or That One?","objective":"I can compare two things using comparative adjectives.","teacherNote":{"objective":"Learners form and use -er comparatives (bigger/smaller/cheaper) in a shopping context.","timing":"25-30 min.","commonErrors":"Forgetting -er or doubling the consonant incorrectly (biger)."},"blocks":[]}'::jsonb),
  ('{"title":"Can I Help You?","objective":"I can complete a full, simple shopping conversation, playing both roles.","teacherNote":{"objective":"Review/consolidation: a full shop role-play combining greetings, prices, and comparisons from this unit.","timing":"25-30 min.","commonErrors":"N/A -- consolidation lesson."},"blocks":[]}'::jsonb),
  ('{"title":"I Like / I Don''t Like","objective":"I can say what I like and don''t like using simple nouns.","teacherNote":{"objective":"Learners use like/don''t like + noun (distinct from Daily Routines'' like/love/hate + -ing, a deliberate spiral recurrence at a different grammar point).","timing":"25-30 min.","commonErrors":"Adding -ing where a plain noun is needed (''I like coffee'', not ''I like drinking coffee'' at this stage)."},"blocks":[]}'::jsonb),
  ('{"title":"How Often?","objective":"I can say how often I do things using frequency adverbs.","teacherNote":{"objective":"Learners use always/often/usually/sometimes/never with correct word order (subject + adverb + verb).","timing":"25-30 min.","commonErrors":"Wrong word order (placing the adverb at the sentence end)."},"blocks":[]}'::jsonb),
  ('{"title":"My Free Time","objective":"I can talk about my free-time activities.","teacherNote":{"objective":"Learners recognize and use free-time vocabulary distinct from Daily Routines'' hobby set (hiking/dancing/watching TV vs swimming/reading/cooking).","timing":"25-30 min.","commonErrors":"N/A -- vocabulary-focused lesson."},"blocks":[]}'::jsonb),
  ('{"title":"A1 Review","objective":"I can show what I have learned across all of A1 before moving to A2.","teacherNote":{"objective":"Final consolidation: a resampled quiz across all 4 units plus a speaking capstone, mirroring the Pre-A1 Review lesson''s pattern.","timing":"25-30 min.","commonErrors":"N/A -- review lesson."},"blocks":[]}'::jsonb)
) AS v(payload);

-- Link lesson shells to their units with the correct order_index.
WITH lesson_meta AS (
  SELECT * FROM (VALUES
    ('Nice to Meet You', 'Everyday Introductions', 4),
    ('On Weekdays / On Weekends', 'Daily Routines', 3),
    ('A Typical Day', 'Daily Routines', 4),
    ('At the Store', 'Shopping and Numbers', 1),
    ('How Much Is It?', 'Shopping and Numbers', 2),
    ('This One or That One?', 'Shopping and Numbers', 3),
    ('Can I Help You?', 'Shopping and Numbers', 4),
    ('I Like / I Don''t Like', 'My Week', 1),
    ('How Often?', 'My Week', 2),
    ('My Free Time', 'My Week', 3),
    ('A1 Review', 'My Week', 4)
  ) AS m(lesson_title, unit_title, order_index)
)
INSERT INTO "curriculum"."lessons" ("unit_id", "content_item_id", "order_index")
SELECT u.id, lci.id, lm.order_index
FROM "curriculum"."content_items" lci
JOIN lesson_meta lm ON lm.lesson_title = lci.payload->>'title'
JOIN "curriculum"."content_items" uci ON uci.payload->>'title' = lm.unit_title AND uci.cefr_level = 'a1'
JOIN "curriculum"."units" u ON u.content_item_id = uci.id
WHERE lci.type = 'lesson' AND lci.cefr_level = 'a1';
