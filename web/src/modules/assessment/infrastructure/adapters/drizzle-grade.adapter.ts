import { and, avg, count, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { grades } from "@/modules/assessment/infrastructure/db/tables/assessment";
import type {
  Grade,
  GradeRepositoryPort,
  RecordGradeInput,
  StudentGradeSummary,
} from "@/modules/assessment/application/ports/grade-repository-port";

function toDomain(row: typeof grades.$inferSelect): Grade {
  return {
    id: row.id,
    userId: row.userId,
    gradeType: row.gradeType,
    referenceId: row.referenceId,
    lessonId: row.lessonId ?? undefined,
    score: row.score,
    maxScore: row.maxScore,
    percentage: row.percentage,
    attemptNumber: row.attemptNumber,
    createdAt: row.createdAt,
  };
}

export class DrizzleGradeAdapter implements GradeRepositoryPort {
  async record(input: RecordGradeInput): Promise<Grade> {
    const [{ priorCount }] = await getDb()
      .select({ priorCount: count() })
      .from(grades)
      .where(and(eq(grades.userId, input.userId), eq(grades.referenceId, input.referenceId)));

    const percentage = input.maxScore > 0 ? Math.round((input.score / input.maxScore) * 10000) / 100 : 0;

    const [row] = await getDb()
      .insert(grades)
      .values({
        userId: input.userId,
        gradeType: input.gradeType,
        referenceId: input.referenceId,
        lessonId: input.lessonId,
        score: input.score,
        maxScore: input.maxScore,
        percentage,
        attemptNumber: priorCount + 1,
      })
      .returning();

    return toDomain(row);
  }

  async listRecentForUser(userId: string, limit: number): Promise<Grade[]> {
    const rows = await getDb().select().from(grades).where(eq(grades.userId, userId)).orderBy(desc(grades.createdAt)).limit(limit);
    return rows.map(toDomain);
  }

  async getSummaryForUser(userId: string): Promise<StudentGradeSummary> {
    const [{ averagePercentage, totalGrades }] = await getDb()
      .select({ averagePercentage: avg(grades.percentage), totalGrades: count() })
      .from(grades)
      .where(eq(grades.userId, userId));

    const recentGrades = await this.listRecentForUser(userId, 10);

    return {
      averagePercentage: averagePercentage !== null ? Math.round(Number(averagePercentage) * 100) / 100 : null,
      totalGrades,
      recentGrades,
    };
  }

  async getAveragePercentageForUsers(userIds: string[]): Promise<Map<string, number>> {
    if (userIds.length === 0) return new Map();

    const rows = await getDb()
      .select({ userId: grades.userId, averagePercentage: sql<string>`avg(${grades.percentage})` })
      .from(grades)
      .where(inArray(grades.userId, userIds))
      .groupBy(grades.userId);

    return new Map(rows.map((row) => [row.userId, Math.round(Number(row.averagePercentage) * 100) / 100]));
  }
}
