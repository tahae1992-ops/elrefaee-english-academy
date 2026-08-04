-- Lesson Viewer seed (authored per the project's established "Claude
-- generates content, user reviews/approves" workflow) -- 1 real A1
-- course structure: 2 units, 5 lessons, each with the full EDD Sec5
-- five-block shape (warm_up/presentation/controlled_practice/
-- communicative_task/wrap_up). controlled_practice exercises are real
-- multiple_choice items with scoring keys, reusing the same pattern
-- already established for assessment.item_bank.

WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
course AS (SELECT id FROM "curriculum"."courses" WHERE cefr_level = 'a1' LIMIT 1),
unit_content_items AS (
  INSERT INTO "curriculum"."content_items" ("academy_id", "type", "cefr_level", "status", "payload")
  SELECT academy.id, 'lesson'::"shared"."content_type", 'a1'::"shared"."cefr_level", 'published'::"shared"."content_status", v.payload::jsonb
  FROM academy, (VALUES
    ('{"title":"Everyday Introductions","description":"Greet people, introduce yourself, and talk about your family and friends."}'::jsonb),
    ('{"title":"Daily Routines","description":"Describe your typical day and talk about the things you like and dislike."}'::jsonb)
  ) AS v(payload)
  RETURNING id, payload->>'title' AS title
),
unit_order AS (
  SELECT * FROM (VALUES
    ('Everyday Introductions', 1),
    ('Daily Routines', 2)
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
  SELECT academy.id, 'lesson'::"shared"."content_type", 'a1'::"shared"."cefr_level", 'published'::"shared"."content_status", v.payload::jsonb
  FROM academy, (VALUES
    ('{"title":"Meeting People","objective":"I can greet someone and introduce myself in a simple conversation.","teacherNote":{"objective":"Learners produce basic greetings and self-introductions using ''be'' + name.","timing":"Warm-up 3 min, Presentation 5 min, Practice 8 min, Task 8 min, Wrap-up 3 min (~27 min total).","commonErrors":"Confusing ''I am'' / ''My name is''; omitting the subject pronoun ''I''; wrong word order in questions (''What your name?'').","extension":"Ask learners to introduce themselves to a family member or write a 2-sentence self-introduction."},"blocks":[{"type":"warm_up","prompt":"Think about the last time you met someone new. What did you say?","content":"In this lesson, you''ll learn how to greet people and introduce yourself in English."},{"type":"presentation","explanation":"To greet someone, use ''Hello'' or ''Hi''. To introduce yourself, say ''My name is ___'' or ''I''m ___''. To ask someone''s name, say ''What''s your name?''","examples":["Hello, my name is Sara.","Hi, I''m Tom. What''s your name?","Nice to meet you!"]},{"type":"controlled_practice","instructions":"Choose the best response for each situation.","exercises":[{"itemType":"multiple_choice","prompt":"Someone says ''Hi, I''m Ana.'' What do you say?","options":["Hi, I''m Marco. Nice to meet you.","Goodbye, Ana.","I don''t know."],"correctOptionIndex":0},{"itemType":"multiple_choice","prompt":"How do you ask someone''s name?","options":["What''s your name?","How old are you?","Where you name?"],"correctOptionIndex":0},{"itemType":"multiple_choice","prompt":"Complete: ''___ name is Wael.''","options":["My","I","Me"],"correctOptionIndex":0}]},{"type":"communicative_task","instructions":"Write a short introduction of yourself, as if meeting a new classmate.","prompt":"Write 2-3 sentences introducing yourself: your name, and one more thing about you (e.g., where you''re from, your job)."},{"type":"wrap_up","summary":"You learned how to greet people and introduce yourself using ''Hello/Hi'', ''My name is...'', and ''What''s your name?''","targetVocabulary":["hello","hi","my name is","nice to meet you","what''s your name"]}]}'::jsonb),
    ('{"title":"Talking About Yourself","objective":"I can talk about basic personal information using the verb ''to be'' and simple present.","teacherNote":{"objective":"Learners use ''be'' (am/is/are) and simple present to state age, job, and origin.","timing":"Warm-up 3, Presentation 6, Practice 8, Task 8, Wrap-up 3 (~28 min).","commonErrors":"Missing ''to be'' (''I from Egypt''); wrong form of ''be'' (''I is''); confusing ''live in'' vs ''from''.","extension":"Learners write 4 sentences about a friend using ''He/She is...''."},"blocks":[{"type":"warm_up","prompt":"What do people usually ask when they first meet you?","content":"Today you''ll practice talking about where you''re from, your age, and your job."},{"type":"presentation","explanation":"Use ''am/is/are'' to talk about yourself: ''I am from Cairo. I am 25 years old. I am a teacher.'' Use ''live in'' for your city: ''I live in Cairo.''","examples":["I am from Egypt.","She is a student.","They are from Spain.","I live in Alexandria."]},{"type":"controlled_practice","instructions":"Choose the correct word.","exercises":[{"itemType":"multiple_choice","prompt":"I ___ from Egypt.","options":["am","is","are"],"correctOptionIndex":0},{"itemType":"multiple_choice","prompt":"She ___ a doctor.","options":["am","is","are"],"correctOptionIndex":1},{"itemType":"multiple_choice","prompt":"They ___ from Morocco.","options":["am","is","are"],"correctOptionIndex":2}]},{"type":"communicative_task","instructions":"Describe yourself in a few sentences.","prompt":"Write 3-4 sentences about yourself: where you''re from, your age, and your job or studies."},{"type":"wrap_up","summary":"You practiced using ''am/is/are'' to talk about your origin, age, and job.","targetVocabulary":["I am","she is","they are","live in","from"]}]}'::jsonb),
    ('{"title":"Family and Friends","objective":"I can describe my family and friends using possessives and simple adjectives.","teacherNote":{"objective":"Learners use possessive adjectives (my/your/his/her) and simple adjectives to describe family members.","timing":"Warm-up 3, Presentation 6, Practice 8, Task 8, Wrap-up 3 (~28 min).","commonErrors":"Confusing ''his''/''her''; using ''is'' with plural family nouns (''My parents is'').","extension":"Learners bring a photo of their family and describe it aloud."},"blocks":[{"type":"warm_up","prompt":"Who is in your family? Think of 3 people.","content":"In this lesson, you''ll learn words for family members and how to describe them."},{"type":"presentation","explanation":"Use possessive adjectives to show who something belongs to: my, your, his, her, our, their. Example: ''This is my brother. His name is Karim.'' Use simple adjectives to describe people: kind, funny, tall, friendly.","examples":["This is my sister. Her name is Layla.","He is my friend. He is very funny.","Our parents are kind."]},{"type":"controlled_practice","instructions":"Choose the correct possessive.","exercises":[{"itemType":"multiple_choice","prompt":"This is my brother. ___ name is Adam.","options":["His","Her","Their"],"correctOptionIndex":0},{"itemType":"multiple_choice","prompt":"That is my mother. ___ name is Huda.","options":["His","Her","Its"],"correctOptionIndex":1},{"itemType":"multiple_choice","prompt":"These are my parents. ___ house is big.","options":["His","Her","Their"],"correctOptionIndex":2}]},{"type":"communicative_task","instructions":"Describe a family member or friend.","prompt":"Write 3 sentences describing one family member or friend: their name, your relationship, and one adjective about them."},{"type":"wrap_up","summary":"You learned possessive adjectives (my/his/her/their) and adjectives to describe family and friends.","targetVocabulary":["brother","sister","parents","friend","kind","funny"]}]}'::jsonb),
    ('{"title":"My Day","objective":"I can describe my daily routine using simple present and time expressions.","teacherNote":{"objective":"Learners use simple present tense and time expressions (at, in the morning) to describe routines.","timing":"Warm-up 3, Presentation 6, Practice 8, Task 8, Wrap-up 3 (~28 min).","commonErrors":"Forgetting third-person -s (''She wake up''); wrong prepositions (''at the morning'').","extension":"Learners create a daily schedule chart in English."},"blocks":[{"type":"warm_up","prompt":"What is the first thing you do every morning?","content":"Today you''ll learn to talk about your daily routine."},{"type":"presentation","explanation":"Use simple present for routines: ''I wake up at 7 o''clock.'' Remember -s for he/she/it: ''She wakes up early.'' Time expressions: in the morning, at night, at 7 o''clock.","examples":["I wake up at 7 am.","She goes to work in the morning.","We have dinner at 8 pm."]},{"type":"controlled_practice","instructions":"Choose the correct verb form.","exercises":[{"itemType":"multiple_choice","prompt":"I ___ up at 7 o''clock.","options":["wake","wakes","waking"],"correctOptionIndex":0},{"itemType":"multiple_choice","prompt":"She ___ to work every day.","options":["go","goes","going"],"correctOptionIndex":1},{"itemType":"multiple_choice","prompt":"We ___ dinner at 8 pm.","options":["have","has","having"],"correctOptionIndex":0}]},{"type":"communicative_task","instructions":"Describe your typical day.","prompt":"Write 4-5 sentences describing your typical daily routine, from morning to night."},{"type":"wrap_up","summary":"You practiced simple present tense and time expressions to describe daily routines.","targetVocabulary":["wake up","go to work","have breakfast","in the morning","at night"]}]}'::jsonb),
    ('{"title":"Likes and Dislikes","objective":"I can talk about things I like and dislike using like/love/hate + -ing.","teacherNote":{"objective":"Learners use like/love/hate + gerund (-ing) to express preferences.","timing":"Warm-up 3, Presentation 6, Practice 8, Task 8, Wrap-up 3 (~28 min).","commonErrors":"Using infinitive instead of -ing (''I like to swimming''); missing -ing (''I like swim'').","extension":"Learners interview a partner about hobbies and report back."},"blocks":[{"type":"warm_up","prompt":"What is one activity you really enjoy?","content":"Today you''ll learn to talk about likes and dislikes."},{"type":"presentation","explanation":"Use like/love/hate + verb-ing to talk about preferences: ''I like reading.'' ''She loves cooking.'' ''They hate waiting.''","examples":["I like swimming.","He loves playing football.","We hate getting up early."]},{"type":"controlled_practice","instructions":"Choose the correct form.","exercises":[{"itemType":"multiple_choice","prompt":"I like ___ books.","options":["read","reads","reading"],"correctOptionIndex":2},{"itemType":"multiple_choice","prompt":"She loves ___ music.","options":["listening to","listen to","listens to"],"correctOptionIndex":0},{"itemType":"multiple_choice","prompt":"They hate ___ up early.","options":["get","getting","gets"],"correctOptionIndex":1}]},{"type":"communicative_task","instructions":"Describe things you like and dislike.","prompt":"Write 3-4 sentences about activities you like, love, or hate doing, and why."},{"type":"wrap_up","summary":"You practiced like/love/hate + -ing to express preferences.","targetVocabulary":["like","love","hate","swimming","reading","cooking"]}]}'::jsonb)
  ) AS v(payload)
  RETURNING id, payload->>'title' AS title
),
lesson_meta AS (
  SELECT * FROM (VALUES
    ('Meeting People', 'Everyday Introductions', 1),
    ('Talking About Yourself', 'Everyday Introductions', 2),
    ('Family and Friends', 'Everyday Introductions', 3),
    ('My Day', 'Daily Routines', 1),
    ('Likes and Dislikes', 'Daily Routines', 2)
  ) AS m(lesson_title, unit_title, order_index)
)
INSERT INTO "curriculum"."lessons" ("unit_id", "content_item_id", "order_index")
SELECT iuwt.unit_id, lci.id, lm.order_index
FROM lesson_content_items lci
JOIN lesson_meta lm ON lm.lesson_title = lci.title
JOIN inserted_units_with_title iuwt ON iuwt.title = lm.unit_title;

