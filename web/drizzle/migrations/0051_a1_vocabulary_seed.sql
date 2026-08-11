-- A1 curriculum, Phase 1b: vocabulary for the 11 new/backfill lessons.
-- 36 new vocabulary_entries rows. Collision-checked against every
-- existing pre_a1/a1 headword (2026-08-11 ground-truth query) -- zero
-- collisions except "like", which deliberately reuses the existing a1
-- headword at sense_number=2: Daily Routines' "like" (sense 1) already
-- covers like/love/hate + gerund ("I like reading"); this lesson
-- teaches the distinct like/don't like + noun pattern ("I like
-- coffee"), the same spiral-recurrence-at-a-new-grammar-point pattern
-- already established for hello/hi/brother/sister/from in the Pre-A1
-- media-audit migration (0049 predecessor decisions).
--
-- Every entry carries arabic_translation (kept per the Arabic-density
-- policy: translation of new words stays, everything else leans more
-- English than Pre-A1).

WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1)
INSERT INTO "curriculum"."content_items" ("academy_id", "type", "cefr_level", "status", "payload")
SELECT academy.id, 'vocabulary_entry'::"shared"."content_type", 'a1'::"shared"."cefr_level", 'published'::"shared"."content_status", jsonb_build_object('title', v.headword)
FROM academy, (VALUES
  ('let me introduce'), ('everyone'),
  ('weekday'), ('weekend'), ('usually'), ('sometimes'),
  ('in the evening'), ('at noon'), ('then'),
  ('store'), ('buy'), ('sell'), ('customer'),
  ('how much'), ('price'), ('expensive'), ('cheap'), ('twenty'), ('hundred'),
  ('big'), ('small'), ('old'), ('new'),
  ('can I help you'), ('here you are'),
  ('like'), ('don''t like'), ('coffee'), ('tea'),
  ('always'), ('often'), ('never'),
  ('free time'), ('hiking'), ('dancing'), ('watching TV')
) AS v(headword);

WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
ranked AS (
  -- The `ve.id IS NULL` filter excludes content_items that already
  -- have a vocabulary_entries row -- necessary because 'like' has a
  -- pre-existing sense_number=1 content_item at a1 level (Daily
  -- Routines), and content_items.id is a random UUID, so ORDER BY id
  -- alone can't reliably distinguish "the row just inserted above"
  -- from "the pre-existing row" the way insertion order would.
  SELECT ci.id, ci.payload->>'title' AS headword,
    row_number() OVER (PARTITION BY ci.payload->>'title' ORDER BY ci.id) AS rn
  FROM "curriculum"."content_items" ci
  LEFT JOIN "curriculum"."vocabulary_entries" ve ON ve.content_item_id = ci.id
  WHERE ci.type = 'vocabulary_entry' AND ci.cefr_level = 'a1' AND ve.id IS NULL
    AND ci.payload->>'title' IN (
      'let me introduce','everyone','weekday','weekend','usually','sometimes',
      'in the evening','at noon','then','store','buy','sell','customer',
      'how much','price','expensive','cheap','twenty','hundred',
      'big','small','old','new','can I help you','here you are',
      'like','don''t like','coffee','tea','always','often','never',
      'free time','hiking','dancing','watching TV'
    )
)
INSERT INTO "curriculum"."vocabulary_entries"
  ("content_item_id", "academy_id", "headword", "sense_number", "ipa_transcription", "part_of_speech", "cefr_level", "tier", "collocations", "synonyms", "example_sentences", "arabic_translation")
SELECT ranked.id, academy.id, v.headword, v.sense_number, v.ipa, v.part_of_speech, 'a1'::"shared"."cefr_level", 'active',
  ARRAY[]::text[], v.synonyms::text[], v.example_sentences::jsonb, v.arabic
