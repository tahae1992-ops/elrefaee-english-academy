import type { TeacherAssignmentRepositoryPort } from "@/modules/instruction/application/ports/teacher-assignment-repository-port";
import type { RosterRepositoryPort } from "@/modules/instruction/application/ports/roster-repository-port";
import type { StudentRosterEntry } from "@/modules/instruction/domain/services/roster";

/**
 * Authorization lives in the query itself, not a separate check: the
 * roster can only ever contain students `teacherAssignments` actually
 * returns for this teacherId — there is no code path that lists
 * students outside that set.
 */
export class GetTeacherRosterUseCase {
  constructor(
    private readonly teacherAssignments: TeacherAssignmentRepositoryPort,
    private readonly roster: RosterRepositoryPort,
  ) {}

  async execute(teacherId: string): Promise<StudentRosterEntry[]> {
    const studentIds = await this.teacherAssignments.listAssignedStudentIds(teacherId);
    if (studentIds.length === 0) return [];
    return this.roster.listRosterEntries(studentIds);
  }
}
