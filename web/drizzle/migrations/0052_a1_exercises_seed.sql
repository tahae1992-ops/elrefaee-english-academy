-- A1 curriculum, Phase 1c: standalone exercise content_items for the
-- 11 new/backfill lessons. 48 exercises across all 7 exercise types.
-- Not yet linked into any lesson block -- linking (plus the full
-- blocks array) happens in 0053, which needs both these ids and the
-- vocabulary ids from 0051.

WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1)
INSERT INTO "curriculum"."content_items" ("academy_id", "type", "cefr_level", "status", "payload")
SELECT academy.id, 'exercise'::"shared"."content_type", 'a1'::"shared"."cefr_level", 'published'::"shared"."content_status", v.payload::jsonb
FROM academy, (VALUES
  -- Unit 1 L4: Nice to Meet You
  ('{"exerciseType":"multiple_choice","prompt":"Complete the introduction: ''Hello, ___! Let me introduce my sister.''","options":["everyone","anybody","nobody"],"correctOptionIndex":0,"explanation":"''Everyone'' is the natural way to greet a group before introducing someone.","arabicHint":"من هي كلمة تعني ''الجميع''؟"}'::jsonb),
  ('{"exerciseType":"ordering","prompt":"Put the introduction in the correct order.","items":["Hello","my","name","is","Sara"],"explanation":"The correct order is: Hello, my name is Sara."}'::jsonb),
  ('{"exerciseType":"true_false","prompt":"''Nice to meet you'' is only used when saying goodbye.","correctAnswer":false,"explanation":"''Nice to meet you'' is used when you meet someone for the first time, not when saying goodbye."}'::jsonb),
  ('{"exerciseType":"short_answer","prompt":"What do you say when you meet someone for the first time? (2-4 words)","acceptedAnswers":["nice to meet you"],"explanation":"''Nice to meet you'' is the standard phrase for a first meeting."}'::jsonb),

  -- Unit 2 L3: On Weekdays / On Weekends
  ('{"exerciseType":"multiple_choice","prompt":"I go to work ___ weekdays.","options":["on","in","at"],"correctOptionIndex":0,"explanation":"Use ''on'' with days and types of days: on weekdays, on Monday.","arabicHint":"استخدم ''on'' مع الأيام"}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"I relax ___ the weekend.","options":["on","in","at"],"correctOptionIndex":0,"explanation":"''On the weekend'' is the standard American English form."}'::jsonb),
  ('{"exerciseType":"fill_in_blank","prompt":"Complete: I ___ wake up at 7. (true almost every day)","acceptedAnswers":["usually"],"explanation":"''Usually'' describes something that happens almost every time."}'::jsonb),
  ('{"exerciseType":"sentence_building","prompt":"Build a sentence saying you sometimes cook dinner.","chunks":["I","sometimes","cook","dinner"],"explanation":"The correct sentence is: ''I sometimes cook dinner.''"}'::jsonb),

  -- Unit 2 L4: A Typical Day
  ('{"exerciseType":"ordering","prompt":"Put the words in order.","items":["I","wake","up","in","the","morning"],"explanation":"The correct order is: I wake up in the morning."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"I have lunch ___ noon.","options":["at","in","on"],"correctOptionIndex":0,"explanation":"Use ''at'' with noon and clock times: at noon, at 7 o''clock.","arabicHint":"استخدم ''at'' مع كلمة noon"}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"I have dinner ___ the evening.","options":["in","at","on"],"correctOptionIndex":0,"explanation":"Use ''in'' with parts of the day: in the morning, in the evening."}'::jsonb),
  ('{"exerciseType":"short_answer","prompt":"What word means ''after that''? (one word, from this unit)","acceptedAnswers":["then"],"explanation":"''Then'' connects two actions in order: I wake up, then I eat."}'::jsonb),
  ('{"exerciseType":"matching","prompt":"Match each time phrase to its meaning.","pairs":[["in the morning","early part of the day"],["at noon","the middle of the day"],["in the evening","later part of the day"]],"explanation":"These phrases describe the three main parts of the day."}'::jsonb),

  -- Unit 3 L1: At the Store
  ('{"exerciseType":"multiple_choice","prompt":"A person who buys things is a ___.","options":["customer","seller","store"],"correctOptionIndex":0,"explanation":"A ''customer'' is a person who buys things at a store.","arabicHint":"من الذي يشتري الأشياء؟"}'::jsonb),
  ('{"exerciseType":"true_false","prompt":"''Sell'' means to give someone money for something.","correctAnswer":false,"explanation":"''Sell'' means to give something to someone who pays for it. ''Buy'' means to give money for something."}'::jsonb),
  ('{"exerciseType":"fill_in_blank","prompt":"I ___ bread every day. (get it by paying money)","acceptedAnswers":["buy"],"explanation":"''Buy'' means to get something by paying money for it."}'::jsonb),
  ('{"exerciseType":"matching","prompt":"Match each word to its meaning.","pairs":[["store","a place to buy things"],["customer","a person who buys things"],["sell","to give something for money"]],"explanation":"These are the core shopping words for this lesson."}'::jsonb),

  -- Unit 3 L2: How Much Is It?
  ('{"exerciseType":"multiple_choice","prompt":"''___ is this shirt?'' is how you ask about a price.","options":["How much","How many","How old"],"correctOptionIndex":0,"explanation":"''How much'' asks about price or amount.","arabicHint":"كيف تسأل عن السعر؟"}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"20 = ___","options":["twenty","twelve","two"],"correctOptionIndex":0,"explanation":"''Twenty'' is the word for the number 20."}'::jsonb),
  ('{"exerciseType":"true_false","prompt":"''Expensive'' means the price is low.","correctAnswer":false,"explanation":"''Expensive'' means the price is high. A low price is ''cheap.''"}'::jsonb),
  ('{"exerciseType":"fill_in_blank","prompt":"This bag is only $2. It''s very ___.","acceptedAnswers":["cheap"],"explanation":"A low price is described as ''cheap.''"}'::jsonb),
  ('{"exerciseType":"short_answer","prompt":"What is the word for 100? (one word)","acceptedAnswers":["hundred","one hundred"],"explanation":"100 is ''one hundred,'' often shortened to ''hundred.''"}'::jsonb),

  -- Unit 3 L3: This One or That One?
  ('{"exerciseType":"multiple_choice","prompt":"This bag is ___ than that one. (more big)","options":["bigger","big","biggest"],"correctOptionIndex":0,"explanation":"Add ''-er'' to short adjectives to compare two things: big → bigger.","arabicHint":"أضف -er للمقارنة بين شيئين"}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"My phone is ___. I want a new one.","options":["old","new","big"],"correctOptionIndex":0,"explanation":"''Old'' is the opposite of ''new'' and fits the context of wanting a replacement."}'::jsonb),
  ('{"exerciseType":"fill_in_blank","prompt":"small → smaller. big → ___.","acceptedAnswers":["bigger"],"explanation":"Comparatives of short adjectives add ''-er'': big → bigger."}'::jsonb),
  ('{"exerciseType":"ordering","prompt":"Put the words in order.","items":["This","bag","is","bigger","than","that","one"],"explanation":"The correct order is: This bag is bigger than that one."}'::jsonb),

  -- Unit 3 L4: Can I Help You?
  ('{"exerciseType":"multiple_choice","prompt":"A shop worker says ''___?'' to offer help.","options":["Can I help you","How old are you","Where are you from"],"correctOptionIndex":0,"explanation":"''Can I help you?'' is the standard phrase shop workers use to offer help.","arabicHint":"ماذا يقول البائع لعرض المساعدة؟"}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"The shop worker gives you your bag and says ''___.''","options":["Here you are","Here I am","There you go home"],"correctOptionIndex":0,"explanation":"''Here you are'' is said when handing something to someone."}'::jsonb),
  ('{"exerciseType":"ordering","prompt":"Put the shop conversation in order.","items":["Can I help you?","How much is this?","It''s ten dollars.","Here you are.","Thank you!"],"explanation":"This is the natural order of a simple shop conversation."}'::jsonb),
  ('{"exerciseType":"short_answer","prompt":"What do you say when you hand something to someone? (2-3 words)","acceptedAnswers":["here you are"],"explanation":"''Here you are'' is said when giving something to someone."}'::jsonb),

  -- Unit 4 L1: I Like / I Don''t Like
  ('{"exerciseType":"multiple_choice","prompt":"I ___ coffee, but I don''t like tea.","options":["like","liking","likes"],"correctOptionIndex":0,"explanation":"Use the base form ''like'' with the subject ''I.''","arabicHint":"استخدم الشكل الأساسي مع I"}'::jsonb),
  ('{"exerciseType":"true_false","prompt":"''I don''t like tea'' means I enjoy tea.","correctAnswer":false,"explanation":"''Don''t like'' means the opposite of enjoying something."}'::jsonb),
  ('{"exerciseType":"fill_in_blank","prompt":"She ___ coffee. (has a positive feeling about)","acceptedAnswers":["likes"],"explanation":"Add ''-s'' for third-person singular (''she'') in the simple present: she likes."}'::jsonb),
  ('{"exerciseType":"sentence_building","prompt":"Build a sentence saying you like coffee.","chunks":["I","like","coffee"],"explanation":"The correct sentence is: ''I like coffee.''"}'::jsonb),

  -- Unit 4 L2: How Often?
  ('{"exerciseType":"multiple_choice","prompt":"I ___ wake up early. (100% of the time)","options":["always","never","sometimes"],"correctOptionIndex":0,"explanation":"''Always'' means 100% of the time.","arabicHint":"أي كلمة تعني 100% من الوقت؟"}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"I ___ eat breakfast at noon. (0% of the time)","options":["never","always","often"],"correctOptionIndex":0,"explanation":"''Never'' means 0% of the time."}'::jsonb),
  ('{"exerciseType":"ordering","prompt":"Put the words in order.","items":["I","often","walk","to","work"],"explanation":"Frequency adverbs like ''often'' usually go before the main verb: I often walk."}'::jsonb),
  ('{"exerciseType":"true_false","prompt":"''Never'' means 100% of the time.","correctAnswer":false,"explanation":"''Never'' means 0% of the time. ''Always'' means 100% of the time."}'::jsonb),

  -- Unit 4 L3: My Free Time
  ('{"exerciseType":"matching","prompt":"Match each activity to its meaning.","pairs":[["hiking","walking outdoors for a long time"],["dancing","moving your body to music"],["watching TV","looking at a screen for shows"]],"explanation":"These are common free-time activities."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"What do you do in your ___ time? (time when you are not working)","options":["free","busy","work"],"correctOptionIndex":0,"explanation":"''Free time'' is time when you are not working or studying.","arabicHint":"ما هو وقت عدم العمل؟"}'::jsonb),
  ('{"exerciseType":"fill_in_blank","prompt":"She loves ___. (moving her body to music)","acceptedAnswers":["dancing"],"explanation":"''Dancing'' means moving your body to music."}'::jsonb),
  ('{"exerciseType":"short_answer","prompt":"Name one free-time activity from this lesson.","acceptedAnswers":["hiking","dancing","watching TV"],"explanation":"Hiking, dancing, and watching TV were the free-time activities in this lesson."}'::jsonb),

  -- Unit 4 L4: A1 Review (resampled across all 4 units)
  ('{"exerciseType":"multiple_choice","prompt":"Complete: ''Nice ___ meet you.''","options":["to","for","at"],"correctOptionIndex":0,"explanation":"The fixed phrase is ''Nice to meet you.''","arabicHint":"مراجعة الوحدة 1"}'::jsonb),
  ('{"exerciseType":"fill_in_blank","prompt":"I ___ wake up at 7 on weekdays. (this happens almost every day)","acceptedAnswers":["usually"],"explanation":"''Usually'' describes something that happens almost every time — Unit 2."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"''___ is this bag?''","options":["How much","How old","What time"],"correctOptionIndex":0,"explanation":"''How much'' asks about price — Unit 3."}'::jsonb),
  ('{"exerciseType":"true_false","prompt":"''Cheap'' means the price is high.","correctAnswer":false,"explanation":"''Cheap'' means the price is low — Unit 3."}'::jsonb),
  ('{"exerciseType":"multiple_choice","prompt":"I ___ tea, but I like coffee.","options":["don''t like","like","likes"],"correctOptionIndex":0,"explanation":"''Don''t like'' is the negative form — Unit 4."}'::jsonb),
  ('{"exerciseType":"ordering","prompt":"Put the words in order.","items":["I","often","go","hiking","on","weekends"],"explanation":"''Often'' goes before the main verb — Unit 4."}'::jsonb)
) AS v(payload);
