-- Fix: 0053 referenced vocabulary_entries.content_item_id in every
-- lesson block's vocabularyIds/targetVocabularyIds array, but
-- GetLessonUseCase resolves those ids through
-- DrizzleVocabularyEntryAdapter.listByIds, which matches against
-- vocabulary_entries.id (its own primary key) -- a different UUID
-- from content_item_id. Real-world confirmation: opening the
-- backfilled "Nice to Meet You" lesson through the production API
-- threw "Vocabulary entry ... referenced by a lesson block was not
-- found", caught via Sentry (JAVASCRIPT-NEXTJS-3) during this
-- session's own E2E test. Exercise ids were unaffected (exercises are
-- content_items rows directly, no separate table, so content_items.id
-- IS the exercise id -- confirmed against DrizzleExerciseAdapter).
--
-- Reissues the exact same 11 UPDATE statements as 0053, with every
-- vocabulary subquery's `content_item_id` swapped for `id`. Nothing
-- else changes.

-- A1 curriculum, Phase 1d: full lesson content (blocks array) for all
-- 11 new/backfill lessons, referencing the vocabulary (0051) and
-- exercise (0052) content_items authored above. One UPDATE per lesson
-- (not one WITH chain) -- same reason as 0019/0022: a WITH clause's
-- CTEs don't persist across statement boundaries and Postgres only
-- allows one data-modifying statement per WITH chain.
--
-- Arabic-density policy for A1 (deliberately less than Pre-A1, per
-- "less dependence on Arabic... increasing English exposure"):
-- warm_up carries no Arabic; presentation keeps explanationAr (a new
-- grammar point still needs an Arabic explanation); vocabulary/
-- controlled_practice/communicative_task/speaking_practice carry no
-- instructionsAr/promptAr; exercises carry arabicHint on roughly the
-- first item of each practice set, not every item.
--
-- Grammar/vocabulary lessons use a 5-block pattern (warm_up,
-- presentation, vocabulary, controlled_practice, wrap_up).
-- Consolidation lessons (the unit's 4th lesson) use (warm_up,
-- vocabulary or none, communicative_task/speaking_practice,
-- controlled_practice, wrap_up) -- Template 4 "Review & Consolidation"
-- from the approved Blueprint.

-- Unit 1 L4: Nice to Meet You (consolidation)
UPDATE "curriculum"."content_items" SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','Look at the picture: a group of new students meeting for the first time.','content','Think about how you introduce yourself, where you are from, and your family in English.'),
  jsonb_build_object('type','vocabulary','instructions','Learn these phrases for introducing people.','vocabularyIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='let me introduce' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='everyone' AND cefr_level='a1')
  )),
  jsonb_build_object('type','communicative_task','instructions','Work with a partner. Introduce yourself, then introduce an imaginary family member.','prompt','Hello, everyone! My name is ___. Let me introduce my ___. This is ___.'),
  jsonb_build_object('type','controlled_practice','instructions','Practice everything from this unit in one conversation.','exerciseIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='Complete the introduction: ''Hello, ___! Let me introduce my sister.'''),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='Put the introduction in the correct order.'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='''Nice to meet you'' is only used when saying goodbye.'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='What do you say when you meet someone for the first time? (2-4 words)')
  )),
  jsonb_build_object('type','wrap_up','summary','You can now introduce yourself, your name, where you''re from, and your family in one connected conversation.','targetVocabularyIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='let me introduce' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='everyone' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='brother' AND cefr_level='a1' AND sense_number=1),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='sister' AND cefr_level='a1' AND sense_number=1)
  ))
))
WHERE id = '85ca99ac-b4ce-4ebd-ba24-3cc7719049ea';

