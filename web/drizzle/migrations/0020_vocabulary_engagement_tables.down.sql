DROP INDEX IF EXISTS "learning"."vocabulary_review_state_user_due_idx";
DROP INDEX IF EXISTS "learning"."vocabulary_review_state_user_entry_unique";
DROP INDEX IF EXISTS "engagement"."xp_transactions_user_idx";
DROP INDEX IF EXISTS "curriculum"."vocabulary_entries_academy_headword_sense_unique";

DROP TABLE IF EXISTS "learning"."vocabulary_review_state";
DROP TABLE IF EXISTS "engagement"."xp_transactions";
DROP TABLE IF EXISTS "engagement"."xp_balances";
DROP TABLE IF EXISTS "curriculum"."vocabulary_entries";
