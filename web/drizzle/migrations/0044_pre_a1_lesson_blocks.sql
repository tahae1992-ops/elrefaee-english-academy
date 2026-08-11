-- Pre-A1 curriculum, Phase 4: fills the real `blocks` array into each
-- of the 16 lesson shells from 0041, resolving exercise ids (0042) and
-- vocabulary entry ids (0043) by matching on prompt/headword text --
-- same proven pattern as 0019_exercise_content_seed.sql's per-lesson
-- UPDATE. Only the `blocks` key is replaced (jsonb_set on payload) --
-- title/objective/teacherNote from 0041 are untouched.
--
-- Lesson 1 (The Alphabet and Sounds) deliberately has more blocks than
-- the rest -- Pre-A1 blueprint Rev. 3 Rule 9's depth exception for the
-- literacy foundation lesson, not a mistake.

-- Lesson 1: The Alphabet and Sounds
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
ex1 AS (SELECT jsonb_agg(id) AS ids FROM "curriculum"."content_items" WHERE type = 'exercise' AND payload->>'prompt' = 'Match each big (uppercase) letter to its small (lowercase) letter.'),
ex2 AS (
  SELECT jsonb_agg(id ORDER BY ord) AS ids FROM (
    SELECT ci.id, k.ord FROM "curriculum"."content_items" ci
    JOIN (VALUES
      ('The letter B makes the /b/ sound, like in the word "ball".', 1),
      ('Which letter makes the /s/ sound?', 2),
      ('The letter M makes the /m/ sound, like in the word "mom".', 3)
    ) AS k(prompt, ord) ON ci.payload->>'prompt' = k.prompt
    WHERE ci.type = 'exercise'
  ) s
),
ex3 AS (
  SELECT jsonb_agg(id ORDER BY ord) AS ids FROM (
    SELECT ci.id, k.ord FROM "curriculum"."content_items" ci
    JOIN (VALUES
      ('Which word says the sound /kaet/ (cat)?', 1),
      ('Which word says the sound /sUHn/ (sun)?', 2)
    ) AS k(prompt, ord) ON ci.payload->>'prompt' = k.prompt
    WHERE ci.type = 'exercise'
  ) s
),
voc1 AS (
  SELECT jsonb_agg(ve.id ORDER BY k.ord) AS ids FROM "curriculum"."vocabulary_entries" ve
  JOIN (VALUES ('cat',1,1),('dog',1,2),('sun',1,3),('pen',1,4)) AS k(headword,sense,ord) ON ve.headword = k.headword AND ve.sense_number = k.sense
  CROSS JOIN academy WHERE ve.academy_id = academy.id
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','Welcome to your first English lesson!','promptAr','أهلاً بك في أول درس إنجليزي لك!','content','Today you will start learning the English alphabet -- the 26 letters used to write every English word.','contentAr','اليوم ستبدأ في تعلم الحروف الإنجليزية الأبجدية، وهي 26 حرفًا تُستخدم لكتابة كل كلمة إنجليزية.'),
  jsonb_build_object('type','presentation','explanation','The English alphabet has 26 letters. Each letter has a big (uppercase) form and a small (lowercase) form.','explanationAr','الأبجدية الإنجليزية لها 26 حرفًا. لكل حرف شكل كبير (Uppercase) وشكل صغير (Lowercase).','examples',jsonb_build_array('A a','B b','C c','D d')),
  jsonb_build_object('type','controlled_practice','instructions','Match the big letters to the small letters.','instructionsAr','طابق الحروف الكبيرة بالحروف الصغيرة.','exerciseIds',(SELECT ids FROM ex1)),
  jsonb_build_object('type','presentation','explanation','Some letters have a sound you can hear and say. B says /b/ like in "ball". S says /s/ like in "sun". M says /m/ like in "mom".','explanationAr','لبعض الحروف صوت يمكنك سماعه ونطقه. B له صوت /b/ مثل ball. S له صوت /s/ مثل sun. M له صوت /m/ مثل mom.','examples',jsonb_build_array('B - ball','S - sun','M - mom')),
  jsonb_build_object('type','controlled_practice','instructions','Choose the correct sound for each letter.','instructionsAr','اختر الصوت الصحيح لكل حرف.','exerciseIds',(SELECT ids FROM ex2)),
  jsonb_build_object('type','presentation','explanation','Five letters are vowels: a, e, i, o, u. Every English word needs at least one vowel sound.','explanationAr','خمسة حروف تسمى أحرف العلة (Vowels): a, e, i, o, u. كل كلمة إنجليزية تحتاج صوت علة واحد على الأقل.','examples',jsonb_build_array('cat has the vowel a','pen has the vowel e')),
  jsonb_build_object('type','controlled_practice','instructions','Listen (in your mind) and choose the correct word.','instructionsAr','استمع (في ذهنك) واختر الكلمة الصحيحة.','exerciseIds',(SELECT ids FROM ex3)),
  jsonb_build_object('type','vocabulary','instructions','Now that you know the sounds, meet your first four English words.','instructionsAr','الآن بعد أن تعرفت على الأصوات، تعرف على أول أربع كلمات إنجليزية.','vocabularyIds',(SELECT ids FROM voc1)),
  jsonb_build_object('type','wrap_up','summary','You learned the alphabet, letter sounds, and your first four words: cat, dog, sun, pen.','targetVocabularyIds',(SELECT ids FROM voc1))
))
WHERE id = (SELECT id FROM "curriculum"."content_items" WHERE type = 'lesson' AND cefr_level = 'pre_a1' AND payload->>'title' = 'The Alphabet and Sounds');

