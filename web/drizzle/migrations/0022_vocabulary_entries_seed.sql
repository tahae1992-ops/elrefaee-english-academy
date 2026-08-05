-- Review Engine seed: authors 27 real `curriculum.vocabulary_entries`
-- rows (type='vocabulary_entry' content_items) for the wrap-up target
-- vocabulary/grammar chunks already embedded as plain strings across
-- the 5 existing lessons, then surgically rewrites each lesson's
-- wrap_up block (always blocks[4]) from `targetVocabulary: string[]`
-- to `targetVocabularyIds: string[]` (references), replacing the old
-- embedded-strings key -- the rest of each lesson payload is untouched.
--
-- Grammar chunks (e.g. "she is", "in the morning") are authored with
-- part_of_speech='phrase' -- see curriculum.ts's header comment for why
-- these reuse vocabulary_entries rather than a separate entity.
--
-- Split into separate statements (insert content_items, insert
-- vocabulary_entries, then one UPDATE per lesson) rather than one WITH
-- chain, matching 0019_exercise_content_seed.sql's established reason:
-- a WITH clause's CTEs don't persist across statement boundaries and
-- Postgres only allows one data-modifying statement per WITH chain.

WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1)
INSERT INTO "curriculum"."content_items" ("academy_id", "type", "cefr_level", "status", "payload")
SELECT academy.id, 'vocabulary_entry'::"shared"."content_type", 'a1'::"shared"."cefr_level", 'published'::"shared"."content_status", jsonb_build_object('title', v.headword)
FROM academy, (VALUES
  ('hello'), ('hi'), ('my name is'), ('nice to meet you'), ('what''s your name'),
  ('I am'), ('she is'), ('they are'), ('live in'), ('from'),
  ('brother'), ('sister'), ('parents'), ('friend'), ('kind'), ('funny'),
  ('wake up'), ('go to work'), ('have breakfast'), ('in the morning'), ('at night'),
  ('like'), ('love'), ('hate'), ('swimming'), ('reading'), ('cooking')
) AS v(headword);

WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1)
INSERT INTO "curriculum"."vocabulary_entries"
  ("content_item_id", "academy_id", "headword", "sense_number", "ipa_transcription", "part_of_speech", "cefr_level", "tier", "collocations", "synonyms", "example_sentences")
SELECT ci.id, academy.id, v.headword, 1, v.ipa, v.part_of_speech, 'a1'::"shared"."cefr_level", 'active',
  v.synonyms::text[], v.collocations::text[], v.example_sentences::jsonb
FROM academy, "curriculum"."content_items" ci
JOIN (VALUES
  ('hello', '/həˈloʊ/', 'interjection', ARRAY[]::text[], ARRAY['hi']::text[], '[{"text":"Hello! Nice to meet you."}]'),
  ('hi', '/haɪ/', 'interjection', ARRAY[]::text[], ARRAY['hello']::text[], '[{"text":"Hi, I''m Ana."}]'),
  ('my name is', '/maɪ ˈneɪm ɪz/', 'phrase', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"My name is Sara."}]'),
  ('nice to meet you', '/naɪs tə mit ju/', 'phrase', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"Nice to meet you too."}]'),
  ('what''s your name', '/wʌts jʊr neɪm/', 'phrase', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"What''s your name? My name is Omar."}]'),
  ('I am', '/aɪ æm/', 'phrase', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"I am from Egypt."}]'),
  ('she is', '/ʃi ɪz/', 'phrase', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"She is a doctor."}]'),
  ('they are', '/ðeɪ ɑr/', 'phrase', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"They are from Morocco."}]'),
  ('live in', '/lɪv ɪn/', 'phrasal verb', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"I live in Cairo."}]'),
  ('from', '/frʌm/', 'preposition', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"I am from Egypt."}]'),
  ('brother', '/ˈbrʌðər/', 'noun', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"This is my brother. His name is Adam."}]'),
  ('sister', '/ˈsɪstər/', 'noun', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"My sister is a teacher."}]'),
  ('parents', '/ˈpɛrənts/', 'noun', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"My parents live in Cairo."}]'),
  ('friend', '/frɛnd/', 'noun', ARRAY[]::text[], ARRAY['buddy','pal']::text[], '[{"text":"He is my friend."}]'),
  ('kind', '/kaɪnd/', 'adjective', ARRAY[]::text[], ARRAY['nice','friendly']::text[], '[{"text":"Our parents are kind."}]'),
  ('funny', '/ˈfʌni/', 'adjective', ARRAY[]::text[], ARRAY['amusing']::text[], '[{"text":"He is my friend. He is very funny."}]'),
  ('wake up', '/weɪk ʌp/', 'phrasal verb', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"I wake up at 7 am."}]'),
  ('go to work', '/goʊ tə wɜrk/', 'phrase', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"She goes to work in the morning."}]'),
  ('have breakfast', '/hæv ˈbrɛkfəst/', 'phrase', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"I have breakfast at 8."}]'),
  ('in the morning', '/ɪn ðə ˈmɔrnɪŋ/', 'phrase', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"She goes to work in the morning."}]'),
  ('at night', '/æt naɪt/', 'phrase', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"I sleep at 11 at night."}]'),
  ('like', '/laɪk/', 'verb', ARRAY[]::text[], ARRAY['enjoy']::text[], '[{"text":"I like reading books."}]'),
  ('love', '/lʌv/', 'verb', ARRAY[]::text[], ARRAY['adore']::text[], '[{"text":"He loves playing football."}]'),
  ('hate', '/heɪt/', 'verb', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"They hate getting up early."}]'),
  ('swimming', '/ˈswɪmɪŋ/', 'noun', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"I like swimming."}]'),
  ('reading', '/ˈridɪŋ/', 'noun', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"I like reading books."}]'),
  ('cooking', '/ˈkʊkɪŋ/', 'noun', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"She loves cooking."}]')
) AS v(headword, ipa, part_of_speech, synonyms, collocations, example_sentences) ON ci.payload->>'title' = v.headword
WHERE ci.type = 'vocabulary_entry';

