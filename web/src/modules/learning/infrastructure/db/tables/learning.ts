import { sql } from "drizzle-orm";
import { index, jsonb, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { learningSchema } from "@/shared/infrastructure/db/schemas";
import { academies } from "@/shared/infrastructure/db/tables/academy";
import { userProfiles } from "@/modules/identity/infrastructure/db/tables/identity";
import { courses, units, lessons } from "@/modules/curriculum/infrastructure/db/tables/curriculum";

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
