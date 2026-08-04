-- Rollback for 0016_lesson_content_seed.sql.
DELETE FROM "curriculum"."lessons" WHERE content_item_id IN (
  SELECT id FROM "curriculum"."content_items"
  WHERE payload->>'title' IN ('Meeting People', 'Talking About Yourself', 'Family and Friends', 'My Day', 'Likes and Dislikes')
);
DELETE FROM "curriculum"."content_items"
  WHERE payload->>'title' IN ('Meeting People', 'Talking About Yourself', 'Family and Friends', 'My Day', 'Likes and Dislikes');
DELETE FROM "curriculum"."units" WHERE content_item_id IN (
  SELECT id FROM "curriculum"."content_items"
  WHERE payload->>'title' IN ('Everyday Introductions', 'Daily Routines')
);
DELETE FROM "curriculum"."content_items"
  WHERE payload->>'title' IN ('Everyday Introductions', 'Daily Routines');
