import type { TeacherAssignmentRepositoryPort } from "@/modules/instruction/application/ports/teacher-assignment-repository-port";
import type { RosterRepositoryPort } from "@/modules/instruction/application/ports/roster-repository-port";
import type { StudentDetail } from "@/modules/instruction/domain/services/roster";

export class NotAuthorizedForStudentError extends Error {
  constructor() {
    super("This teacher is not assigned to this student.");
    this.name = "NotAuthorizedForStudentError";
  }
}

/**
 * Security-critical: this is the one place that decides whether a
 * teacher may see a specific student's data. `isAssigned` is checked
 * server-side, unconditionally, before any detail is fetched --
 * copying the studentId from the roster into a URL bar is not itself
 * sufficient to see another teacher's student.
 */
export class GetStudentDetailUseCase {
  constructor(
    private readonly teacherAssignments: TeacherAssignmentRepositoryPort,
    private readonly roster: RosterRepositoryPort,
  ) {}

  async execute(teacherId: string, studentId: string): Promise<StudentDetail | null> {
    const assigned = await this.teacherAssignments.isAssigned(teacherId, studentId);
    if (!assigned) {
      throw new NotAuthorizedForStudentError();
    }

    return this.roster.getStudentDetail(studentId);
  }
}
