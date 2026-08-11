-- A1 pedagogical/media audit, Part 2: media additions found genuinely
-- missing during the lesson-by-lesson audit -- not exhaustive
-- coverage, only real gaps.
--
-- Audio: 14 of the 5 pre-existing lessons' 27 vocabulary words had a
-- real Wiktionary human-pronunciation recording available and didn't
-- have one (hello, hi, brother, sister, friend, kind, funny, love,
-- hate, swimming, reading, parents, from, like). "cooking" was
-- searched and genuinely has no en-us recording on Commons -- disclosed,
-- not fabricated. Every URL below was read from the API's imageinfo.url
-- field directly (the earlier session's mistake of guessing hash
-- prefixes is not repeated).
--
-- Images: 4 added for concrete activity nouns that were audited and
-- found to genuinely need one (cooking, reading, swimming's lesson-mate
-- hiking, dancing). "swimming" itself, "brother", "sister", "parents",
-- "friend" were searched and rejected -- family-relationship and
-- swimming-specific searches returned only historical paintings,
-- unrelated archive photos, or no results; same "no acceptable
-- candidate" discipline as the original Pre-A1 media audit.
--
-- Video: 2 added, both individually verified via YouTube's oEmbed
-- endpoint (confirms existence, embeddability, real title/channel)
-- and both from established ESL education channels (EnglishClass101,
-- Ellii/ESL Library) -- not generic or kids' content, matching this
-- academy's adults-first positioning. Sourced for the two lessons
-- that most directly need a real spoken-language model: numbers
-- pronunciation (How Much Is It?) and a full shop conversation (Can I
-- Help You?). No other A1 lesson was found to have a genuine video
-- gap on this pass.

WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1)
INSERT INTO "curriculum"."content_items" ("academy_id", "type", "cefr_level", "status", "payload")
SELECT academy.id, 'material'::"shared"."content_type", 'a1'::"shared"."cefr_level", 'published'::"shared"."content_status", v.payload::jsonb
FROM academy, (VALUES
  ('{"mediaType":"audio","title":"hello — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/5/52/En-us-hello.ogg","license":"Public domain","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"hi — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/f/f4/En-us-hi.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"brother — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/b/b6/En-us-brother.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"sister — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/4/47/En-us-sister.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"friend — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/8/89/En-us-friend.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"kind — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/6/66/En-us-kind.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"funny — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/d/d2/En-us-funny.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"love — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/1/13/En-us-love.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"hate — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/a/aa/En-us-hate.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"swimming — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/3/30/En-us-swimming.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Neskaya, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"reading — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/4/47/En-us-reading.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"parents — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/c/c3/En-us-parents.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"from — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/7/70/En-us-from.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"audio","title":"like — pronunciation (US English)","source":"Wiktionary pronunciation project","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/e/e5/En-us-like.ogg","license":"CC BY-SA 3.0","attribution":"Recorded by Dvortygirl, via Wikimedia Commons","verificationStatus":"VERIFIED","isHumanVoice":true}'::jsonb),
  ('{"mediaType":"image","title":"cooking — photo","source":"U.S. National Archives (Extension and Home Demonstration Activities)","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/8/8c/Woman_Cooking_in_a_Kitchen._%283904009814%29.jpg","license":"Public domain","attribution":"U.S. National Archives, via Wikimedia Commons","verificationStatus":"VERIFIED"}'::jsonb),
  ('{"mediaType":"image","title":"reading — photo","source":"Wikimedia Commons","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/f/f4/Person_reading_a_book.jpg","license":"CC BY 2.0","attribution":"Photo by Christopher Michel, via Wikimedia Commons","verificationStatus":"VERIFIED"}'::jsonb),
  ('{"mediaType":"image","title":"hiking — photo","source":"Wikipedia — Hiking article (lead image)","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/a/a9/Hiking_to_the_Ice_Lakes._San_Juan_National_Forest%2C_Colorado.jpg","license":"CC BY-SA 4.0","attribution":"Photo by Paxson Woelber, via Wikimedia Commons","verificationStatus":"VERIFIED"}'::jsonb),
  ('{"mediaType":"image","title":"dancing — photo","source":"Wikimedia Commons","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/3/38/Two_dancers.jpg","license":"CC BY 2.0","attribution":"Photo by Barry Goyette, via Wikimedia Commons","verificationStatus":"VERIFIED"}'::jsonb),
  ('{"mediaType":"video","title":"1 to 100 | English Numbers | English Practice | Made by EnglishClass101.com","source":"Learn English with EnglishClass101.com (YouTube channel)","provider":"YouTube","sourceUrl":"https://www.youtube.com/watch?v=jxOIOfOoqFk","embedUrl":"https://www.youtube.com/embed/jxOIOfOoqFk","thumbnailUrl":"https://i.ytimg.com/vi/jxOIOfOoqFk/hqdefault.jpg","license":"YouTube Standard License","attribution":"Learn English with EnglishClass101.com, via YouTube","verificationStatus":"VERIFIED","embedAllowed":true}'::jsonb),
  ('{"mediaType":"video","title":"Going Shopping — Everyday English Dialogues","source":"Ellii (formerly ESL Library) (YouTube channel)","provider":"YouTube","sourceUrl":"https://www.youtube.com/watch?v=xEtBnHqbGU4","embedUrl":"https://www.youtube.com/embed/xEtBnHqbGU4","thumbnailUrl":"https://i.ytimg.com/vi/xEtBnHqbGU4/hqdefault.jpg","license":"YouTube Standard License","attribution":"Ellii (formerly ESL Library), via YouTube","verificationStatus":"VERIFIED","embedAllowed":true}'::jsonb)
) AS v(payload);

