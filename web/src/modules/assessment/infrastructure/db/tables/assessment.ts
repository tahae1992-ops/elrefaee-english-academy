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
  // { correctOptionIndex: number } for multiple_choice; null for free_text.
  scoringKey: jsonb("scoring_key"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const testBlueprints = assessmentSchema.table("test_blueprints", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  academyId: uuid("academy_id")
    .notNull()
    .references(() => academies.id),
  key: varchar("key", { length: 60 }).notNull().unique(),
  // { itemsPerSkillPerTier, tiersAroundSelfAssessment, passThresholdPercent, gradedSkills }
  rules: jsonb("rules").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
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
