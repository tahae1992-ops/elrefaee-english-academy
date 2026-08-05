UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload #- '{blocks,4,targetVocabularyIds}', '{blocks,4,targetVocabulary}', '["hello","hi","my name is","nice to meet you","what''s your name"]'::jsonb)
WHERE payload->>'title' = 'Meeting People' AND type = 'lesson';

UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload #- '{blocks,4,targetVocabularyIds}', '{blocks,4,targetVocabulary}', '["I am","she is","they are","live in","from"]'::jsonb)
WHERE payload->>'title' = 'Talking About Yourself' AND type = 'lesson';

UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload #- '{blocks,4,targetVocabularyIds}', '{blocks,4,targetVocabulary}', '["brother","sister","parents","friend","kind","funny"]'::jsonb)
WHERE payload->>'title' = 'Family and Friends' AND type = 'lesson';

UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload #- '{blocks,4,targetVocabularyIds}', '{blocks,4,targetVocabulary}', '["wake up","go to work","have breakfast","in the morning","at night"]'::jsonb)
WHERE payload->>'title' = 'My Day' AND type = 'lesson';

UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload #- '{blocks,4,targetVocabularyIds}', '{blocks,4,targetVocabulary}', '["like","love","hate","swimming","reading","cooking"]'::jsonb)
WHERE payload->>'title' = 'Likes and Dislikes' AND type = 'lesson';

DELETE FROM "curriculum"."vocabulary_entries";
DELETE FROM "curriculum"."content_items" WHERE type = 'vocabulary_entry';
