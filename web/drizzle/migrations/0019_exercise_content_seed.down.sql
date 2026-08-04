-- Rollback for 0019_exercise_content_seed.sql.
-- Note: this restores the lessons' controlled_practice blocks to
-- reference no exercises (empty array) rather than reconstructing the
-- pre-migration embedded JSON, since that embedded shape was already
-- superseded application-side (lesson-blocks.ts's ControlledPracticeBlock
-- no longer supports embedded exercises after this slice). A true
-- content rollback would re-run 0016's original lesson seed instead.
UPDATE "curriculum"."content_items"
SET payload = jsonb_set(payload, '{blocks,2,exerciseIds}', '[]'::jsonb)
WHERE id IN (
  'e727403d-6b07-4be0-9958-651f6e697dd9',
  '8ae9d096-bd3d-4ce7-ba23-886ac3c284ef',
  '674c22b7-9014-4b51-9a5f-99068d8d0299',
  '8b64b5b4-ba56-4afe-9e0c-89bfcff4f99e',
  '1a7848e3-76eb-4011-be34-3a85c830e210'
);

DELETE FROM "curriculum"."content_items" WHERE "type" = 'exercise';
