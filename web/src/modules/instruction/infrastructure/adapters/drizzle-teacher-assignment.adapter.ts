import { and, eq } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { teacherAssignments } from "@/modules/instruction/infrastructure/db/tables/instruction";
import type {
  AssignStudentInput,
  TeacherAssignment,
  TeacherAssignmentRepositoryPort,
} from "@/modules/instruction/application/ports/teacher-assignment-repository-port";

function toDomain(row: typeof teacherAssignments.$inferSelect): TeacherAssignment {
  return {
    id: row.id,
    teacherId: row.teacherId,
    studentId: row.studentId,
    academyId: row.academyId,
    assignedAt: row.assignedAt,
  };
}

export class DrizzleTeacherAssignmentAdapter implements TeacherAssignmentRepositoryPort {
  async listAssignedStudentIds(teacherId: string): Promise<string[]> {
    const rows = await getDb()
      .select({ studentId: teacherAssignments.studentId })
      .from(teacherAssignments)
      .where(eq(teacherAssignments.teacherId, teacherId));

    return rows.map((row) => row.studentId);
  }

  async isAssigned(teacherId: string, studentId: string): Promise<boolean> {
    const [row] = await getDb()
      .select({ id: teacherAssignments.id })
      .from(teacherAssignments)
      .where(and(eq(teacherAssignments.teacherId, teacherId), eq(teacherAssignments.studentId, studentId)))
      .limit(1);

    return row !== undefined;
  }

  async assign(input: AssignStudentInput): Promise<TeacherAssignment> {
    const [row] = await getDb()
      .insert(teacherAssignments)
      .values({
        teacherId: input.teacherId,
        studentId: input.studentId,
        academyId: input.academyId,
        assignedBy: input.assignedBy,
      })
      .returning();

    return toDomain(row);
  }
}