-- Link the 14 new audio materials to their vocabulary entries. 'like'
-- collides with sense_number=2's phrase-level 'like' (already has its
-- own arabic-only entry) -- target sense_number=1 explicitly, the only
-- one this audit found missing audio.
UPDATE curriculum.vocabulary_entries ve
SET audio_material_id = ci.id
FROM curriculum.content_items ci
WHERE ve.cefr_level = 'a1' AND ci.type = 'material' AND ci.cefr_level = 'a1' AND ci.payload->>'mediaType' = 'audio'
  AND ci.payload->>'title' = ve.headword || ' — pronunciation (US English)'
  AND (ve.headword <> 'like' OR ve.sense_number = 1);

-- Link the 4 new images.
UPDATE curriculum.vocabulary_entries ve
SET image_material_id = ci.id
FROM curriculum.content_items ci
WHERE ve.cefr_level = 'a1' AND ci.type = 'material' AND ci.cefr_level = 'a1' AND ci.payload->>'mediaType' = 'image'
  AND ci.payload->>'title' = ve.headword || ' — photo';

-- Insert the numbers video into "How Much Is It?" right after warm_up
-- (index 1), matching Pre-A1's established insertion pattern.
WITH vid AS (SELECT id FROM curriculum.content_items WHERE type='material' AND payload->>'title' = '1 to 100 | English Numbers | English Practice | Made by EnglishClass101.com')
UPDATE curriculum.content_items
SET payload = jsonb_insert(payload, '{blocks,1}', jsonb_build_object(
  'type','video','title','Numbers 1 to 100',
  'instructions','Watch and listen to the numbers. Practice saying them along with the video.',
  'materialId', (SELECT id::text FROM vid)
), false)
WHERE id = 'ee0f0e10-a1d2-45df-886a-2a2c9e4fa93c' AND payload->>'title' = 'How Much Is It?';

-- Insert the shopping-dialogue video into "Can I Help You?" right
-- after warm_up (index 1).
WITH vid AS (SELECT id FROM curriculum.content_items WHERE type='material' AND payload->>'title' = 'Going Shopping — Everyday English Dialogues')
UPDATE curriculum.content_items
SET payload = jsonb_insert(payload, '{blocks,1}', jsonb_build_object(
  'type','video','title','A Real Shop Conversation',
  'instructions','Watch and listen to a real shopping conversation before you practice your own.',
  'materialId', (SELECT id::text FROM vid)
), false)
WHERE id = 'a30f9bc5-126f-4d8d-9a00-fec2ed3b76a0' AND payload->>'title' = 'Can I Help You?';