WITH lesson_1_vocab AS (
  SELECT ve.id, keys.ord
  FROM "curriculum"."vocabulary_entries" ve
  JOIN (VALUES ('hello', 1), ('hi', 2), ('my name is', 3), ('nice to meet you', 4), ('what''s your name', 5)) AS keys(headword, ord)
    ON ve.headword = keys.headword
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload #- '{blocks,4,targetVocabulary}', '{blocks,4,targetVocabularyIds}', (SELECT jsonb_agg(id ORDER BY ord) FROM lesson_1_vocab))
WHERE payload->>'title' = 'Meeting People' AND type = 'lesson';

WITH lesson_2_vocab AS (
  SELECT ve.id, keys.ord
  FROM "curriculum"."vocabulary_entries" ve
  JOIN (VALUES ('I am', 1), ('she is', 2), ('they are', 3), ('live in', 4), ('from', 5)) AS keys(headword, ord)
    ON ve.headword = keys.headword
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload #- '{blocks,4,targetVocabulary}', '{blocks,4,targetVocabularyIds}', (SELECT jsonb_agg(id ORDER BY ord) FROM lesson_2_vocab))
WHERE payload->>'title' = 'Talking About Yourself' AND type = 'lesson';

WITH lesson_3_vocab AS (
  SELECT ve.id, keys.ord
  FROM "curriculum"."vocabulary_entries" ve
  JOIN (VALUES ('brother', 1), ('sister', 2), ('parents', 3), ('friend', 4), ('kind', 5), ('funny', 6)) AS keys(headword, ord)
    ON ve.headword = keys.headword
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload #- '{blocks,4,targetVocabulary}', '{blocks,4,targetVocabularyIds}', (SELECT jsonb_agg(id ORDER BY ord) FROM lesson_3_vocab))
WHERE payload->>'title' = 'Family and Friends' AND type = 'lesson';

WITH lesson_4_vocab AS (
  SELECT ve.id, keys.ord
  FROM "curriculum"."vocabulary_entries" ve
  JOIN (VALUES ('wake up', 1), ('go to work', 2), ('have breakfast', 3), ('in the morning', 4), ('at night', 5)) AS keys(headword, ord)
    ON ve.headword = keys.headword
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload #- '{blocks,4,targetVocabulary}', '{blocks,4,targetVocabularyIds}', (SELECT jsonb_agg(id ORDER BY ord) FROM lesson_4_vocab))
WHERE payload->>'title' = 'My Day' AND type = 'lesson';

WITH lesson_5_vocab AS (
  SELECT ve.id, keys.ord
  FROM "curriculum"."vocabulary_entries" ve
  JOIN (VALUES ('like', 1), ('love', 2), ('hate', 3), ('swimming', 4), ('reading', 5), ('cooking', 6)) AS keys(headword, ord)
    ON ve.headword = keys.headword
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload #- '{blocks,4,targetVocabulary}', '{blocks,4,targetVocabularyIds}', (SELECT jsonb_agg(id ORDER BY ord) FROM lesson_5_vocab))
WHERE payload->>'title' = 'Likes and Dislikes' AND type = 'lesson';