FROM academy, ranked
JOIN (VALUES
  ('let me introduce', 1, '/lɛt mi ˌɪntrəˈdus/', 'phrase', ARRAY[]::text[], '[{"text":"Let me introduce my brother, Adam."}]', 'دعني أقدم'),
  ('everyone', 1, '/ˈɛvriˌwʌn/', 'pronoun', ARRAY[]::text[], '[{"text":"Hello, everyone! My name is Sara."}]', 'الجميع'),
  ('weekday', 1, '/ˈwikˌdeɪ/', 'noun', ARRAY[]::text[], '[{"text":"I go to work on weekdays."}]', 'يوم عمل (من السبت إلى الأربعاء)'),
  ('weekend', 1, '/ˈwikˌɛnd/', 'noun', ARRAY[]::text[], '[{"text":"I relax on the weekend."}]', 'عطلة نهاية الأسبوع'),
  ('usually', 1, '/ˈjuʒuəli/', 'adverb', ARRAY['often']::text[], '[{"text":"I usually wake up at 7."}]', 'عادة'),
  ('sometimes', 1, '/ˈsʌmˌtaɪmz/', 'adverb', ARRAY[]::text[], '[{"text":"Sometimes I cook dinner."}]', 'أحيانًا'),
  ('in the evening', 1, '/ɪn ðə ˈivnɪŋ/', 'phrase', ARRAY[]::text[], '[{"text":"I have dinner in the evening."}]', 'في المساء'),
  ('at noon', 1, '/æt nun/', 'phrase', ARRAY[]::text[], '[{"text":"I have lunch at noon."}]', 'عند الظهر'),
  ('then', 1, '/ðɛn/', 'adverb', ARRAY[]::text[], '[{"text":"I wake up, then I have breakfast."}]', 'بعد ذلك'),
  ('store', 1, '/stɔr/', 'noun', ARRAY['shop']::text[], '[{"text":"I go to the store on Saturdays."}]', 'متجر'),
  ('buy', 1, '/baɪ/', 'verb', ARRAY[]::text[], '[{"text":"I buy bread every day."}]', 'يشتري'),
  ('sell', 1, '/sɛl/', 'verb', ARRAY[]::text[], '[{"text":"They sell fruit at the store."}]', 'يبيع'),
  ('customer', 1, '/ˈkʌstəmər/', 'noun', ARRAY[]::text[], '[{"text":"The customer is happy."}]', 'زبون'),
  ('how much', 1, '/haʊ mʌtʃ/', 'phrase', ARRAY[]::text[], '[{"text":"How much is this shirt?"}]', 'بكم؟'),
  ('price', 1, '/praɪs/', 'noun', ARRAY[]::text[], '[{"text":"The price is ten dollars."}]', 'سعر'),
  ('expensive', 1, '/ɪkˈspɛnsɪv/', 'adjective', ARRAY[]::text[], '[{"text":"This phone is expensive."}]', 'غالي'),
  ('cheap', 1, '/tʃip/', 'adjective', ARRAY[]::text[], '[{"text":"This pen is cheap."}]', 'رخيص'),
  ('twenty', 1, '/ˈtwɛnti/', 'number', ARRAY[]::text[], '[{"text":"It''s twenty dollars."}]', 'عشرون'),
  ('hundred', 1, '/ˈhʌndrəd/', 'number', ARRAY[]::text[], '[{"text":"It''s one hundred dollars."}]', 'مئة'),
  ('big', 1, '/bɪg/', 'adjective', ARRAY['large']::text[], '[{"text":"This bag is big."}]', 'كبير'),
  ('small', 1, '/smɔl/', 'adjective', ARRAY[]::text[], '[{"text":"That bag is small."}]', 'صغير'),
  ('old', 1, '/oʊld/', 'adjective', ARRAY[]::text[], '[{"text":"My phone is old."}]', 'قديم'),
  ('new', 1, '/nu/', 'adjective', ARRAY[]::text[], '[{"text":"I want a new phone."}]', 'جديد'),
  ('can I help you', 1, '/kæn aɪ hɛlp ju/', 'phrase', ARRAY[]::text[], '[{"text":"Can I help you? Yes, please."}]', 'هل يمكنني مساعدتك؟'),
  ('here you are', 1, '/hɪr ju ɑr/', 'phrase', ARRAY[]::text[], '[{"text":"Here you are. That''s ten dollars."}]', 'تفضل'),
  ('like', 2, '/laɪk/', 'verb', ARRAY[]::text[], '[{"text":"I like coffee."}]', 'يحب'),
  ('don''t like', 1, '/doʊnt laɪk/', 'phrase', ARRAY[]::text[], '[{"text":"I don''t like tea."}]', 'لا يحب'),
  ('coffee', 1, '/ˈkɔfi/', 'noun', ARRAY[]::text[], '[{"text":"I like coffee in the morning."}]', 'قهوة'),
  ('tea', 1, '/ti/', 'noun', ARRAY[]::text[], '[{"text":"She likes tea."}]', 'شاي'),
  ('always', 1, '/ˈɔlweɪz/', 'adverb', ARRAY[]::text[], '[{"text":"I always wake up early."}]', 'دائمًا'),
  ('often', 1, '/ˈɔfən/', 'adverb', ARRAY[]::text[], '[{"text":"I often walk to work."}]', 'غالبًا'),
  ('never', 1, '/ˈnɛvər/', 'adverb', ARRAY[]::text[], '[{"text":"I never eat breakfast at noon."}]', 'أبدًا'),
  ('free time', 1, '/fri taɪm/', 'noun', ARRAY[]::text[], '[{"text":"What do you do in your free time?"}]', 'وقت الفراغ'),
  ('hiking', 1, '/ˈhaɪkɪŋ/', 'noun', ARRAY[]::text[], '[{"text":"I like hiking on weekends."}]', 'المشي لمسافات طويلة'),
  ('dancing', 1, '/ˈdænsɪŋ/', 'noun', ARRAY[]::text[], '[{"text":"She loves dancing."}]', 'الرقص'),
  ('watching TV', 1, '/ˈwɑtʃɪŋ ˌtiˈvi/', 'noun', ARRAY[]::text[], '[{"text":"He likes watching TV at night."}]', 'مشاهدة التلفاز')
) AS v(headword, sense_number, ipa, part_of_speech, synonyms, example_sentences, arabic) ON ranked.headword = v.headword AND ranked.rn = 1;
