import { sql } from "drizzle-orm";
import { boolean, index, integer, jsonb, numeric, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { learningSchema } from "@/shared/infrastructure/db/schemas";
import { academies } from "@/shared/infrastructure/db/tables/academy";
import { userProfiles } from "@/modules/identity/infrastructure/db/tables/identity";
import { contentItems, courses, units, lessons, vocabularyEntries } from "@/modules/curriculum/infrastructure/db/tables/curriculum";

/**
 * Lesson Viewer slice — DDD §3.5's `enrollments`/`progress_records`,
 * built in full (no trims against the documented schema). Allowed
 * values for `placement_method`/`status` are enforced application-side
 * only (varchar + comment), matching the existing codebase convention
 * for similar fields (assessment.attempts.status,
 * assessment.responses.scored_by) rather than a DB-level CHECK, which
 * isn't used anywhere else in this schema either.
 */

export const enrollments = learningSchema.table(
  "enrollments",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id),
    academyId: uuid("academy_id")
      .notNull()
      .references(() => academies.id),
    currentCourseId: uuid("current_course_id")
      .notNull()
      .references(() => courses.id),
    currentUnitId: uuid("current_unit_id").references(() => units.id),
    // 'self_assessment' | 'adaptive_test' | 'manual' — this slice only
    // ever writes 'manual' (a learner choosing a course from the
    // Catalog); the other two values are reserved for a future
    // guided-placement-into-a-course flow, not built here.
    placementMethod: varchar("placement_method", { length: 20 }).notNull(),
    placedAt: timestamp("placed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("enrollments_user_academy_unique").on(table.userId, table.academyId)],
);

export const progressRecords = learningSchema.table(
  "progress_records",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id),
    // 'not_started' | 'in_progress' | 'completed'.
    status: varchar("status", { length: 15 }).notNull().default("not_started"),
    // { blockIndex: number, blockInteractions: Record<number, unknown> } —
    // exact block position + per-block interaction state (practice
    // answers, task submission text), so a resumed lesson reopens with
    // both the right block AND that block's gating interaction already
    // satisfied if it was already done (FR-05's "resumes at that exact
    // point" AC). No schema for this shape exists in the docs — designed
    // for this slice.
    lastPosition: jsonb("last_position").notNull().default({}),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("progress_records_user_lesson_unique").on(table.userId, table.lessonId),
    index("progress_records_user_status_idx").on(table.userId, table.status),
  ],
);

/**
 * Exercise Engine slice — real per-attempt tracking (SRS FR-07's
 * postcondition: "Correctness + latency event recorded"). Neither the
 * DDD nor any other doc defines a table for this (research found zero
 * `exercise_attempts`/`exercise_responses` table anywhere in doc 05,
 * and `content_type='exercise'` has no satellite table the way
 * `assessment_item`/`item_bank` does) — this is genuinely new schema.
 * A `learning`, not `assessment`, home was chosen because exercise
 * attempts are ongoing formative practice within a lesson, not a
 * discrete test (EDD §14: "Formative... without being a 'test'"),
 * matching this schema's existing `progress_records`, not
 * `assessment.attempts`/`responses`.
 *
 * `lessonId` is not a derived/optimization denormalization — there is
 * no FK path from an exercise `content_items` row back to the lesson
 * that references it (a lesson's `controlled_practice` block holds
 * `exerciseIds` inside its own jsonb payload, not the reverse), so
 * this column is the only record of which lesson context an attempt
 * happened in.
 */
export const exerciseAttempts = learningSchema.table(
  "exercise_attempts",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => contentItems.id),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id),
    attemptNumber: integer("attempt_number").notNull(),
    responsePayload: jsonb("response_payload").notNull(),
    isCorrect: boolean("is_correct").notNull(),
    latencyMs: integer("latency_ms").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("exercise_attempts_user_exercise_idx").on(table.userId, table.exerciseId),
    index("exercise_attempts_user_lesson_idx").on(table.userId, table.lessonId),
  ],
);

/**
 * Review Engine slice — DB Design §3.5's `learning.vocabulary_review_state`,
 * the per-learner FSRS scheduler state (EDD §15), built to the documented
 * column list exactly, plus one addition disclosed here:
 *
 * `lastEventId` is not in the DB Design doc. SAD §17 states the scheduler
 * "is idempotent per review-event-id (mirrors FR-18's idempotency
 * requirement for XP) — a duplicate response does not double-advance
 * `dueAt`" — that requirement can't be satisfied without persisting
 * something to compare against, and no other table exists to hold it.
 * A single nullable column here is the narrowest fix; it does not change
 * the documented table's meaning for any other column.
 */
export const vocabularyReviewState = learningSchema.table(
  "vocabulary_review_state",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id),
    vocabularyEntryId: uuid("vocabulary_entry_id")
      .notNull()
      .references(() => vocabularyEntries.id),
    stability: numeric("stability", { precision: 8, scale: 4, mode: "number" }).notNull(),
    difficulty: numeric("difficulty", { precision: 8, scale: 4, mode: "number" }).notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
    reviewCount: integer("review_count").notNull().default(0),
    lastEventId: uuid("last_event_id"),
  },
  (table) => [
    uniqueIndex("vocabulary_review_state_user_entry_unique").on(table.userId, table.vocabularyEntryId),
    index("vocabulary_review_state_user_due_idx").on(table.userId, table.dueAt),
  ],
);
