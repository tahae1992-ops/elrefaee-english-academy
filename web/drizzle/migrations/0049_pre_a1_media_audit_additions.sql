-- Pre-A1 pedagogical media audit: only 5 items added after auditing
-- all 16 lessons from a zero-literacy learner's perspective. The
-- single most important finding: Lesson 1's phonics presentation block
-- ("B says /b/ like in ball...") had zero audio -- a zero-literacy
-- learner cannot learn a sound from text describing it. Real,
-- individually-verified human phoneme recordings exist on Wikimedia
-- Commons (used across Wikipedia's own IPA/phonetics articles,
-- recorded by contributor Peter Isotalo, explicit "Recorded by ...",
-- GFDL/CC BY-SA 3.0) -- fixed via a small, targeted schema addition
-- (PresentationBlock.exampleAudioIds) rather than forcing this into
-- an unrelated block type.
--
-- Two images added: "pen" (a clean, appropriate literacy-themed photo)
-- and "Egypt" (its flag -- simple, unambiguous, public domain). Every
-- other candidate searched this round (numeral icon sets, family
-- member photos/pictograms, book, bag, key, table, clock face) was
-- rejected: no consistent/appropriately-licensed/conceptually-correct
-- match could be found without resorting to culturally-specific
-- museum photos, mismatched icon styles, or branded product shots --
-- see the session's audit notes for the specific rejected candidates.

WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1)
INSERT INTO "curriculum"."content_items" ("academy_id", "type", "cefr_level", "status", "payload")
SELECT academy.id, 'material'::"shared"."content_type", 'pre_a1'::"shared"."cefr_level", 'published'::"shared"."content_status", v.payload::jsonb
FROM academy, (VALUES
  ('{"mediaType":"audio","title":"phoneme /b/ — voiced bilabial plosive","source":"Wikipedia IPA/phonetics illustration set","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/2/2c/Voiced_bilabial_plosive.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Peter Isotalo, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"phoneme /s/ — voiceless alveolar sibilant","source":"Wikipedia IPA/phonetics illustration set","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/a/ac/Voiceless_alveolar_sibilant.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Peter Isotalo, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"phoneme /m/ — bilabial nasal","source":"Wikipedia IPA/phonetics illustration set","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/a/a9/Bilabial_nasal.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Peter Isotalo, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"image","title":"pen — photo","source":"Wikipedia — Fountain pen article","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/7/7b/Fountain_pen_writing_%28literacy%29.jpg","license":"CC BY-SA 4.0","attribution":"Photo by Petar Milošević, via Wikimedia Commons","verificationStatus":"VERIFIED"}'::jsonb),
  ('{"mediaType":"image","title":"Egypt — flag","source":"Wikimedia Commons","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/f/fe/Flag_of_Egypt.svg","license":"Public domain","attribution":"Via Wikimedia Commons","verificationStatus":"VERIFIED"}'::jsonb)
) AS v(payload);

-- Link pen/Egypt images to their vocabulary entries.
UPDATE "curriculum"."vocabulary_entries" ve
SET image_material_id = ci.id
FROM "curriculum"."content_items" ci
WHERE ve.cefr_level = 'pre_a1'
  AND ci.type = 'material'
  AND ci.cefr_level = 'pre_a1'
  AND ci.payload->>'mediaType' = 'image'
  AND ((ve.headword = 'pen' AND ci.payload->>'title' = 'pen — photo')
    OR (ve.headword = 'Egypt' AND ci.payload->>'title' = 'Egypt — flag'));

-- Attach the three phoneme recordings to Lesson 1's letter-sounds
-- presentation block (examples ["B - ball", "S - sun", "M - mom"] at
-- indexes 0/1/2 respectively).
WITH b AS (SELECT id FROM "curriculum"."content_items" WHERE type='material' AND payload->>'title' = 'phoneme /b/ — voiced bilabial plosive'),
     s AS (SELECT id FROM "curriculum"."content_items" WHERE type='material' AND payload->>'title' = 'phoneme /s/ — voiceless alveolar sibilant'),
     m AS (SELECT id FROM "curriculum"."content_items" WHERE type='material' AND payload->>'title' = 'phoneme /m/ — bilabial nasal'),
     lesson AS (SELECT id, payload FROM "curriculum"."content_items" WHERE type='lesson' AND cefr_level='pre_a1' AND payload->>'title' = 'The Alphabet and Sounds')
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(
  lesson.payload,
  '{blocks,4,exampleAudioIds}',
  jsonb_build_object('0', (SELECT id::text FROM b), '1', (SELECT id::text FROM s), '2', (SELECT id::text FROM m))
)
FROM lesson
WHERE "content_items".id = lesson.id
  AND lesson.payload->'blocks'->4->>'type' = 'presentation'
  AND lesson.payload->'blocks'->4->'examples'->0 = '"B - ball"';