-- Lesson 2: Hello and Goodbye
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
ex AS (
  SELECT jsonb_agg(id ORDER BY ord) AS ids FROM (
    SELECT ci.id, k.ord FROM "curriculum"."content_items" ci
    JOIN (VALUES
      ('It is 8 in the morning. What do you say?', 1),
      ('You are leaving your friend''s house. What do you say?', 2),
      ('"Hi" and "Hello" mean the same thing.', 3)
    ) AS k(prompt, ord) ON ci.payload->>'prompt' = k.prompt
    WHERE ci.type = 'exercise'
  ) s
),
voc AS (
  SELECT jsonb_agg(ve.id ORDER BY k.ord) AS ids FROM "curriculum"."vocabulary_entries" ve
  JOIN (VALUES ('hello',2,1),('hi',2,2),('good morning',1,3),('good night',1,4),('goodbye',1,5),('bye',1,6)) AS k(headword,sense,ord) ON ve.headword = k.headword AND ve.sense_number = k.sense
  CROSS JOIN academy WHERE ve.academy_id = academy.id
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','How do you say hello in your language?','promptAr','كيف تقول مرحبًا بلغتك؟','content','In this lesson you will learn how to greet people in English, and how to say goodbye.','contentAr','في هذا الدرس ستتعلم كيف تحيي الناس بالإنجليزية، وكيف تقول وداعًا.'),
  jsonb_build_object('type','vocabulary','instructions','Learn these greeting words.','instructionsAr','تعلم كلمات التحية هذه.','vocabularyIds',(SELECT ids FROM voc)),
  jsonb_build_object('type','controlled_practice','instructions','Choose the right greeting.','instructionsAr','اختر التحية الصحيحة.','exerciseIds',(SELECT ids FROM ex)),
  jsonb_build_object('type','speaking_practice','instructions','Practice saying hello and goodbye out loud.','instructionsAr','تدرب على قول hello و goodbye بصوت مرتفع.','prompt','Say "Hello, my name is..." and then say "Goodbye" out loud, as if a real person is listening.','promptAr','قل: ''Hello, my name is...'' ثم قل ''Goodbye'' بصوت مرتفع، كأن هناك شخصًا حقيقيًا يستمع.'),
  jsonb_build_object('type','wrap_up','summary','You learned to greet people and say goodbye: hello, hi, good morning, good night, goodbye, bye.','targetVocabularyIds',(SELECT ids FROM voc))
))
WHERE id = (SELECT id FROM "curriculum"."content_items" WHERE type = 'lesson' AND cefr_level = 'pre_a1' AND payload->>'title' = 'Hello and Goodbye');

-- Lesson 3: Numbers 0 to 10
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
ex AS (
  SELECT jsonb_agg(id ORDER BY ord) AS ids FROM (
    SELECT ci.id, k.ord FROM "curriculum"."content_items" ci
    JOIN (VALUES
      ('Put the numbers in order, smallest first.', 1),
      ('What number comes right after "four"?', 2),
      ('"Zero" means nothing -- the number 0.', 3)
    ) AS k(prompt, ord) ON ci.payload->>'prompt' = k.prompt
    WHERE ci.type = 'exercise'
  ) s
),
voc AS (
  SELECT jsonb_agg(ve.id ORDER BY k.ord) AS ids FROM "curriculum"."vocabulary_entries" ve
  JOIN (VALUES ('zero',1,1),('one',1,2),('two',1,3),('three',1,4),('four',1,5),('five',1,6),('six',1,7),('seven',1,8),('eight',1,9),('nine',1,10),('ten',1,11)) AS k(headword,sense,ord) ON ve.headword = k.headword AND ve.sense_number = k.sense
  CROSS JOIN academy WHERE ve.academy_id = academy.id
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','Can you count in your language?','promptAr','هل تستطيع العد بلغتك؟','content','Today you will learn to recognize and say the numbers 0 to 10 in English.','contentAr','اليوم ستتعلم كيف تتعرف على الأرقام من 0 إلى 10 بالإنجليزية وتنطقها.'),
  jsonb_build_object('type','vocabulary','instructions','Learn the numbers 0 to 10.','instructionsAr','تعلم الأرقام من 0 إلى 10.','vocabularyIds',(SELECT ids FROM voc)),
  jsonb_build_object('type','controlled_practice','instructions','Practice with numbers.','instructionsAr','تدرب على الأرقام.','exerciseIds',(SELECT ids FROM ex)),
  jsonb_build_object('type','wrap_up','summary','You can now recognize and say the numbers 0 to 10.','targetVocabularyIds',(SELECT ids FROM voc))
))
WHERE id = (SELECT id FROM "curriculum"."content_items" WHERE type = 'lesson' AND cefr_level = 'pre_a1' AND payload->>'title' = 'Numbers 0 to 10');

