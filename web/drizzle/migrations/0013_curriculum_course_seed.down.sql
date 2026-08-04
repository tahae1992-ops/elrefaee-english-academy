-- Rollback for 0013_curriculum_course_seed.sql.
DELETE FROM "curriculum"."courses" WHERE "cefr_level" IN ('pre_a1', 'a1', 'a2', 'b1', 'b2', 'c1');
DELETE FROM "curriculum"."content_items" WHERE "type" = 'lesson' AND "cefr_level" IN ('pre_a1', 'a1', 'a2', 'b1', 'b2', 'c1');