-- Unit 2 L3: On Weekdays / On Weekends
UPDATE "curriculum"."content_items" SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','Look at a weekly calendar.','content','Monday to Friday are weekdays. Saturday and Sunday are the weekend.'),
  jsonb_build_object('type','presentation','explanation','We use ''usually'' and ''sometimes'' to say how often something happens, and ''on'' with weekdays and weekends.','examples', jsonb_build_array('I usually wake up at 7 on weekdays.','I sometimes sleep late on the weekend.','On weekdays, I go to work.'),'explanationAr','نستخدم usually وsometimes لوصف عدد مرات حدوث الشيء، ونستخدم on مع أيام الأسبوع.'),
  jsonb_build_object('type','vocabulary','instructions','Learn these words.','vocabularyIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='weekday' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='weekend' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='usually' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='sometimes' AND cefr_level='a1')
  )),
  jsonb_build_object('type','controlled_practice','instructions','Choose the correct word, then build the sentence.','exerciseIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='I go to work ___ weekdays.'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='I relax ___ the weekend.'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='Complete: I ___ wake up at 7. (true almost every day)'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='Build a sentence saying you sometimes cook dinner.')
  )),
  jsonb_build_object('type','wrap_up','summary','You can now contrast your weekday and weekend routines using ''usually'' and ''sometimes''.','targetVocabularyIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='weekday' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='weekend' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='usually' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='sometimes' AND cefr_level='a1')
  ))
))
WHERE id = 'dd6e7fd9-59a8-4209-be4c-45c8c1c42897';

-- Unit 2 L4: A Typical Day (consolidation)
UPDATE "curriculum"."content_items" SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','Think about your whole day, from morning to night.','content','Today you will narrate a full day using everything from this unit.'),
  jsonb_build_object('type','vocabulary','instructions','New time words for this lesson.','vocabularyIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='in the evening' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='at noon' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='then' AND cefr_level='a1')
  )),
  jsonb_build_object('type','speaking_practice','instructions','Practice narrating your day out loud.','prompt','Talk about your typical day: what you do in the morning, at noon, and in the evening.'),
  jsonb_build_object('type','controlled_practice','instructions','Review exercises for the whole unit.','exerciseIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='Put the words in order.' AND payload->'items'->0 = '"I"' AND payload->'items'->1 = '"wake"'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='I have lunch ___ noon.'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='I have dinner ___ the evening.'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='What word means ''after that''? (one word, from this unit)'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='Match each time phrase to its meaning.')
  )),
  jsonb_build_object('type','wrap_up','summary','You can now narrate a full day from morning to night using connected time expressions.','targetVocabularyIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='in the evening' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='at noon' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='then' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='in the morning' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='at night' AND cefr_level='a1')
  ))
))
WHERE id = '4ca8c60d-1078-4e51-87c5-52842c669c2f';

-- Unit 3 L1: At the Store
UPDATE "curriculum"."content_items" SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','Look at a picture of a small store.','content','Today you will learn words for shopping.'),
  jsonb_build_object('type','presentation','explanation','A store is a place to buy things. A customer buys things. A seller sells things.','examples', jsonb_build_array('I go to the store.','The customer buys bread.','They sell fruit at the store.'),'explanationAr','المتجر مكان لشراء الأشياء. الزبون يشتري، والبائع يبيع.'),
  jsonb_build_object('type','vocabulary','instructions','Learn these words.','vocabularyIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='store' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='buy' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='sell' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='customer' AND cefr_level='a1')
  )),
  jsonb_build_object('type','controlled_practice','instructions','Choose the correct word.','exerciseIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='A person who buys things is a ___.'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='''Sell'' means to give someone money for something.'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='I ___ bread every day. (get it by paying money)'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='Match each word to its meaning.' AND payload->'pairs'->0->0 = '"store"')
  )),
  jsonb_build_object('type','wrap_up','summary','You can now name basic shopping vocabulary and understand who buys and who sells.','targetVocabularyIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='store' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='buy' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='sell' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='customer' AND cefr_level='a1')
  ))
))
WHERE id = '7e132eee-17d9-4121-a817-d864e811c305';

-- Unit 3 L2: How Much Is It?
UPDATE "curriculum"."content_items" SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','Look at price tags in a store.','content','Today you will ask about prices using numbers.'),
  jsonb_build_object('type','presentation','explanation','We ask about price with ''How much is/are...?''. Twenty, thirty... hundred are larger numbers.','examples', jsonb_build_array('How much is this shirt? It''s twenty dollars.','That bag is expensive. This pen is cheap.','It costs one hundred dollars.'),'explanationAr','نسأل عن السعر بـ How much؟ والأرقام الكبيرة مثل عشرون ومئة.'),
  jsonb_build_object('type','vocabulary','instructions','Learn these words.','vocabularyIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='how much' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='price' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='expensive' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='cheap' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='twenty' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='hundred' AND cefr_level='a1')
  )),
  jsonb_build_object('type','controlled_practice','instructions','Answer each question about prices.','exerciseIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='''___ is this shirt?'' is how you ask about a price.'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='20 = ___'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='''Expensive'' means the price is low.'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='This bag is only $2. It''s very ___.'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='What is the word for 100? (one word)')
  )),
  jsonb_build_object('type','wrap_up','summary','You can now ask and understand prices using numbers 20-100.','targetVocabularyIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='how much' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='price' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='expensive' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='cheap' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='twenty' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='hundred' AND cefr_level='a1')
  ))
))
WHERE id = 'ee0f0e10-a1d2-45df-886a-2a2c9e4fa93c';

