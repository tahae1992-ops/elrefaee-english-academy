-- Course Catalog seed (authored per the project's established "Claude
-- generates content, user reviews/approves" workflow) — one published
-- content_item + one course per CEFR level (Pre-A1 through C1), giving
-- the Course Catalog real curriculum data instead of a fake/hardcoded
-- list. Titles/descriptions are original copy in EREA's voice, not
-- reproduced from any external CEFR framework text.

WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1),
inserted_content_items AS (
  INSERT INTO "curriculum"."content_items" ("academy_id", "type", "cefr_level", "status", "payload")
  SELECT academy.id, 'lesson'::"shared"."content_type", v.cefr_level::"shared"."cefr_level", 'published'::"shared"."content_status", v.payload::jsonb
  FROM academy, (VALUES
    ('pre_a1', '{"title":"Foundations","description":"Start from zero: everyday words, greetings, and the building blocks of spoken English. Perfect if this is your first step into the language."}'),
    ('a1', '{"title":"Starter","description":"Build your first real conversations -- introduce yourself, talk about your day, and handle simple everyday situations with confidence."}'),
    ('a2', '{"title":"Elementary","description":"Talk about routines, plans, and past experiences using clear, familiar language, and start following everyday conversations more easily."}'),
    ('b1', '{"title":"Intermediate","description":"Handle most situations while traveling or working, describe experiences, and explain the reasons behind your opinions and plans."}'),
    ('b2', '{"title":"Upper Intermediate","description":"Communicate fluently and spontaneously on a wide range of topics -- work, current events, and more abstract ideas -- with fewer pauses to search for words."}'),
    ('c1', '{"title":"Advanced","description":"Express yourself precisely and fluently in academic, professional, and social settings, picking up on nuance and implicit meaning."}')
  ) AS v(cefr_level, payload)
  RETURNING id, cefr_level
)
INSERT INTO "curriculum"."courses" ("academy_id", "cefr_level", "content_item_id")
SELECT academy.id, inserted_content_items.cefr_level, inserted_content_items.id
FROM academy, inserted_content_items;