-- Lesson 4: Asking for Help
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
ex AS (
  SELECT jsonb_agg(id ORDER BY ord) AS ids FROM (
    SELECT ci.id, k.ord FROM "curriculum"."content_items" ci
    JOIN (VALUES
      ('You don''t understand something. What do you say?', 1),
      ('You want someone to talk more slowly. What do you say?', 2),
      ('"Please help me" is a polite way to ask for help.', 3)
    ) AS k(prompt, ord) ON ci.payload->>'prompt' = k.prompt
    WHERE ci.type = 'exercise'
  ) s
),
voc AS (
  SELECT jsonb_agg(ve.id ORDER BY k.ord) AS ids FROM "curriculum"."vocabulary_entries" ve
  JOIN (VALUES ('please repeat',1,1),('please speak slowly',1,2),('I don''t understand',1,3),('please help me',1,4)) AS k(headword,sense,ord) ON ve.headword = k.headword AND ve.sense_number = k.sense
  CROSS JOIN academy WHERE ve.academy_id = academy.id
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','What do you do when you don''t understand something?','promptAr','ماذا تفعل عندما لا تفهم شيئًا؟','content','Today you will learn 4 important phrases to use when you need help understanding English.','contentAr','اليوم ستتعلم 4 عبارات مهمة تستخدمها عندما تحتاج مساعدة لفهم الإنجليزية.'),
  jsonb_build_object('type','vocabulary','instructions','Learn these helpful phrases.','instructionsAr','تعلم هذه العبارات المفيدة.','vocabularyIds',(SELECT ids FROM voc)),
  jsonb_build_object('type','controlled_practice','instructions','Choose the right phrase.','instructionsAr','اختر العبارة الصحيحة.','exerciseIds',(SELECT ids FROM ex)),
  jsonb_build_object('type','communicative_task','instructions','Use a phrase from this lesson.','instructionsAr','استخدم عبارة من هذا الدرس.','prompt','Imagine you are in an English class and you don''t understand the teacher. Write what you would say.','promptAr','تخيل أنك في فصل إنجليزي ولا تفهم المعلم. اكتب ماذا ستقول.'),
  jsonb_build_object('type','wrap_up','summary','You learned 4 phrases for asking for help: please repeat, please speak slowly, I don''t understand, please help me.','targetVocabularyIds',(SELECT ids FROM voc))
))
WHERE id = (SELECT id FROM "curriculum"."content_items" WHERE type = 'lesson' AND cefr_level = 'pre_a1' AND payload->>'title' = 'Asking for Help');

-- Lesson 5: I Am / You Are
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
ex AS (
  SELECT jsonb_agg(id ORDER BY ord) AS ids FROM (
    SELECT ci.id, k.ord FROM "curriculum"."content_items" ci
    JOIN (VALUES
      ('Complete: "I ___ Sara."', 1),
      ('How do you say your age? "I ___ 20 years old."', 2),
      ('We use the word "am" with "I".', 3)
    ) AS k(prompt, ord) ON ci.payload->>'prompt' = k.prompt
    WHERE ci.type = 'exercise'
  ) s
),
voc AS (
  SELECT jsonb_agg(ve.id ORDER BY k.ord) AS ids FROM "curriculum"."vocabulary_entries" ve
  JOIN (VALUES ('name',1,1),('age',1,2),('years old',1,3)) AS k(headword,sense,ord) ON ve.headword = k.headword AND ve.sense_number = k.sense
  CROSS JOIN academy WHERE ve.academy_id = academy.id
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','How do you introduce yourself?','promptAr','كيف تُعرّف بنفسك؟','content','Today you will learn to say your name and age using "I am".','contentAr','اليوم ستتعلم أن تقول اسمك وعمرك باستخدام I am.'),
  jsonb_build_object('type','presentation','explanation','Use "I am" to talk about yourself: I am [name]. I am [number] years old.','explanationAr','استخدم I am للتحدث عن نفسك: I am [الاسم]. I am [الرقم] years old.','examples',jsonb_build_array('I am Sara.','I am 20 years old.')),
  jsonb_build_object('type','vocabulary','instructions','Learn these words for introducing yourself.','instructionsAr','تعلم هذه الكلمات للتعريف بنفسك.','vocabularyIds',(SELECT ids FROM voc)),
  jsonb_build_object('type','controlled_practice','instructions','Practice with "I am".','instructionsAr','تدرب على I am.','exerciseIds',(SELECT ids FROM ex)),
  jsonb_build_object('type','communicative_task','instructions','Introduce yourself.','instructionsAr','عرّف بنفسك.','prompt','Write one sentence with your name, and one sentence with your age, using "I am".','promptAr','اكتب جملة باسمك، وجملة بعمرك، باستخدام I am.'),
  jsonb_build_object('type','wrap_up','summary','You can now say your name and age using "I am".','targetVocabularyIds',(SELECT ids FROM voc))
))
WHERE id = (SELECT id FROM "curriculum"."content_items" WHERE type = 'lesson' AND cefr_level = 'pre_a1' AND payload->>'title' = 'I Am / You Are');