-- Unit 3 L3: This One or That One?
UPDATE "curriculum"."content_items" SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','Look at two bags: one big and one small.','content','Today you will compare two things.'),
  jsonb_build_object('type','presentation','explanation','Add ''-er'' to short adjectives to compare two things: big → bigger, small → smaller.','examples', jsonb_build_array('This bag is bigger than that one.','That phone is smaller than this one.','My phone is old. I want a new one.'),'explanationAr','أضف -er للمقارنة بين شيئين: big → bigger.'),
  jsonb_build_object('type','vocabulary','instructions','Learn these words.','vocabularyIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='big' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='small' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='old' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='new' AND cefr_level='a1')
  )),
  jsonb_build_object('type','controlled_practice','instructions','Choose the correct comparative, then put the words in order.','exerciseIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='This bag is ___ than that one. (more big)'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='My phone is ___. I want a new one.'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='small → smaller. big → ___.'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='Put the words in order.' AND payload->'items'->0 = '"This"')
  )),
  jsonb_build_object('type','wrap_up','summary','You can now compare two things using comparative adjectives.','targetVocabularyIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='big' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='small' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='old' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='new' AND cefr_level='a1')
  ))
))
WHERE id = '763c97ba-170e-426f-9cdb-2f51bf250826';

-- Unit 3 L4: Can I Help You? (consolidation)
UPDATE "curriculum"."content_items" SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','Imagine you are in a store.','content','Today you will practice a full shopping conversation.'),
  jsonb_build_object('type','vocabulary','instructions','Learn these shop phrases.','vocabularyIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='can I help you' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='here you are' AND cefr_level='a1')
  )),
  jsonb_build_object('type','communicative_task','instructions','Role-play a shop conversation with a partner. One person is the customer, one is the shop worker.','prompt','Customer: How much is this bag? Shop worker: It''s ___ dollars. Customer: ___. Shop worker: Here you are!'),
  jsonb_build_object('type','controlled_practice','instructions','Practice everything from this unit in one conversation.','exerciseIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='A shop worker says ''___?'' to offer help.'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='The shop worker gives you your bag and says ''___.'''),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='Put the shop conversation in order.'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='What do you say when you hand something to someone? (2-3 words)')
  )),
  jsonb_build_object('type','wrap_up','summary','You can now complete a full, simple shopping conversation, playing both roles.','targetVocabularyIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='can I help you' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='here you are' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='store' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='price' AND cefr_level='a1')
  ))
))
WHERE id = 'a30f9bc5-126f-4d8d-9a00-fec2ed3b76a0';

-- Unit 4 L1: I Like / I Don't Like
UPDATE "curriculum"."content_items" SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','Think about drinks and food you like and don''t like.','content','Today you will say what you like and don''t like.'),
  jsonb_build_object('type','presentation','explanation','Use ''like'' + noun to say you enjoy something, and ''don''t like'' + noun for the opposite.','examples', jsonb_build_array('I like coffee.','I don''t like tea.','She likes coffee, but she doesn''t like tea.'),'explanationAr','نستخدم like + اسم للتعبير عن الإعجاب، وdon''t like للعكس.'),
  jsonb_build_object('type','vocabulary','instructions','Learn these words.','vocabularyIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='like' AND cefr_level='a1' AND sense_number=2),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='don''t like' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='coffee' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='tea' AND cefr_level='a1')
  )),
  jsonb_build_object('type','controlled_practice','instructions','Choose the correct form.','exerciseIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='I ___ coffee, but I don''t like tea.'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='''I don''t like tea'' means I enjoy tea.'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='She ___ coffee. (has a positive feeling about)'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='Build a sentence saying you like coffee.')
  )),
  jsonb_build_object('type','wrap_up','summary','You can now say what you like and don''t like using simple nouns.','targetVocabularyIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='like' AND cefr_level='a1' AND sense_number=2),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='don''t like' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='coffee' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='tea' AND cefr_level='a1')
  ))
))
WHERE id = 'ccda9d73-340a-46df-a452-f0f52e3535d6';

