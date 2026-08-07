import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { assessmentSchema } from "@/shared/infrastructure/db/schemas";
import { academies } from "@/shared/infrastructure/db/tables/academy";
import { cefrLevel, skillType } from "@/shared/infrastructure/db/tables/enums";
import { userProfiles } from "@/modules/identity/infrastructure/db/tables/identity";
import { units } from "@/modules/curriculum/infrastructure/db/tables/curriculum";

/**
 * Placement Test slice — the MVP-scoped assessment schema (DDD §3.9),
 * pulled forward from Sprint 9-10 with one deliberate simplification:
 * `item_bank` here has no `content_item_id` FK to
 * `curriculum.content_items`, because that table (and the whole
 * Content Item governance envelope it belongs to) is Curriculum
 * Engine's job — Sprint 4-5, "Very High complexity," not something
 * this slice pulls forward too. Item content is stored directly on
 * this table instead; migrating to the governed-content model happens
 * when Curriculum Engine actually lands. Approved as the MVP scope via
 * explicit user decision (SRS §19's documented "fixed diagnostic, not
 * full adaptive routing" choice).
 */

export const itemBank = assessmentSchema.table("item_bank", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  academyId: uuid("academy_id")
    .notNull()
    .references(() => academies.id),
  skill: skillType("skill").notNull(),
  cefrLevel: cefrLevel("cefr_level").notNull(),
  // DDD §3.9: "simple 1-5 scale at MVP; reserved range for future IRT-calibrated difficulty."
  difficulty: numeric("difficulty", { precision: 4, scale: 2 }).notNull(),
  // 'multiple_choice' (auto-scored) | 'free_text' (ungraded at MVP — Speaking).
  itemType: varchar("item_type", { length: 20 }).notNull(),
  // { prompt: string, passage?: string, options?: string[] } — shape varies by itemType.
  prompt: jsonb("prompt").notNull(),
  // { correctOptionIndex: number, explanation?: string } for multiple_choice (explanation is checkpoint-only — FR-08's immediate-feedback requirement, doc 08 §3.9); null for free_text.
  scoringKey: jsonb("scoring_key"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  // Unit Checkpoint slice: null for placement items (unit-agnostic); set for checkpoint items, scoping them to the one unit they test (SRS FR-06/FR-08).
  unitId: uuid("unit_id").references(() => units.id),
}, (table) => [
  // Phase 16: assembleItems/getSpeakingPrompt/assembleCertificationItems all filter by (skill, cefrLevel); assembleCheckpointItems filters by unitId alone (migration 0036). Low-urgency (item_bank is small today) but cheap insurance against Phase 10 CMS growth.
  index("item_bank_skill_cefr_level_idx").on(table.skill, table.cefrLevel),
  index("item_bank_unit_idx").on(table.unitId),
]);

export const testBlueprints = assessmentSchema.table("test_blueprints", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  academyId: uuid("academy_id")
    .notNull()
    .references(() => academies.id),
  key: varchar("key", { length: 60 }).notNull().unique(),
  // Placement: { itemsPerSkillPerTier, tiersAroundSelfAssessment, passThresholdPercent, gradedSkills }
  // Unit checkpoint: { itemCount, passThresholdPercent, skills }
  rules: jsonb("rules").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  // 'placement' | 'unit_checkpoint' | 'certification_exam' — migrations 0031, 0033.
  kind: varchar("kind", { length: 20 }).notNull().default("placement"),
  unitId: uuid("unit_id").references(() => units.id),
  // Certification Exam slice (migration 0033): scopes a blueprint to a level, the way unitId scopes a checkpoint blueprint to a unit.
  cefrLevel: cefrLevel("cefr_level"),
}, (table) => [
  // Hand-added in migrations 0031/0033 -- backfilled here so drizzle-kit's own view of the schema matches the live database (Phase 16 audit finding: these were previously invisible to this file).
  uniqueIndex("test_blueprints_one_per_unit").on(table.unitId).where(sql`${table.kind} = 'unit_checkpoint'`),
  uniqueIndex("test_blueprints_one_per_level").on(table.academyId, table.cefrLevel).where(sql`${table.kind} = 'certification_exam'`),
]);

export const attempts = assessmentSchema.table(
  "attempts",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id),
    blueprintId: uuid("blueprint_id")
      .notNull()
      .references(() => testBlueprints.id),
    status: varchar("status", { length: 20 }).notNull().default("in_progress"),
    selfAssessedLevel: cefrLevel("self_assessed_level"),
    assembledItems: uuid("assembled_items").array().notNull().default(sql`'{}'::uuid[]`),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("assessment_attempts_user_id_idx").on(table.userId),
    // findInProgressByUserAndBlueprint filters both together on every attempt-start (migration 0036).
    index("assessment_attempts_user_blueprint_idx").on(table.userId, table.blueprintId),
  ],
);