-- Lesson 6: This Is My...
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
ex AS (
  SELECT jsonb_agg(id ORDER BY ord) AS ids FROM (
    SELECT ci.id, k.ord FROM "curriculum"."content_items" ci
    JOIN (VALUES
      ('You are holding a book. You say: "___ is my book."', 1),
      ('A pen is far away, on another table. You say: "___ is your pen."', 2),
      ('Match the possessive word to the person it belongs to.', 3)
    ) AS k(prompt, ord) ON ci.payload->>'prompt' = k.prompt
    WHERE ci.type = 'exercise'
  ) s
),
voc AS (
  SELECT jsonb_agg(ve.id ORDER BY k.ord) AS ids FROM "curriculum"."vocabulary_entries" ve
  JOIN (VALUES ('this',1,1),('that',1,2),('my',1,3),('your',1,4)) AS k(headword,sense,ord) ON ve.headword = k.headword AND ve.sense_number = k.sense
  CROSS JOIN academy WHERE ve.academy_id = academy.id
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','Look at an object near you. What is it?','promptAr','انظر إلى شيء بالقرب منك. ما هو؟','content','Today you will learn to point to things and say "this" (close) or "that" (far), and "my"/"your".','contentAr','اليوم ستتعلم أن تشير إلى الأشياء وتقول this (قريب) أو that (بعيد)، وmy/your.'),
  jsonb_build_object('type','presentation','explanation','"This" is for something close to you. "That" is for something far away. "My" means it belongs to me. "Your" means it belongs to you.','explanationAr','This لشيء قريب منك. That لشيء بعيد. My تعني أنه يخصني. Your تعني أنه يخصك.','examples',jsonb_build_array('This is my book.','That is your pen.')),
  jsonb_build_object('type','vocabulary','instructions','Learn these small but important words.','instructionsAr','تعلم هذه الكلمات الصغيرة المهمة.','vocabularyIds',(SELECT ids FROM voc)),
  jsonb_build_object('type','controlled_practice','instructions','Choose this or that, my or your.','instructionsAr','اختر this أو that، my أو your.','exerciseIds',(SELECT ids FROM ex)),
  jsonb_build_object('type','wrap_up','summary','You can now point to objects using this/that and my/your.','targetVocabularyIds',(SELECT ids FROM voc))
))
WHERE id = (SELECT id FROM "curriculum"."content_items" WHERE type = 'lesson' AND cefr_level = 'pre_a1' AND payload->>'title' = 'This Is My...');

-- Lesson 7: My Family
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
ex AS (
  SELECT jsonb_agg(id ORDER BY ord) AS ids FROM (
    SELECT ci.id, k.ord FROM "curriculum"."content_items" ci
    JOIN (VALUES
      ('A woman who has children is your ___.', 1),
      ('A man who has children is your ___.', 2),
      ('"Family" can mean your mother, father, brothers, and sisters together.', 3)
    ) AS k(prompt, ord) ON ci.payload->>'prompt' = k.prompt
    WHERE ci.type = 'exercise'
  ) s
),
voc AS (
  SELECT jsonb_agg(ve.id ORDER BY k.ord) AS ids FROM "curriculum"."vocabulary_entries" ve
  JOIN (VALUES ('mother',1,1),('father',1,2),('brother',2,3),('sister',2,4),('family',1,5)) AS k(headword,sense,ord) ON ve.headword = k.headword AND ve.sense_number = k.sense
  CROSS JOIN academy WHERE ve.academy_id = academy.id
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','Think about your family. Who is in it?','promptAr','فكر في عائلتك. من فيها؟','content','Today you will learn the words for your closest family members.','contentAr','اليوم ستتعلم كلمات لأقرب أفراد عائلتك.'),
  jsonb_build_object('type','vocabulary','instructions','Learn these family words.','instructionsAr','تعلم كلمات العائلة هذه.','vocabularyIds',(SELECT ids FROM voc)),
  jsonb_build_object('type','controlled_practice','instructions','Practice family words.','instructionsAr','تدرب على كلمات العائلة.','exerciseIds',(SELECT ids FROM ex)),
  jsonb_build_object('type','speaking_practice','instructions','Talk about your family.','instructionsAr','تحدث عن عائلتك.','prompt','Say out loud: "This is my mother" / "This is my father", using real people from your family.','promptAr','قل بصوت مرتفع: ''This is my mother'' / ''This is my father''، مستخدمًا أفرادًا حقيقيين من عائلتك.'),
  jsonb_build_object('type','wrap_up','summary','You learned the words for family: mother, father, brother, sister, family.','targetVocabularyIds',(SELECT ids FROM voc))
))
WHERE id = (SELECT id FROM "curriculum"."content_items" WHERE type = 'lesson' AND cefr_level = 'pre_a1' AND payload->>'title' = 'My Family');

