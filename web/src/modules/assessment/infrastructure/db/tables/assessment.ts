import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  numeric,
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
});

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
  // 'placement' | 'unit_checkpoint' — Unit Checkpoint slice (migration 0031).
  kind: varchar("kind", { length: 20 }).notNull().default("placement"),
  unitId: uuid("unit_id").references(() => units.id),
});

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
  (table) => [index("assessment_attempts_user_id_idx").on(table.userId)],
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
  (table) => [index("checkpoint_results_user_id_idx").on(table.userId)],
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
