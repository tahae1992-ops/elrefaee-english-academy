export interface TeacherAssignment {
  id: string;
  teacherId: string;
  studentId: string;
  academyId: string;
  assignedAt: Date;
}

export interface AssignStudentInput {
  teacherId: string;
  studentId: string;
  academyId: string;
  assignedBy?: string;
}

/**
 * The server-side authorization boundary every teacher-facing query
 * goes through: a teacher can only ever act on students they have a
 * row here for. `isAssigned` is the specific check
 * `GetStudentDetailUseCase` calls before returning anything.
 */
export interface TeacherAssignmentRepositoryPort {
  listAssignedStudentIds(teacherId: string): Promise<string[]>;
  isAssigned(teacherId: string, studentId: string): Promise<boolean>;
  assign(input: AssignStudentInput): Promise<TeacherAssignment>;
}