-- Lesson 8: Where Are You From?
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
ex AS (
  SELECT jsonb_agg(id ORDER BY ord) AS ids FROM (
    SELECT ci.id, k.ord FROM "curriculum"."content_items" ci
    JOIN (VALUES
      ('Complete: "I am ___ Egypt."', 1),
      ('How do you ask where someone is from?', 2),
      ('"I am from Egypt" tells us the speaker''s country.', 3)
    ) AS k(prompt, ord) ON ci.payload->>'prompt' = k.prompt
    WHERE ci.type = 'exercise'
  ) s
),
voc AS (
  SELECT jsonb_agg(ve.id ORDER BY k.ord) AS ids FROM "curriculum"."vocabulary_entries" ve
  JOIN (VALUES ('country',1,1),('from',2,2),('Egypt',1,3)) AS k(headword,sense,ord) ON ve.headword = k.headword AND ve.sense_number = k.sense
  CROSS JOIN academy WHERE ve.academy_id = academy.id
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','What is the name of your country?','promptAr','ما اسم بلدك؟','content','Today you will learn to say what country you are from.','contentAr','اليوم ستتعلم أن تقول من أي بلد أنت.'),
  jsonb_build_object('type','presentation','explanation','Use "from" + a country to say where you are from: I am from Egypt.','explanationAr','استخدم from + اسم البلد لتقول من أين أنت: I am from Egypt.','examples',jsonb_build_array('I am from Egypt.','Where are you from?')),
  jsonb_build_object('type','vocabulary','instructions','Learn these words.','instructionsAr','تعلم هذه الكلمات.','vocabularyIds',(SELECT ids FROM voc)),
  jsonb_build_object('type','controlled_practice','instructions','Practice with "from".','instructionsAr','تدرب على from.','exerciseIds',(SELECT ids FROM ex)),
  jsonb_build_object('type','communicative_task','instructions','Say where you are from.','instructionsAr','قل من أين أنت.','prompt','Write: "I am from ___." with your own country''s name.','promptAr','اكتب: ''I am from ___.'' باسم بلدك.'),
  jsonb_build_object('type','wrap_up','summary','You can now say what country you are from.','targetVocabularyIds',(SELECT ids FROM voc))
))
WHERE id = (SELECT id FROM "curriculum"."content_items" WHERE type = 'lesson' AND cefr_level = 'pre_a1' AND payload->>'title' = 'Where Are You From?');

-- Lesson 9: Colors and Objects
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
ex AS (
  SELECT jsonb_agg(id ORDER BY ord) AS ids FROM (
    SELECT ci.id, k.ord FROM "curriculum"."content_items" ci
    JOIN (VALUES
      ('Match each color to something that is usually that color.', 1),
      ('What color is grass?', 2),
      ('A "book" is something you read.', 3)
    ) AS k(prompt, ord) ON ci.payload->>'prompt' = k.prompt
    WHERE ci.type = 'exercise'
  ) s
),
voc AS (
  SELECT jsonb_agg(ve.id ORDER BY k.ord) AS ids FROM "curriculum"."vocabulary_entries" ve
  JOIN (VALUES ('red',1,1),('blue',1,2),('green',1,3),('yellow',1,4),('book',1,5)) AS k(headword,sense,ord) ON ve.headword = k.headword AND ve.sense_number = k.sense
  CROSS JOIN academy WHERE ve.academy_id = academy.id
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','What is your favorite color?','promptAr','ما لونك المفضل؟','content','Today you will learn 5 colors and how to use them with an everyday object.','contentAr','اليوم ستتعلم 5 ألوان وكيفية استخدامها مع شيء يومي.'),
  jsonb_build_object('type','vocabulary','instructions','Learn these colors and one object.','instructionsAr','تعلم هذه الألوان وشيئًا واحدًا.','vocabularyIds',(SELECT ids FROM voc)),
  jsonb_build_object('type','controlled_practice','instructions','Practice with colors.','instructionsAr','تدرب على الألوان.','exerciseIds',(SELECT ids FROM ex)),
  jsonb_build_object('type','wrap_up','summary','You learned 5 colors and the word "book".','targetVocabularyIds',(SELECT ids FROM voc))
))
WHERE id = (SELECT id FROM "curriculum"."content_items" WHERE type = 'lesson' AND cefr_level = 'pre_a1' AND payload->>'title' = 'Colors and Objects');

