-- Pre-A1 Media Phase, Part 3: videos, then wiring every media row into
-- the curriculum (vocabulary_entries.audio_material_id/image_material_id,
-- and two new `video` blocks). Both videos verified via YouTube's
-- oEmbed endpoint before being written (confirms the video exists,
-- reads its real title/channel, and proves it is not embed-disabled --
-- oEmbed refuses videos with embedding turned off).

-- 1. Video materials
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1)
INSERT INTO "curriculum"."content_items" ("academy_id", "type", "cefr_level", "status", "payload")
SELECT academy.id, 'material'::"shared"."content_type", 'pre_a1'::"shared"."cefr_level", 'published'::"shared"."content_status", v.payload::jsonb
FROM academy, (VALUES
  ('{"mediaType":"video","title":"The Alphabet Song | Kids Songs | Super Simple Songs","source":"Super Simple Songs - Kids Songs (YouTube channel)","provider":"YouTube","sourceUrl":"https://www.youtube.com/watch?v=vD98OvvDNEs","embedUrl":"https://www.youtube.com/embed/vD98OvvDNEs","thumbnailUrl":"https://i.ytimg.com/vi/vD98OvvDNEs/hqdefault.jpg","license":"YouTube Standard License","attribution":"Super Simple Songs - Kids Songs, via YouTube","verificationStatus":"VERIFIED","embedAllowed":true}'::jsonb),
  ('{"mediaType":"video","title":"Hello! | Kids Greeting Song and Feelings Song | Super Simple Songs","source":"Super Simple Songs - Kids Songs (YouTube channel)","provider":"YouTube","sourceUrl":"https://www.youtube.com/watch?v=tVlcKp3bWH8","embedUrl":"https://www.youtube.com/embed/tVlcKp3bWH8","thumbnailUrl":"https://i.ytimg.com/vi/tVlcKp3bWH8/hqdefault.jpg","license":"YouTube Standard License","attribution":"Super Simple Songs - Kids Songs, via YouTube","verificationStatus":"VERIFIED","embedAllowed":true}'::jsonb)
) AS v(payload);

-- 2. Link every verified audio material to its vocabulary entry (Pre-A1
-- rows only -- never touches the A1 rows sharing the same headword text).
UPDATE "curriculum"."vocabulary_entries" ve
SET audio_material_id = ci.id
FROM "curriculum"."content_items" ci
WHERE ve.cefr_level = 'pre_a1'
  AND ci.type = 'material'
  AND ci.cefr_level = 'pre_a1'
  AND ci.payload->>'mediaType' = 'audio'
  AND ci.payload->>'title' = ve.headword || ' — pronunciation (US English)';

-- 3. Link every verified image material to its vocabulary entry.
UPDATE "curriculum"."vocabulary_entries" ve
SET image_material_id = ci.id
FROM "curriculum"."content_items" ci
WHERE ve.cefr_level = 'pre_a1'
  AND ci.type = 'material'
  AND ci.cefr_level = 'pre_a1'
  AND ci.payload->>'mediaType' = 'image'
  AND (ci.payload->>'title' = ve.headword || ' — photo' OR ci.payload->>'title' = ve.headword || ' — color swatch');

-- 4. Insert a `video` block into Lesson 1 (The Alphabet and Sounds),
-- right after the warm_up block (new index 1), shifting the rest down.
WITH vid AS (
  SELECT id FROM "curriculum"."content_items"
  WHERE type = 'material' AND payload->>'title' = 'The Alphabet Song | Kids Songs | Super Simple Songs'
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_insert(payload, '{blocks,1}', jsonb_build_object(
  'type', 'video',
  'title', 'The Alphabet Song',
  'instructions', 'Watch and listen. Try to say the letters along with the song.',
  'instructionsAr', 'شاهد واستمع. حاول أن تقول الحروف مع الأغنية.',
  'materialId', (SELECT id::text FROM vid)
), false)
WHERE type = 'lesson' AND cefr_level = 'pre_a1' AND payload->>'title' = 'The Alphabet and Sounds';

-- 5. Insert a `video` block into Lesson 2 (Hello and Goodbye), right
-- after the warm_up block.
WITH vid AS (
  SELECT id FROM "curriculum"."content_items"
  WHERE type = 'material' AND payload->>'title' = 'Hello! | Kids Greeting Song and Feelings Song | Super Simple Songs'
)
UPDATE "curriculum"."content_items"
SET payload = jsonb_insert(payload, '{blocks,1}', jsonb_build_object(
  'type', 'video',
  'title', 'Hello! (Greeting Song)',
  'instructions', 'Watch and listen. Practice saying hello along with the song.',
  'instructionsAr', 'شاهد واستمع. تدرب على قول hello مع الأغنية.',
  'materialId', (SELECT id::text FROM vid)
), false)
WHERE type = 'lesson' AND cefr_level = 'pre_a1' AND payload->>'title' = 'Hello and Goodbye';
