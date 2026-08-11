import { sql } from "drizzle-orm";
import { timestamp, uniqueIndex, index, uuid } from "drizzle-orm/pg-core";
import { instructionSchema } from "@/shared/infrastructure/db/schemas";
import { academies } from "@/shared/infrastructure/db/tables/academy";
import { userProfiles } from "@/modules/identity/infrastructure/db/tables/identity";

/**
 * Phase 21, Goal 2 — the `instruction` bounded context reserved since
 * Sprint 1 (schemas.ts) but never built into until now. One row per
 * (teacher, student) assignment — the server-side authorization
 * boundary every teacher-facing query filters through: a teacher can
 * only ever see students they have a row here for, never the full
 * student base.
 */
export const teacherAssignments = instructionSchema.table(
  "teacher_assignments",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    teacherId: uuid("teacher_id")
      .notNull()
      .references(() => userProfiles.id),
    studentId: uuid("student_id")
      .notNull()
      .references(() => userProfiles.id),
    academyId: uuid("academy_id")
      .notNull()
      .references(() => academies.id),
    assignedBy: uuid("assigned_by").references(() => userProfiles.id),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("teacher_assignments_teacher_student_unique").on(table.teacherId, table.studentId),
    index("teacher_assignments_teacher_idx").on(table.teacherId),
    index("teacher_assignments_student_idx").on(table.studentId),
  ],
);
