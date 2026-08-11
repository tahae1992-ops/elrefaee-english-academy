-- A1 curriculum, Phase 3: media for the 36 new vocabulary entries.
--
-- Policy difference from Pre-A1: A1 learners have already completed
-- Pre-A1 (alphabet, phonics, basic reading) and are no longer
-- zero-literacy, so audio/image coverage does not need to be
-- exhaustive per word the way Pre-A1's did -- media is added only
-- where it materially improves learning, per the user's explicit
-- "don't add media merely to increase count" instruction.
--
-- Audio: individually verified via the Wikimedia Commons API against
-- Wiktionary's "En-us-word.ogg" human-pronunciation project (same
-- source used for Pre-A1, contributors Dvortygirl / TheDaveRoss, CC
-- BY-SA 3.0, explicit "recorded by" attribution on every file). Every
-- URL below was read directly from the API's imageinfo.url field, not
-- guessed -- Commons hash-prefix paths are effectively random and an
-- earlier draft of this migration that assumed a pattern was wrong
-- and was corrected before being applied.
--
-- Checked all 36 new headwords; 23 single-word headwords have a real
-- recording and are included below. NOT found (real search performed,
-- not fabricated): "customer", "cheap", "hiking" (no en-us recording
-- exists for these on Commons). NOT attempted: the 13 multi-word
-- phrase headwords (e.g. "how much", "can I help you", "free time")
-- -- Wiktionary's pronunciation project only records single words, so
-- no matching file could exist; inventing one would violate the
-- never-fabricate-a-source rule.
--
-- Images: only 3 added, for the most concrete, unambiguous nouns
-- (coffee, tea, store) where a real photo adds genuine value. Skipped
-- deliberately: comparative adjectives (big/small/old/new -- better
-- illustrated by the lesson's own paired examples than a static
-- photo), abstract time/frequency words (weekday/weekend/always/
-- often/never/usually/sometimes/then/at noon/in the evening --
-- a photo can't depict these), functional phrases (how much/can I
-- help you/here you are/let me introduce -- phrases, not depictable
-- nouns), and activities without a strong non-generic candidate
-- (hiking/dancing/watching TV -- free time).

WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1)
INSERT INTO "curriculum"."content_items" ("academy_id", "type", "cefr_level", "status", "payload")
SELECT academy.id, 'material'::"shared"."content_type", 'a1'::"shared"."cefr_level", 'published'::"shared"."content_status", v.payload::jsonb
FROM academy, (VALUES
  ('{"mediaType":"audio","title":"everyone — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/1/15/En-us-everyone.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"weekday — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/d/d3/En-us-weekday.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"weekend — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/1/16/En-us-weekend.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"usually — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/9/92/En-us-usually.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"sometimes — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/c/c0/En-us-sometimes.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"then — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/a/a5/En-us-then.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"store — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/8/8c/En-us-store.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"buy — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/c/cf/En-us-buy.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"sell — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/c/c4/En-us-sell.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"price — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/0/04/En-us-price.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"expensive — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/c/ce/En-us-expensive.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"twenty — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/c/c9/En-us-twenty.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"hundred — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/c/c6/En-us-hundred.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by TheDaveRoss, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"big — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/9/96/En-us-big.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"small — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/b/b5/En-us-small.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"old — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/b/be/En-us-old.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"new — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/3/34/En-us-new.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"coffee — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/e/e3/En-us-coffee.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"tea — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/1/12/En-us-tea.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"always — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/7/73/En-us-always.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"often — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/e/e6/En-us-often.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"never — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/6/6e/En-us-never.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"dancing — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/1/14/En-us-dancing.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"image","title":"coffee — photo","source":"Wikipedia featured picture (cup of coffee)","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/4/45/A_small_cup_of_coffee.JPG","license":"CC BY-SA 2.0","attribution":"Photo by Julius Schorzman, via Wikimedia Commons","verificationStatus":"VERIFIED"}'::jsonb),
  ('{"mediaType":"image","title":"tea — photo","source":"Wikimedia Commons","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/d/df/Tea_time.jpg","license":"CC0","attribution":"Photo by Rajalakshmi duraikathiresan, via Wikimedia Commons","verificationStatus":"VERIFIED"}'::jsonb),
  ('{"mediaType":"image","title":"store — photo","source":"Wikipedia — Grocery store article (lead image)","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/7/70/Westside_Market_in_Manhattan%2C_NYC_IMG_5615.JPG","license":"CC BY-SA 3.0","attribution":"Photo by Billy Hathorn, via Wikimedia Commons","verificationStatus":"VERIFIED"}'::jsonb)
) AS v(payload);

-- Link every verified audio material to its vocabulary entry (a1
-- new-headword rows only, exact title match, so this can never touch
-- Pre-A1's identically-named audio rows).
UPDATE "curriculum"."vocabulary_entries" ve
SET audio_material_id = ci.id
FROM "curriculum"."content_items" ci
WHERE ve.cefr_level = 'a1'
  AND ci.type = 'material' AND ci.cefr_level = 'a1' AND ci.payload->>'mediaType' = 'audio'
  AND ci.payload->>'title' = ve.headword || ' — pronunciation (US English)';

-- Link the 3 images.
UPDATE "curriculum"."vocabulary_entries" ve
SET image_material_id = ci.id
FROM "curriculum"."content_items" ci
WHERE ve.cefr_level = 'a1'
  AND ci.type = 'material' AND ci.cefr_level = 'a1' AND ci.payload->>'mediaType' = 'image'
  AND ci.payload->>'title' = ve.headword || ' — photo';
