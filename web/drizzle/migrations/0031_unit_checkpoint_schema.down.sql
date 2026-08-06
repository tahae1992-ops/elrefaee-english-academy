DROP TABLE IF EXISTS "assessment"."checkpoint_results";
ALTER TABLE "assessment"."test_blueprints" DROP CONSTRAINT IF EXISTS "test_blueprints_kind_check";
DROP INDEX IF EXISTS "assessment"."test_blueprints_one_per_unit";
ALTER TABLE "assessment"."test_blueprints" DROP COLUMN IF EXISTS "kind";
ALTER TABLE "assessment"."test_blueprints" DROP COLUMN IF EXISTS "unit_id";
ALTER TABLE "assessment"."item_bank" DROP COLUMN IF EXISTS "unit_id";