-- Lesson 10: A, An, The
WITH ex AS (
  SELECT jsonb_agg(id ORDER BY ord) AS ids FROM (
    SELECT ci.id, k.ord FROM "curriculum"."content_items" ci
    JOIN (VALUES
      ('Choose the correct word: "___ apple" (apple starts with a vowel sound).', 1),
      ('Choose the correct word: "___ book" (book starts with a consonant sound).', 2),
      ('Complete: "I have ___ pen."', 3)
    ) AS k(prompt, ord) ON ci.payload->>'prompt' = k.prompt
    WHERE ci.type = 'exercise'
  ) s
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','Look at a book near you. Is it "a book" or "the book"?','promptAr','انظر إلى كتاب قريب منك. هل هو a book أم the book؟','content','Today you will learn when to use "a", "an", and "the".','contentAr','اليوم ستتعلم متى تستخدم a وan وthe.'),
  jsonb_build_object('type','presentation','explanation','Use "a" before a consonant sound (a book). Use "an" before a vowel sound (an apple). Use "the" for something already known.','explanationAr','استخدم a قبل صوت ساكن (a book). استخدم an قبل صوت متحرك (an apple). استخدم the لشيء معروف بالفعل.','examples',jsonb_build_array('a book','an apple','the sun (there is only one)')),
  jsonb_build_object('type','controlled_practice','instructions','Choose a, an, or the.','instructionsAr','اختر a أو an أو the.','exerciseIds',(SELECT ids FROM ex)),
  jsonb_build_object('type','wrap_up','summary','You learned when to use a, an, and the.','targetVocabularyIds',jsonb_build_array())
))
WHERE id = (SELECT id FROM "curriculum"."content_items" WHERE type = 'lesson' AND cefr_level = 'pre_a1' AND payload->>'title' = 'A, An, The');

-- Lesson 11: One, Two, Many
WITH ex AS (
  SELECT jsonb_agg(id ORDER BY ord) AS ids FROM (
    SELECT ci.id, k.ord FROM "curriculum"."content_items" ci
    JOIN (VALUES
      ('Complete: "One cat, two ___."', 1),
      ('Complete: "One book, two ___."', 2),
      ('We usually add "-s" to a noun to make it plural (more than one).', 3)
    ) AS k(prompt, ord) ON ci.payload->>'prompt' = k.prompt
    WHERE ci.type = 'exercise'
  ) s
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','If you have one cat, what do you say if you have two?','promptAr','إذا كان لديك قطة واحدة، ماذا تقول إذا كان لديك اثنتان؟','content','Today you will learn how to make English words plural (more than one) by adding -s.','contentAr','اليوم ستتعلم كيف تجعل الكلمات الإنجليزية جمعًا (أكثر من واحد) بإضافة -s.'),
  jsonb_build_object('type','presentation','explanation','To make most nouns plural, add -s: cat -> cats, book -> books.','explanationAr','لجعل معظم الأسماء جمعًا، أضف -s: cat → cats، book → books.','examples',jsonb_build_array('one cat, two cats','one book, two books')),
  jsonb_build_object('type','controlled_practice','instructions','Make the plural.','instructionsAr','اجعلها جمعًا.','exerciseIds',(SELECT ids FROM ex)),
  jsonb_build_object('type','wrap_up','summary','You learned to make plurals by adding -s.','targetVocabularyIds',jsonb_build_array())
))
WHERE id = (SELECT id FROM "curriculum"."content_items" WHERE type = 'lesson' AND cefr_level = 'pre_a1' AND payload->>'title' = 'One, Two, Many');

-- Lesson 12: In My Bag
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
ex AS (
  SELECT jsonb_agg(id ORDER BY ord) AS ids FROM (
    SELECT ci.id, k.ord FROM "curriculum"."content_items" ci
    JOIN (VALUES
      ('"I ___ a phone in my bag." (you own one)', 1),
      ('"I don''t have a key" means you do NOT have a key.', 2),
      ('Match each object to what it is used for.', 3)
    ) AS k(prompt, ord) ON ci.payload->>'prompt' = k.prompt
    WHERE ci.type = 'exercise'
  ) s
),
voc AS (
  SELECT jsonb_agg(ve.id ORDER BY k.ord) AS ids FROM "curriculum"."vocabulary_entries" ve
  JOIN (VALUES ('bag',1,1),('phone',1,2),('key',1,3)) AS k(headword,sense,ord) ON ve.headword = k.headword AND ve.sense_number = k.sense
  CROSS JOIN academy WHERE ve.academy_id = academy.id
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','What is in your bag today?','promptAr','ماذا يوجد في حقيبتك اليوم؟','content','Today you will learn to say what you have and don''t have, using "have".','contentAr','اليوم ستتعلم أن تقول ما تملكه وما لا تملكه باستخدام have.'),
  jsonb_build_object('type','vocabulary','instructions','Learn these things you might carry.','instructionsAr','تعلم هذه الأشياء التي قد تحملها.','vocabularyIds',(SELECT ids FROM voc)),
  jsonb_build_object('type','presentation','explanation','Use "have" to say what you own: I have a phone. Use "don''t have" for the negative: I don''t have a key.','explanationAr','استخدم have لتقول ما تملكه: I have a phone. استخدم don''t have للنفي: I don''t have a key.','examples',jsonb_build_array('I have a phone.','I don''t have a key.')),
  jsonb_build_object('type','controlled_practice','instructions','Practice with "have".','instructionsAr','تدرب على have.','exerciseIds',(SELECT ids FROM ex)),
  jsonb_build_object('type','communicative_task','instructions','Talk about your bag.','instructionsAr','تحدث عن حقيبتك.','prompt','Write 2 sentences about what is in your bag, using "I have...".','promptAr','اكتب جملتين عما يوجد في حقيبتك، مستخدمًا I have...'),
  jsonb_build_object('type','wrap_up','summary','You learned to say what you have using "have": bag, phone, key.','targetVocabularyIds',(SELECT ids FROM voc))
))
WHERE id = (SELECT id FROM "curriculum"."content_items" WHERE type = 'lesson' AND cefr_level = 'pre_a1' AND payload->>'title' = 'In My Bag');