-- Unit 4 L2: How Often?
UPDATE "curriculum"."content_items" SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','Think about how often you do things.','content','Today you will use always, often, and never.'),
  jsonb_build_object('type','presentation','explanation','Frequency adverbs go before the main verb: always (100%), often, usually, sometimes, never (0%).','examples', jsonb_build_array('I always wake up early.','I often walk to work.','I never eat breakfast at noon.'),'explanationAr','ظروف التكرار تأتي قبل الفعل الرئيسي.'),
  jsonb_build_object('type','vocabulary','instructions','Learn these words.','vocabularyIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='always' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='often' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='never' AND cefr_level='a1')
  )),
  jsonb_build_object('type','controlled_practice','instructions','Choose the correct frequency adverb, then put the words in order.','exerciseIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='I ___ wake up early. (100% of the time)'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='I ___ eat breakfast at noon. (0% of the time)'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='Put the words in order.' AND payload->'items'->0 = '"I"' AND payload->'items'->1 = '"often"' AND payload->'items'->2 = '"walk"'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='''Never'' means 100% of the time.')
  )),
  jsonb_build_object('type','wrap_up','summary','You can now say how often you do things using frequency adverbs.','targetVocabularyIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='always' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='often' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='never' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='usually' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='sometimes' AND cefr_level='a1')
  ))
))
WHERE id = '0c5730f3-7b33-4d78-8714-a3205ed07c4a';

-- Unit 4 L3: My Free Time
UPDATE "curriculum"."content_items" SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','Think about what you do when you are not working.','content','Today you will learn free-time activities.'),
  jsonb_build_object('type','presentation','explanation','Free time is time when you are not working. Hiking, dancing, and watching TV are common free-time activities.','examples', jsonb_build_array('I like hiking on weekends.','She loves dancing.','He likes watching TV at night.'),'explanationAr','وقت الفراغ هو الوقت الذي لا تعمل فيه.'),
  jsonb_build_object('type','vocabulary','instructions','Learn these words.','vocabularyIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='free time' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='hiking' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='dancing' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='watching TV' AND cefr_level='a1')
  )),
  jsonb_build_object('type','controlled_practice','instructions','Match, choose, and answer.','exerciseIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='Match each activity to its meaning.'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='What do you do in your ___ time? (time when you are not working)'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='She loves ___. (moving her body to music)'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='Name one free-time activity from this lesson.')
  )),
  jsonb_build_object('type','wrap_up','summary','You can now talk about your free-time activities.','targetVocabularyIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='free time' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='hiking' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='dancing' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='watching TV' AND cefr_level='a1')
  ))
))
WHERE id = 'a4f804d7-667d-44b4-a137-30d8d9d5d7e0';

-- Unit 4 L4: A1 Review (final consolidation, resampled across all 4 units)
UPDATE "curriculum"."content_items" SET payload = jsonb_set(payload, '{blocks}', jsonb_build_array(
  jsonb_build_object('type','warm_up','prompt','You have finished all of A1! Let''s review everything.','content','This lesson checks what you remember from Units 1-4.'),
  jsonb_build_object('type','speaking_practice','instructions','Practice speaking about yourself.','prompt','Introduce yourself, talk about your week (weekdays and weekends), describe something you want to buy, and say what you like and don''t like.'),
  jsonb_build_object('type','controlled_practice','instructions','Answer questions from all 4 units.','exerciseIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='Complete: ''Nice ___ meet you.'''),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='I ___ wake up at 7 on weekdays. (this happens almost every day)'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='''___ is this bag?'''),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='''Cheap'' means the price is high.'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='I ___ tea, but I like coffee.'),
    (SELECT id::text FROM curriculum.content_items WHERE type='exercise' AND payload->>'prompt'='Put the words in order.' AND payload->'items'->0 = '"I"' AND payload->'items'->1 = '"often"' AND payload->'items'->2 = '"go"')
  )),
  jsonb_build_object('type','wrap_up','summary','You have completed A1! You can introduce yourself, talk about your daily routine, go shopping, and describe your likes, dislikes, and free time in English.','targetVocabularyIds', jsonb_build_array(
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='hello' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='wake up' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='store' AND cefr_level='a1'),
    (SELECT id::text FROM curriculum.vocabulary_entries WHERE headword='always' AND cefr_level='a1')
  ))
))
WHERE id = '2d49679d-6e74-494e-845d-857b90fc2acd';
