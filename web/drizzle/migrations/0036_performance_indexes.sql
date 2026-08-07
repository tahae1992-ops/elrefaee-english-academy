-- Phase 16 Performance: database index audit against the query
-- patterns every prior phase actually built (not synthetic guesses --
-- every index here maps to a real .where()/.orderBy()/.innerJoin() in
-- an existing adapter). Composite indexes lead with the column every
-- query filters on first (user_id), so a plain single-column lookup
-- on that same column can still use the composite's leading edge --
-- certificates_user_id_idx is dropped as redundant once its two
-- composite replacements exist.

-- High priority: unbounded, fast-growing tables filtered by user_id
-- and ordered by a timestamp -- every list/history read on these
-- pays for a full per-user scan-then-sort without this.
CREATE INDEX "xp_transactions_user_created_idx" ON "engagement"."xp_transactions" ("user_id", "created_at");
DROP INDEX IF EXISTS "engagement"."xp_transactions_user_idx";
CREATE INDEX "certificates_user_issued_idx" ON "assessment"."certificates" ("user_id", "issued_at");
DROP INDEX IF EXISTS "assessment"."certificates_user_id_idx";

-- Medium priority: FK/filter columns with zero index coverage, hit
-- on every attempt-start, mastery-gate check, and certification
-- eligibility/cooldown check.
CREATE INDEX "assessment_attempts_user_blueprint_idx" ON "assessment"."attempts" ("user_id", "blueprint_id");
CREATE INDEX "checkpoint_results_user_unit_idx" ON "assessment"."checkpoint_results" ("user_id", "unit_id");
CREATE INDEX "certification_results_user_cefr_level_idx" ON "assessment"."certification_results" ("user_id", "cefr_level");
CREATE INDEX "certificates_user_cefr_level_idx" ON "assessment"."certificates" ("user_id", "cefr_level");

-- Low priority, forward-looking: item_bank is "a few hundred rows at
-- most" today (drizzle-item-bank.adapter.ts's own comment), but
-- Phase 10 CMS growing real authored content makes these cheap
-- insurance now rather than a retrofit later.
CREATE INDEX "item_bank_skill_cefr_level_idx" ON "assessment"."item_bank" ("skill", "cefr_level");
CREATE INDEX "item_bank_unit_idx" ON "assessment"."item_bank" ("unit_id");
