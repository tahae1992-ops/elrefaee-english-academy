import type { AssignStudentInput, TeacherAssignment, TeacherAssignmentRepositoryPort } from "@/modules/instruction/application/ports/teacher-assignment-repository-port";

/** No admin UI consumes this yet (out of scope for this pass — see roster.ts's header comment); exists so assignment isn't only possible via a raw SQL insert. */
export class AssignStudentToTeacherUseCase {
  constructor(private readonly teacherAssignments: TeacherAssignmentRepositoryPort) {}

  async execute(input: AssignStudentInput): Promise<TeacherAssignment> {
    return this.teacherAssignments.assign(input);
  }
}
