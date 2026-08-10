-- Migration 0033 created both the column's own UNIQUE constraint
-- (certificates_verification_code_key) and a separate explicit unique
-- index (certificates_verification_code_idx) on the same column --
-- the second is a pure duplicate, doubling write cost on every
-- certificate insert for no benefit (Supabase performance advisor:
-- duplicate_index).
DROP INDEX IF EXISTS "assessment"."certificates_verification_code_idx";
