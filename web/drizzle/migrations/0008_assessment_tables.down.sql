-- Rollback for 0008_assessment_tables.sql.
DROP TABLE IF EXISTS "assessment"."results";
DROP TABLE IF EXISTS "assessment"."responses";
DROP TABLE IF EXISTS "assessment"."attempts";
DROP TABLE IF EXISTS "assessment"."item_bank";
DROP TABLE IF EXISTS "assessment"."test_blueprints";
DROP TYPE IF EXISTS "shared"."skill_type";
