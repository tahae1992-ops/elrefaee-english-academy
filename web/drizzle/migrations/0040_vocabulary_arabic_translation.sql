-- Pre-A1 blueprint (Rev. 3) §2: Arabic-support schema, smallest clean
-- addition. Everything else the blueprint's Arabic fields
-- (arabicExplanation/arabicInstruction/arabicHint) touch lives inside
-- existing jsonb payload columns (content_items.payload) -- no
-- migration needed for those. This is the one real typed column,
-- since vocabulary_entries is a real table (curriculum.ts), not jsonb.

ALTER TABLE "curriculum"."vocabulary_entries"
  ADD COLUMN "arabic_translation" varchar(200);
