import type { StudentDetail, StudentRosterEntry } from "@/modules/instruction/domain/services/roster";

/**
 * The cross-module read side of the teacher dashboard — joins
 * identity/learning/curriculum/assessment data the same way this
 * codebase's other cross-module adapters already do (e.g.
 * `learning`'s Drizzle tables importing `curriculum`'s directly for
 * FKs); a real, single, teacher-scoped read model rather than each
 * page assembling four separate module calls itself.
 */
export interface RosterRepositoryPort {
  listRosterEntries(studentIds: string[]): Promise<StudentRosterEntry[]>;
  getStudentDetail(studentId: string): Promise<StudentDetail | null>;
}