-- Lesson 13: Days of the Week
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
ex AS (
  SELECT jsonb_agg(id ORDER BY ord) AS ids FROM (
    SELECT ci.id, k.ord FROM "curriculum"."content_items" ci
    JOIN (VALUES
      ('Put the days in order.', 1),
      ('What day comes right after Friday?', 2),
      ('"Today" means the day happening right now.', 3)
    ) AS k(prompt, ord) ON ci.payload->>'prompt' = k.prompt
    WHERE ci.type = 'exercise'
  ) s
),
voc AS (
  SELECT jsonb_agg(ve.id ORDER BY k.ord) AS ids FROM "curriculum"."vocabulary_entries" ve
  JOIN (VALUES ('Monday',1,1),('Tuesday',1,2),('Wednesday',1,3),('Thursday',1,4),('Friday',1,5),('Saturday',1,6),('Sunday',1,7),('today',1,8),('tomorrow',1,9)) AS k(headword,sense,ord) ON ve.headword = k.headword AND ve.sense_number = k.sense
  CROSS JOIN academy WHERE ve.academy_id = academy.id
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','What day is it today?','promptAr','ما هو اليوم اليوم؟','content','Today you will learn the 7 days of the week in order.','contentAr','اليوم ستتعلم أيام الأسبوع السبعة بالترتيب.'),
  jsonb_build_object('type','vocabulary','instructions','Learn the 7 days, plus today and tomorrow.','instructionsAr','تعلم الأيام السبعة، بالإضافة إلى today وtomorrow.','vocabularyIds',(SELECT ids FROM voc)),
  jsonb_build_object('type','controlled_practice','instructions','Practice the days.','instructionsAr','تدرب على الأيام.','exerciseIds',(SELECT ids FROM ex)),
  jsonb_build_object('type','wrap_up','summary','You learned all 7 days of the week, plus today and tomorrow.','targetVocabularyIds',(SELECT ids FROM voc))
))
WHERE id = (SELECT id FROM "curriculum"."content_items" WHERE type = 'lesson' AND cefr_level = 'pre_a1' AND payload->>'title' = 'Days of the Week');

-- Lesson 14: Where Is It?
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
ex AS (
  SELECT jsonb_agg(id ORDER BY ord) AS ids FROM (
    SELECT ci.id, k.ord FROM "curriculum"."content_items" ci
    JOIN (VALUES
      ('The book is ___ the table (on top of it).', 1),
      ('The pen is ___ the box (inside it).', 2),
      ('"At" can describe a place, like "at school".', 3)
    ) AS k(prompt, ord) ON ci.payload->>'prompt' = k.prompt
    WHERE ci.type = 'exercise'
  ) s
),
voc AS (
  SELECT jsonb_agg(ve.id ORDER BY k.ord) AS ids FROM "curriculum"."vocabulary_entries" ve
  JOIN (VALUES ('table',1,1),('box',1,2),('chair',1,3)) AS k(headword,sense,ord) ON ve.headword = k.headword AND ve.sense_number = k.sense
  CROSS JOIN academy WHERE ve.academy_id = academy.id
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','Where is your phone right now?','promptAr','أين هاتفك الآن؟','content','Today you will learn to say where things are using in, on, and at.','contentAr','اليوم ستتعلم أن تقول أين توجد الأشياء باستخدام in وon وat.'),
  jsonb_build_object('type','presentation','explanation','"On" is for a surface (on the table). "In" is for inside something (in the box). "At" is for a place (at school).','explanationAr','on لسطح شيء (on the table). in لداخل شيء (in the box). at لمكان (at school).','examples',jsonb_build_array('The book is on the table.','The pen is in the box.','I am at school.')),
  jsonb_build_object('type','vocabulary','instructions','Learn these places.','instructionsAr','تعلم هذه الأماكن.','vocabularyIds',(SELECT ids FROM voc)),
  jsonb_build_object('type','controlled_practice','instructions','Choose in, on, or at.','instructionsAr','اختر in أو on أو at.','exerciseIds',(SELECT ids FROM ex)),
  jsonb_build_object('type','wrap_up','summary','You learned to say where things are using in, on, and at.','targetVocabularyIds',(SELECT ids FROM voc))
))
WHERE id = (SELECT id FROM "curriculum"."content_items" WHERE type = 'lesson' AND cefr_level = 'pre_a1' AND payload->>'title' = 'Where Is It?');

