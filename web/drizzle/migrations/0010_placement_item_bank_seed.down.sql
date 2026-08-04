-- Rollback for 0010_placement_item_bank_seed.sql.
DELETE FROM "assessment"."test_blueprints" WHERE "key" = 'placement';
DELETE FROM "assessment"."item_bank" WHERE "skill" IN ('grammar', 'vocabulary', 'reading', 'listening', 'speaking');
