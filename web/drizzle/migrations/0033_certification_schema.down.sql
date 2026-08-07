DROP TABLE IF EXISTS "assessment"."certificates";
DROP TABLE IF EXISTS "assessment"."certification_results";
ALTER TABLE "assessment"."test_blueprints" DROP CONSTRAINT IF EXISTS "test_blueprints_kind_check";
DROP INDEX IF EXISTS "assessment"."test_blueprints_one_per_level";
ALTER TABLE "assessment"."test_blueprints" ADD CONSTRAINT "test_blueprints_kind_check" CHECK ("kind" IN ('placement', 'unit_checkpoint'));
ALTER TABLE "assessment"."test_blueprints" DROP COLUMN IF EXISTS "cefr_level";
