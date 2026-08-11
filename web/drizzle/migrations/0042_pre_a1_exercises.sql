-- Pre-A1 curriculum, Phase 2: the exercise bank -- real, standalone
-- exercise content_items (type='exercise'), referenced by id from
-- 0043's lesson block content. Every `prompt` string here is unique
-- across the whole seed so 0043 can resolve exercise ids by matching
-- on prompt text, same pattern as 0019_exercise_content_seed.sql.
--
-- Recognition-first by design (Pre-A1 blueprint Rev. 3, Rule 1):
-- mostly multiple_choice/true_false/matching/ordering, minimal
-- fill_in_blank (production), reflecting that a true zero-English
-- learner should not be forced to type/spell before recognition is solid.

WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1)
INSERT INTO "curriculum"."content_items" ("academy_id", "type", "cefr_level", "status", "payload")
SELECT academy.id, 'exercise'::"shared"."content_type", 'pre_a1'::"shared"."cefr_level", 'published'::"shared"."content_status", v.payload::jsonb
FROM academy, (VALUES
  -- Lesson 1: The Alphabet and Sounds
  ('{"exerciseType":"matching","prompt":"Match each big (uppercase) letter to its small (lowercase) letter.","pairs":[["A","a"],["B","b"],["C","c"],["D","d"]],"explanation":"Every letter has a big (uppercase) form and a small (lowercase) form. They look different but are the same letter.","arabicHint":"لكل حرف شكل كبير وشكل صغير."}'::jsonb),
  ('{"exerciseType":"true_false","prompt":"The letter B makes the /b/ sound, like in the word \"ball\".","correctAnswer":true,"explanation":"Yes! B says /b/, like in \"ball\" and \"book\".","arabicHint":"الحرف B له صوت /b/."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"Which letter makes the /s/ sound?","options":["S","M","T"],"correctOptionIndex":0,"explanation":"S makes the /s/ sound, like in \"sun\" and \"sit\".","arabicHint":"أي حرف له صوت /s/؟"}'::jsonb),
  ('{"exerciseType":"true_false","prompt":"The letter M makes the /m/ sound, like in the word \"mom\".","correctAnswer":true,"explanation":"Yes! M says /m/, like in \"mom\" and \"map\".","arabicHint":"الحرف M له صوت /m/."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"Which word says the sound /kaet/ (cat)?","options":["cat","dog","sun"],"correctOptionIndex":0,"explanation":"\"Cat\" is spelled c-a-t and says /kaet/.","arabicHint":"أي كلمة صوتها /kaet/ (قطة)؟"}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"Which word says the sound /sUHn/ (sun)?","options":["dog","pen","sun"],"correctOptionIndex":2,"explanation":"\"Sun\" is spelled s-u-n.","arabicHint":"أي كلمة صوتها /sUHn/ (شمس)؟"}'::jsonb),

  -- Lesson 2: Hello and Goodbye
  ('{"exerciseType":"multiple_choice","prompt":"It is 8 in the morning. What do you say?","options":["Good morning","Good night","Goodbye"],"correctOptionIndex":0,"explanation":"\"Good morning\" is used early in the day.","arabicHint":"الساعة 8 صباحًا. ماذا تقول؟"}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"You are leaving your friend''s house. What do you say?","options":["Hello","Goodbye","Good morning"],"correctOptionIndex":1,"explanation":"\"Goodbye\" is used when you are leaving.","arabicHint":"أنت تغادر بيت صديقك. ماذا تقول؟"}'::jsonb),
  ('{"exerciseType":"true_false","prompt":"\"Hi\" and \"Hello\" mean the same thing.","correctAnswer":true,"explanation":"Yes! \"Hi\" is just a more casual way to say \"Hello\".","arabicHint":"Hi و Hello لهما نفس المعنى."}'::jsonb),

  -- Lesson 3: Numbers 0 to 10
  ('{"exerciseType":"ordering","prompt":"Put the numbers in order, smallest first.","items":["one","two","three","four","five"],"explanation":"The correct order is: one, two, three, four, five.","arabicHint":"رتب الأرقام من الأصغر."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"What number comes right after \"four\"?","options":["three","five","ten"],"correctOptionIndex":1,"explanation":"After four comes five: 1, 2, 3, 4, 5.","arabicHint":"ما الرقم الذي يأتي بعد four؟"}'::jsonb),
  ('{"exerciseType":"true_false","prompt":"\"Zero\" means nothing -- the number 0.","correctAnswer":true,"explanation":"Yes! \"Zero\" is the word for the number 0.","arabicHint":"Zero تعني صفر."}'::jsonb),

  -- Lesson 4: Asking for Help
  ('{"exerciseType":"multiple_choice","prompt":"You don''t understand something. What do you say?","options":["I don''t understand","Goodbye","Thank you"],"correctOptionIndex":0,"explanation":"\"I don''t understand\" tells someone you need help.","arabicHint":"أنت لا تفهم شيئًا. ماذا تقول؟"}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"You want someone to talk more slowly. What do you say?","options":["Please speak slowly","Good night","My name is..."],"correctOptionIndex":0,"explanation":"\"Please speak slowly\" is a polite request to slow down.","arabicHint":"تريد أن يتكلم شخص ما ببطء. ماذا تقول؟"}'::jsonb),
  ('{"exerciseType":"true_false","prompt":"\"Please help me\" is a polite way to ask for help.","correctAnswer":true,"explanation":"Yes! Adding \"please\" makes a request polite.","arabicHint":"Please help me طريقة مهذبة لطلب المساعدة."}'::jsonb),

  -- Lesson 5: I Am / You Are
  ('{"exerciseType":"fill_in_blank","prompt":"Complete: \"I ___ Sara.\"","acceptedAnswers":["am"],"explanation":"We use \"am\" with \"I\": I am Sara.","arabicHint":"أكمل: I ___ Sara."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"How do you say your age? \"I ___ 20 years old.\"","options":["am","is","are"],"correctOptionIndex":0,"explanation":"\"Am\" goes with \"I\": I am 20 years old.","arabicHint":"كيف تقول عمرك؟"}'::jsonb),
  ('{"exerciseType":"true_false","prompt":"We use the word \"am\" with \"I\".","correctAnswer":true,"explanation":"Yes! I am... (not I is / I are).","arabicHint":"نستخدم am مع I."}'::jsonb),

  -- Lesson 6: This Is My...
  ('{"exerciseType":"multiple_choice","prompt":"You are holding a book. You say: \"___ is my book.\"","options":["This","That","These"],"correctOptionIndex":0,"explanation":"\"This\" is for something close to you.","arabicHint":"أنت تمسك كتابًا. ___ is my book."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"A pen is far away, on another table. You say: \"___ is your pen.\"","options":["This","That","My"],"correctOptionIndex":1,"explanation":"\"That\" is for something far from you.","arabicHint":"قلم بعيد على طاولة أخرى. ___ is your pen."}'::jsonb),
  ('{"exerciseType":"matching","prompt":"Match the possessive word to the person it belongs to.","pairs":[["my","me"],["your","you"]],"explanation":"\"My\" belongs to me; \"your\" belongs to you.","arabicHint":"طابق كلمة الملكية بصاحبها."}'::jsonb),

  -- Lesson 7: My Family
  ('{"exerciseType":"multiple_choice","prompt":"A woman who has children is your ___.","options":["mother","brother","friend"],"correctOptionIndex":0,"explanation":"\"Mother\" is the female parent.","arabicHint":"المرأة التي لديها أطفال هي ___."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"A man who has children is your ___.","options":["father","sister","teacher"],"correctOptionIndex":0,"explanation":"\"Father\" is the male parent.","arabicHint":"الرجل الذي لديه أطفال هو ___."}'::jsonb),
  ('{"exerciseType":"true_false","prompt":"\"Family\" can mean your mother, father, brothers, and sisters together.","correctAnswer":true,"explanation":"Yes! \"Family\" is the whole group.","arabicHint":"Family تعني العائلة كلها."}'::jsonb),

  -- Lesson 8: Where Are You From?
  ('{"exerciseType":"fill_in_blank","prompt":"Complete: \"I am ___ Egypt.\"","acceptedAnswers":["from"],"explanation":"We use \"from\" before a country: I am from Egypt.","arabicHint":"أكمل: I am ___ Egypt."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"How do you ask where someone is from?","options":["Where are you from?","What is your name?","How old are you?"],"correctOptionIndex":0,"explanation":"\"Where are you from?\" asks about a person''s country.","arabicHint":"كيف تسأل عن بلد شخص؟"}'::jsonb),
  ('{"exerciseType":"true_false","prompt":"\"I am from Egypt\" tells us the speaker''s country.","correctAnswer":true,"explanation":"Yes! \"From + country\" tells us where someone is from.","arabicHint":"I am from Egypt تخبرنا بالبلد."}'::jsonb),

  -- Lesson 9: Colors and Objects
  ('{"exerciseType":"matching","prompt":"Match each color to something that is usually that color.","pairs":[["red","an apple"],["blue","the sky"],["yellow","the sun"]],"explanation":"These are common color associations.","arabicHint":"طابق كل لون بشيء عادة يكون بهذا اللون."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"What color is grass?","options":["green","red","blue"],"correctOptionIndex":0,"explanation":"Grass is green.","arabicHint":"ما لون العشب؟"}'::jsonb),
  ('{"exerciseType":"true_false","prompt":"A \"book\" is something you read.","correctAnswer":true,"explanation":"Yes! A book has pages you read.","arabicHint":"الكتاب شيء تقرأه."}'::jsonb),

  -- Lesson 10: A, An, The
  ('{"exerciseType":"multiple_choice","prompt":"Choose the correct word: \"___ apple\" (apple starts with a vowel sound).","options":["A","An","The"],"correctOptionIndex":1,"explanation":"Use \"an\" before a vowel sound: an apple.","arabicHint":"apple يبدأ بصوت متحرك، فنستخدم an."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"Choose the correct word: \"___ book\" (book starts with a consonant sound).","options":["A","An","The"],"correctOptionIndex":0,"explanation":"Use \"a\" before a consonant sound: a book.","arabicHint":"book يبدأ بصوت ساكن، فنستخدم a."}'::jsonb),
  ('{"exerciseType":"fill_in_blank","prompt":"Complete: \"I have ___ pen.\"","acceptedAnswers":["a"],"explanation":"\"Pen\" starts with a consonant sound, so we use \"a\".","arabicHint":"أكمل: I have ___ pen."}'::jsonb),

  -- Lesson 11: One, Two, Many
  ('{"exerciseType":"fill_in_blank","prompt":"Complete: \"One cat, two ___.\"","acceptedAnswers":["cats"],"explanation":"Add -s to make \"cat\" plural: cats.","arabicHint":"أكمل الجمع: cat → ___."}'::jsonb),
  ('{"exerciseType":"fill_in_blank","prompt":"Complete: \"One book, two ___.\"","acceptedAnswers":["books"],"explanation":"Add -s to make \"book\" plural: books.","arabicHint":"أكمل الجمع: book → ___."}'::jsonb),
  ('{"exerciseType":"true_false","prompt":"We usually add \"-s\" to a noun to make it plural (more than one).","correctAnswer":true,"explanation":"Yes! cat → cats, book → books.","arabicHint":"نضيف -s عادة لصنع الجمع."}'::jsonb),

  -- Lesson 12: In My Bag
  ('{"exerciseType":"multiple_choice","prompt":"\"I ___ a phone in my bag.\" (you own one)","options":["have","has","am"],"correctOptionIndex":0,"explanation":"We use \"have\" with \"I\": I have a phone.","arabicHint":"I ___ a phone in my bag."}'::jsonb),
  ('{"exerciseType":"true_false","prompt":"\"I don''t have a key\" means you do NOT have a key.","correctAnswer":true,"explanation":"Yes! \"Don''t have\" is the negative of \"have\".","arabicHint":"I don''t have a key تعني أنك لا تملك مفتاحًا."}'::jsonb),
  ('{"exerciseType":"matching","prompt":"Match each object to what it is used for.","pairs":[["key","opens a door"],["phone","for calling someone"],["bag","carries your things"]],"explanation":"These are the everyday uses of each object.","arabicHint":"طابق كل شيء باستخدامه."}'::jsonb),

  -- Lesson 13: Days of the Week
  ('{"exerciseType":"ordering","prompt":"Put the days in order.","items":["Monday","Tuesday","Wednesday"],"explanation":"The week goes: Monday, Tuesday, Wednesday...","arabicHint":"رتب أيام الأسبوع."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"What day comes right after Friday?","options":["Saturday","Sunday","Monday"],"correctOptionIndex":0,"explanation":"After Friday comes Saturday.","arabicHint":"ما اليوم الذي يأتي بعد Friday؟"}'::jsonb),
  ('{"exerciseType":"true_false","prompt":"\"Today\" means the day happening right now.","correctAnswer":true,"explanation":"Yes! \"Today\" is the current day.","arabicHint":"Today تعني اليوم الحالي."}'::jsonb),

  -- Lesson 14: Where Is It?
  ('{"exerciseType":"multiple_choice","prompt":"The book is ___ the table (on top of it).","options":["on","in","at"],"correctOptionIndex":0,"explanation":"\"On\" describes something on top of a surface.","arabicHint":"الكتاب ___ الطاولة (فوقها)."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"The pen is ___ the box (inside it).","options":["on","in","at"],"correctOptionIndex":1,"explanation":"\"In\" describes something inside a container.","arabicHint":"القلم ___ الصندوق (بداخله)."}'::jsonb),
  ('{"exerciseType":"true_false","prompt":"\"At\" can describe a place, like \"at school\".","correctAnswer":true,"explanation":"Yes! \"At\" is used for specific places like \"at school\" or \"at home\".","arabicHint":"At تُستخدم لمكان مثل at school."}'::jsonb),

  -- Lesson 15: What Time Is It?
  ('{"exerciseType":"multiple_choice","prompt":"3:00 is three ___.","options":["o''clock","half","minute"],"correctOptionIndex":0,"explanation":"We say \"o''clock\" for an exact hour: three o''clock.","arabicHint":"3:00 هي الساعة الثالثة ___."}'::jsonb),
  ('{"exerciseType":"true_false","prompt":"\"Half past\" means 30 minutes after the hour.","correctAnswer":true,"explanation":"Yes! Half past three = 3:30.","arabicHint":"Half past تعني 30 دقيقة بعد الساعة."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"How do you ask for the time?","options":["What time is it?","What is your name?","Where are you?"],"correctOptionIndex":0,"explanation":"\"What time is it?\" is how you ask for the time.","arabicHint":"كيف تسأل عن الوقت؟"}'::jsonb)
) AS v(payload);
