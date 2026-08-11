-- Pre-A1 curriculum, Phase 1: unit + lesson shells only (title,
-- objective, teacherNote; blocks:[] placeholder). Same two-phase
-- pattern as 0016 (shells) + a later migration (0042) that fills real
-- block content in, because the real blocks need exercise/vocabulary
-- ids that don't exist until 0043/0044 seed them.
--
-- The pre_a1 course row itself already exists (0013_curriculum_course_seed.sql
-- seeded one course per CEFR level, including pre_a1, when the Course
-- Catalog slice was built) -- this migration only adds units/lessons
-- under it.

WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
course AS (SELECT id FROM "curriculum"."courses" WHERE cefr_level = 'pre_a1' LIMIT 1),
unit_content_items AS (
  INSERT INTO "curriculum"."content_items" ("academy_id", "type", "cefr_level", "status", "payload")
  SELECT academy.id, 'lesson'::"shared"."content_type", 'pre_a1'::"shared"."cefr_level", 'published'::"shared"."content_status", v.payload::jsonb
  FROM academy, (VALUES
    ('{"title":"First Words","description":"The English alphabet, sounds, greetings, numbers, and phrases for when you need help -- everything a true beginner needs first."}'::jsonb),
    ('{"title":"Me and My World","description":"Talk about yourself: your name, age, family, and where you are from."}'::jsonb),
    ('{"title":"Everyday Things","description":"Colors, objects, and the small words (a, an, the, -s) that connect them."}'::jsonb),
    ('{"title":"Around Me","description":"Days of the week, where things are, and what time it is -- then a review before you move on to A1."}'::jsonb)
  ) AS v(payload)
  RETURNING id, payload->>'title' AS title
),
unit_order AS (
  SELECT * FROM (VALUES
    ('First Words', 1),
    ('Me and My World', 2),
    ('Everyday Things', 3),
    ('Around Me', 4)
  ) AS m(title, order_index)
),
inserted_units AS (
  INSERT INTO "curriculum"."units" ("course_id", "content_item_id", "order_index")
  SELECT course.id, uci.id, uo.order_index
  FROM course, unit_content_items uci
  JOIN unit_order uo ON uo.title = uci.title
  RETURNING id AS unit_id, content_item_id
),
inserted_units_with_title AS (
  SELECT iu.unit_id, uci.title
  FROM inserted_units iu
  JOIN unit_content_items uci ON uci.id = iu.content_item_id
),
lesson_content_items AS (
  INSERT INTO "curriculum"."content_items" ("academy_id", "type", "cefr_level", "status", "payload")
  SELECT academy.id, 'lesson'::"shared"."content_type", 'pre_a1'::"shared"."cefr_level", 'published'::"shared"."content_status", v.payload::jsonb
  FROM academy, (VALUES
    ('{"title":"The Alphabet and Sounds","objective":"I can recognize uppercase and lowercase letters, connect letters to sounds, and read a few very short words.","teacherNote":{"objective":"The literacy foundation for the whole level -- a true zero-English learner must leave this lesson able to recognize letters, connect them to sounds in both directions, and recognize (not yet produce) a handful of very short words.","timing":"This lesson runs long by design (Rule 9''s depth exception) -- 40-50 min, not the usual 25-30. Do not rush it.","commonErrors":"Confusing visually similar letters (b/d, p/q); expecting production (writing/spelling) before recognition is solid.","extension":"Practice writing the alphabet by hand, uppercase and lowercase."},"blocks":[]}'::jsonb),
    ('{"title":"Hello and Goodbye","objective":"I can greet someone and say goodbye at the right time of day.","teacherNote":{"objective":"Learners recognize and use hello/hi and goodbye/bye appropriately.","timing":"25-30 min.","commonErrors":"Using ''goodbye'' when meeting someone (mixing up the two directions of a greeting exchange).","extension":"Practice greeting 3 different people (a friend, a teacher, a stranger)."},"blocks":[]}'::jsonb),
    ('{"title":"Numbers 0 to 10","objective":"I can recognize and say the numbers 0 to 10.","teacherNote":{"objective":"Learners recognize numerals and number words 0-10 and can sequence them.","timing":"25-30 min.","commonErrors":"Confusing ''thirteen''-style teen numbers this early -- deliberately out of scope, covered later.","extension":"Count objects around the room out loud."},"blocks":[]}'::jsonb),
    ('{"title":"Asking for Help","objective":"I can ask someone to repeat, speak slowly, or help me when I don''t understand.","teacherNote":{"objective":"Learners recognize and use the 4 core survival phrases for classroom/real-world confusion.","timing":"25-30 min.","commonErrors":"Silence instead of asking for help -- the point of this lesson is giving learners permission and language to ask.","extension":"Role-play a moment of confusion and practice the response."},"blocks":[]}'::jsonb),

    ('{"title":"I Am / You Are","objective":"I can say my name and age using ''I am''.","teacherNote":{"objective":"Learners produce ''I am [name]'' and ''I am [age] years old''.","timing":"25-30 min.","commonErrors":"Omitting ''am'' entirely (a very common zero-English pattern: ''I Sara'').","extension":"Introduce yourself to 2 new people."},"blocks":[]}'::jsonb),
    ('{"title":"This Is My...","objective":"I can point to something and say ''this is my...'' or ''that is your...''.","teacherNote":{"objective":"Learners use this/that and my/your with concrete, pointable objects.","timing":"25-30 min.","commonErrors":"Confusing this/that (near/far distinction is often new).","extension":"Point around the room and describe 5 objects."},"blocks":[]}'::jsonb),
    ('{"title":"My Family","objective":"I can name my mother, father, brother, and sister.","teacherNote":{"objective":"Learners recognize and use core immediate-family words.","timing":"25-30 min.","commonErrors":"Using ''is'' incorrectly with plural ''family'' members.","extension":"Draw and label your family."},"blocks":[]}'::jsonb),
    ('{"title":"Where Are You From?","objective":"I can say what country I am from.","teacherNote":{"objective":"Learners use ''from + country'' and understand the question ''Where are you from?''.","timing":"25-30 min.","commonErrors":"Dropping the preposition ''from''.","extension":"Ask 3 classmates where they are from."},"blocks":[]}'::jsonb),

    ('{"title":"Colors and Objects","objective":"I can name basic colors and everyday objects.","teacherNote":{"objective":"Learners recognize and name 5 colors and pair them with familiar objects.","timing":"25-30 min.","commonErrors":"Confusing green/blue in early recognition.","extension":"Find 5 objects of different colors at home."},"blocks":[]}'::jsonb),
    ('{"title":"A, An, The","objective":"I can use ''a'', ''an'', and ''the'' correctly with singular nouns.","teacherNote":{"objective":"Learners choose a/an by the following sound and use ''the'' for something already known.","timing":"25-30 min.","commonErrors":"Choosing a/an by spelling instead of sound (''an university'' -- a common error even for higher levels).","extension":"Label 5 objects around you with a/an."},"blocks":[]}'::jsonb),
    ('{"title":"One, Two, Many","objective":"I can make plural nouns by adding -s.","teacherNote":{"objective":"Learners form and recognize regular plural -s.","timing":"25-30 min.","commonErrors":"Forgetting -s entirely when speaking quickly.","extension":"Make 5 singular nouns plural."},"blocks":[]}'::jsonb),
    ('{"title":"In My Bag","objective":"I can say what I have and don''t have using ''have''.","teacherNote":{"objective":"Learners use ''I have'' / ''I don''t have'' with personal objects.","timing":"25-30 min.","commonErrors":"Using ''am'' instead of ''have'' for possession.","extension":"List everything in your own bag using ''I have...''."},"blocks":[]}'::jsonb),

    ('{"title":"Days of the Week","objective":"I can name and sequence the days of the week.","teacherNote":{"objective":"Learners recognize all 7 day names in order and use today/tomorrow.","timing":"25-30 min.","commonErrors":"Mixing up Tuesday/Thursday (visually and phonetically similar).","extension":"Say what day it is today and tomorrow, every day this week."},"blocks":[]}'::jsonb),
    ('{"title":"Where Is It?","objective":"I can say where something is using in, on, and at.","teacherNote":{"objective":"Learners use in/on/at correctly with concrete objects and places.","timing":"25-30 min.","commonErrors":"Using ''on'' for enclosed spaces (should be ''in'').","extension":"Describe where 5 objects are in the room."},"blocks":[]}'::jsonb),
    ('{"title":"What Time Is It?","objective":"I can tell the time on the hour and half hour.","teacherNote":{"objective":"Learners read and say o''clock and half-past times.","timing":"25-30 min.","commonErrors":"Saying ''half'' alone without ''past''.","extension":"Say the current time every hour for a day."},"blocks":[]}'::jsonb),
    ('{"title":"Pre-A1 Review","objective":"I can show what I have learned in Pre-A1 before starting A1.","teacherNote":{"objective":"Consolidation and the pre-A1-level checkpoint gate: a resampled quiz across all 4 units plus a speaking capstone.","timing":"25-30 min.","commonErrors":"N/A -- review lesson.","extension":"Ask the learner to teach one new word to someone else, in English and Arabic."},"blocks":[]}'::jsonb)
  ) AS v(payload)
  RETURNING id, payload->>'title' AS title
),
lesson_meta AS (
  SELECT * FROM (VALUES
    ('The Alphabet and Sounds', 'First Words', 1),
    ('Hello and Goodbye', 'First Words', 2),
    ('Numbers 0 to 10', 'First Words', 3),
    ('Asking for Help', 'First Words', 4),
    ('I Am / You Are', 'Me and My World', 1),
    ('This Is My...', 'Me and My World', 2),
    ('My Family', 'Me and My World', 3),
    ('Where Are You From?', 'Me and My World', 4),
    ('Colors and Objects', 'Everyday Things', 1),
    ('A, An, The', 'Everyday Things', 2),
    ('One, Two, Many', 'Everyday Things', 3),
    ('In My Bag', 'Everyday Things', 4),
    ('Days of the Week', 'Around Me', 1),
    ('Where Is It?', 'Around Me', 2),
    ('What Time Is It?', 'Around Me', 3),
    ('Pre-A1 Review', 'Around Me', 4)
  ) AS m(lesson_title, unit_title, order_index)
)
INSERT INTO "curriculum"."lessons" ("unit_id", "content_item_id", "order_index")
SELECT iuwt.unit_id, lci.id, lm.order_index
FROM lesson_content_items lci
JOIN lesson_meta lm ON lm.lesson_title = lci.title
JOIN inserted_units_with_title iuwt ON iuwt.title = lm.unit_title;