-- Lesson 15: What Time Is It?
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
ex AS (
  SELECT jsonb_agg(id ORDER BY ord) AS ids FROM (
    SELECT ci.id, k.ord FROM "curriculum"."content_items" ci
    JOIN (VALUES
      ('3:00 is three ___.', 1),
      ('"Half past" means 30 minutes after the hour.', 2),
      ('How do you ask for the time?', 3)
    ) AS k(prompt, ord) ON ci.payload->>'prompt' = k.prompt
    WHERE ci.type = 'exercise'
  ) s
),
voc AS (
  SELECT jsonb_agg(ve.id ORDER BY k.ord) AS ids FROM "curriculum"."vocabulary_entries" ve
  JOIN (VALUES ('clock',1,1),('o''clock',1,2)) AS k(headword,sense,ord) ON ve.headword = k.headword AND ve.sense_number = k.sense
  CROSS JOIN academy WHERE ve.academy_id = academy.id
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','What time is it right now?','promptAr','كم الساعة الآن؟','content','Today you will learn to tell the time on the hour and half hour.','contentAr','اليوم ستتعلم كيف تخبر الوقت بالساعة الكاملة والنصف.'),
  jsonb_build_object('type','vocabulary','instructions','Learn these time words.','instructionsAr','تعلم كلمات الوقت هذه.','vocabularyIds',(SELECT ids FROM voc)),
  jsonb_build_object('type','presentation','explanation','Say "o''clock" for an exact hour: three o''clock (3:00). Say "half past" for 30 minutes after: half past three (3:30).','explanationAr','قل o''clock للساعة الكاملة: three o''clock (3:00). قل half past لـ30 دقيقة بعد الساعة: half past three (3:30).','examples',jsonb_build_array('3:00 = three o''clock','3:30 = half past three')),
  jsonb_build_object('type','controlled_practice','instructions','Practice telling time.','instructionsAr','تدرب على قول الوقت.','exerciseIds',(SELECT ids FROM ex)),
  jsonb_build_object('type','wrap_up','summary','You learned to tell time using o''clock and half past.','targetVocabularyIds',(SELECT ids FROM voc))
))
WHERE id = (SELECT id FROM "curriculum"."content_items" WHERE type = 'lesson' AND cefr_level = 'pre_a1' AND payload->>'title' = 'What Time Is It?');

-- Lesson 16: Pre-A1 Review
WITH ex AS (
  SELECT jsonb_agg(id ORDER BY ord) AS ids FROM (
    SELECT ci.id, k.ord FROM "curriculum"."content_items" ci
    JOIN (VALUES
      ('Match each big (uppercase) letter to its small (lowercase) letter.', 1),
      ('It is 8 in the morning. What do you say?', 2),
      ('Complete: "I ___ Sara."', 3),
      ('A woman who has children is your ___.', 4),
      ('What color is grass?', 5),
      ('Complete: "One cat, two ___."', 6),
      ('What day comes right after Friday?', 7),
      ('The book is ___ the table (on top of it).', 8)
    ) AS k(prompt, ord) ON ci.payload->>'prompt' = k.prompt
    WHERE ci.type = 'exercise'
  ) s
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','Think about everything you have learned in Pre-A1!','promptAr','فكر في كل ما تعلمته في المستوى Pre-A1!','content','This is your last lesson before A1. Let''s review everything -- the alphabet, greetings, numbers, family, colors, and more.','contentAr','هذا آخر درس لك قبل A1. لنراجع كل شيء: الأبجدية، التحيات، الأرقام، العائلة، الألوان، والمزيد.'),
  jsonb_build_object('type','quiz','title','Pre-A1 Final Review','instructions','Answer these questions about everything you learned in Pre-A1.','instructionsAr','أجب عن هذه الأسئلة حول كل ما تعلمته في Pre-A1.','exerciseIds',(SELECT ids FROM ex),'passingScorePercent',60),
  jsonb_build_object('type','speaking_practice','instructions','Show what you learned.','instructionsAr','أظهر ما تعلمته.','prompt','Say out loud: your name, your age, your country, and one color you like. Use full English sentences.','promptAr','قل بصوت مرتفع: اسمك، عمرك، بلدك، ولونًا تحبه. استخدم جملًا إنجليزية كاملة.'),
  jsonb_build_object('type','wrap_up','summary','Congratulations! You finished Pre-A1. You now know the alphabet, greetings, numbers, family words, colors, and simple sentences. You are ready for A1.','targetVocabularyIds',jsonb_build_array())
))
WHERE id = (SELECT id FROM "curriculum"."content_items" WHERE type = 'lesson' AND cefr_level = 'pre_a1' AND payload->>'title' = 'Pre-A1 Review');
