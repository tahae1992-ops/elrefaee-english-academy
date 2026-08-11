-- Pre-A1 Media Phase, Part 2: images. Each row individually verified
-- via the Wikimedia Commons/Wikipedia API before being written (real
-- file, real license, real photographer/illustrator credited on the
-- file's own description page). Selected for genuine visual clarity
-- for a zero-literacy learner, not filename convenience -- several
-- initial Wikipedia-lead-image candidates (a 1899 ethnographic photo
-- for "family", a historical portrait for "mother", a Gutenberg Bible
-- for "book") were rejected during sourcing as poor conceptual matches
-- and are intentionally left without an image rather than used.

WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1)
INSERT INTO "curriculum"."content_items" ("academy_id", "type", "cefr_level", "status", "payload")
SELECT academy.id, 'material'::"shared"."content_type", 'pre_a1'::"shared"."cefr_level", 'published'::"shared"."content_status", v.payload::jsonb
FROM academy, (VALUES
  ('{"mediaType":"image","title":"cat — photo","source":"Wikipedia — Cat article","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg","thumbnailUrl":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Cat_August_2010-4.jpg/330px-Cat_August_2010-4.jpg","license":"CC BY-SA 3.0","attribution":"Photo by Alvesgaspar, via Wikimedia Commons","verificationStatus":"VERIFIED"}'::jsonb),
  ('{"mediaType":"image","title":"dog — photo","source":"Wikipedia — Dog article","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/7/7a/Huskiesatrest.jpg","license":"CC BY 2.0","attribution":"Photo by M. Rehemtulla, via Wikimedia Commons","verificationStatus":"VERIFIED"}'::jsonb),
  ('{"mediaType":"image","title":"sun — photo","source":"Wikipedia — Sun article","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/8/83/The_Sun_in_white_light.jpg","license":"CC BY-SA 4.0","attribution":"Photo by Matúš Motlo, via Wikimedia Commons","verificationStatus":"VERIFIED"}'::jsonb),
  ('{"mediaType":"image","title":"red — color swatch","source":"Wikimedia Commons","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/6/62/Solid_red.svg","license":"Public domain","attribution":"By Drini, via Wikimedia Commons","verificationStatus":"VERIFIED"}'::jsonb),
  ('{"mediaType":"image","title":"blue — color swatch","source":"Wikimedia Commons","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/5/57/Blue.svg","license":"Public domain","attribution":"By AlAboud83, via Wikimedia Commons","verificationStatus":"VERIFIED"}'::jsonb),
  ('{"mediaType":"image","title":"green — color swatch","source":"Wikimedia Commons","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/3/3e/Color_green.svg","license":"CC0","attribution":"By Phlsph7, via Wikimedia Commons","verificationStatus":"VERIFIED"}'::jsonb),
  ('{"mediaType":"image","title":"yellow — color swatch","source":"Wikimedia Commons","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/9/9e/Color_icon_yellow.svg","license":"Public domain","attribution":"By Badseed, via Wikimedia Commons","verificationStatus":"VERIFIED"}'::jsonb),
  ('{"mediaType":"image","title":"phone — photo","source":"Wikipedia — Telephone article","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/a/a6/Telefon_BW_2012-02-18_13-44-32.JPG","license":"CC BY-SA 3.0","attribution":"Photo by Berthold Werner, via Wikimedia Commons","verificationStatus":"VERIFIED"}'::jsonb),
  ('{"mediaType":"image","title":"chair — photo","source":"Metropolitan Museum of Art collection, via Wikimedia Commons","provider":"Wikimedia Commons","sourceUrl":"https://upload.wikimedia.org/wikipedia/commons/c/c6/Set_of_fourteen_side_chairs_MET_DP110780.jpg","license":"CC0","attribution":"The Metropolitan Museum of Art, via Wikimedia Commons","verificationStatus":"VERIFIED"}'::jsonb)
) AS v(payload);
