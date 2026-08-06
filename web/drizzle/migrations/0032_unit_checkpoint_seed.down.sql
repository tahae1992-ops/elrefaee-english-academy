DELETE FROM "assessment"."item_bank" WHERE "unit_id" IS NOT NULL;
DELETE FROM "assessment"."test_blueprints" WHERE "kind" = 'unit_checkpoint';