export const responses = assessmentSchema.table(
  "responses",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => attempts.id),
    itemId: uuid("item_id")
      .notNull()
      .references(() => itemBank.id),
    responsePayload: jsonb("response_payload").notNull(),
    isCorrect: boolean("is_correct"),
    scoredBy: varchar("scored_by", { length: 10 }).notNull().default("auto"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("assessment_responses_attempt_item_unique").on(table.attemptId, table.itemId),
  ],
);

/** Immutable, mirrors `results` — Unit Checkpoint slice (SRS FR-06/FR-08). A separate table from `results` rather than overloading it: pass/fail + score-percent is a genuinely different result shape than placement's CEFR-level outcome. */
export const checkpointResults = assessmentSchema.table(
  "checkpoint_results",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    attemptId: uuid("attempt_id")
      .notNull()
      .unique()
      .references(() => attempts.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id),
    unitId: uuid("unit_id")
      .notNull()
      .references(() => units.id),
    scorePercent: numeric("score_percent", { precision: 5, scale: 2, mode: "number" }).notNull(),
    passed: boolean("passed").notNull(),
    // { [skill]: { correct: number, total: number } } — FR-06's exception flow: "surfaces exactly which skill(s) fell below threshold."
    skillBreakdown: jsonb("skill_breakdown").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("checkpoint_results_user_id_idx").on(table.userId),
    // findPassedUnitIds filters both together on every mastery-gate check (migration 0036).
    index("checkpoint_results_user_unit_idx").on(table.userId, table.unitId),
  ],
);

/** Immutable — DDD §3.9: no UPDATE/DELETE grant, corrections are a new attempt, never an edit. */
export const results = assessmentSchema.table("results", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  attemptId: uuid("attempt_id")
    .notNull()
    .unique()
    .references(() => attempts.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => userProfiles.id),
  // { grammar: CefrLevel, vocabulary: CefrLevel, reading: CefrLevel, listening: CefrLevel }
  skillLevels: jsonb("skill_levels").notNull(),
  overallLevel: cefrLevel("overall_level").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Immutable — Certification Exam slice (Master Blueprint §8, SRS FR-11, migration 0033). Its own table for the same reason checkpointResults has one: a level-end, multi-skill pass/fail+breakdown outcome is a different shape than placement's CEFR-level result. pendingReviewCount: free-text (Speaking) responses aren't auto-scored yet (same MVP gap as placement/checkpoint) — excluded from scorePercent, but counted so the result is never silently partial. */
export const certificationResults = assessmentSchema.table(
  "certification_results",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    attemptId: uuid("attempt_id")
      .notNull()
      .unique()
      .references(() => attempts.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id),
    cefrLevel: cefrLevel("cefr_level").notNull(),
    scorePercent: numeric("score_percent", { precision: 5, scale: 2, mode: "number" }).notNull(),
    passed: boolean("passed").notNull(),
    skillBreakdown: jsonb("skill_breakdown").notNull(),
    pendingReviewCount: integer("pending_review_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("certification_results_user_id_idx").on(table.userId),
    // findHistoryByUserAndLevel filters both together on every certification cooldown/eligibility check (migration 0036).
    index("certification_results_user_cefr_level_idx").on(table.userId, table.cefrLevel),
  ],
);

/** DDD §3.4. Immutable except the active->revoked status transition (no revoke workflow built yet — named gap, no doc specifies a revocation actor/endpoint). disclaimerText/locale are frozen at issuance from shared.certificate_templates, not live-linked. */
export const certificates = assessmentSchema.table(
  "certificates",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id),
    academyId: uuid("academy_id")
      .notNull()
      .references(() => academies.id),
    cefrLevel: cefrLevel("cefr_level").notNull(),
    resultId: uuid("result_id")
      .notNull()
      .unique()
      .references(() => certificationResults.id),
    issuer: varchar("issuer", { length: 120 }).notNull().default("Elrefaee English Academy"),
    verificationCode: varchar("verification_code", { length: 20 }).notNull().unique(),
    disclaimerText: text("disclaimer_text").notNull(),
    locale: varchar("locale", { length: 35 }).notNull().default("en"),
    status: varchar("status", { length: 10 }).notNull().default("active"),
    issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
  },
  // Phase 16: the plain user_id index is replaced by two composites --
  // findByUserId orders by issuedAt, existsForUserAndLevel filters by
  // cefrLevel -- both still serve a bare user_id lookup via their
  // leading column, so no single-column index is needed alongside them (migration 0036).
  (table) => [
    index("certificates_user_issued_idx").on(table.userId, table.issuedAt),
    index("certificates_user_cefr_level_idx").on(table.userId, table.cefrLevel),
  ],
);
