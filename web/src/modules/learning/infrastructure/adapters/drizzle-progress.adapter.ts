import { and, eq, inArray, ne } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { progressRecords } from "@/modules/learning/infrastructure/db/tables/learning";
import type { LastPosition, LessonProgress, ProgressRepositoryPort } from "@/modules/learning/application/ports/progress-repository-port";
import type { LessonProgressStatus } from "@/modules/learning/domain/services/compute-unit-access";

function toLessonProgress(row: typeof progressRecords.$inferSelect): LessonProgress {
  return {
    lessonId: row.lessonId,
    status: row.status as LessonProgressStatus,
    lastPosition: row.lastPosition as LastPosition,
    completedAt: row.completedAt,
  };
}

export class DrizzleProgressAdapter implements ProgressRepositoryPort {
  async getForLesson(userId: string, lessonId: string): Promise<LessonProgress | null> {
    const [row] = await getDb()
      .select()
      .from(progressRecords)
      .where(and(eq(progressRecords.userId, userId), eq(progressRecords.lessonId, lessonId)))
      .limit(1);

    return row ? toLessonProgress(row) : null;
  }

  async listForLessons(userId: string, lessonIds: string[]): Promise<LessonProgress[]> {
    if (lessonIds.length === 0) return [];

    const rows = await getDb()
      .select()
      .from(progressRecords)
      .where(and(eq(progressRecords.userId, userId), inArray(progressRecords.lessonId, lessonIds)));

    return rows.map(toLessonProgress);
  }

  async savePosition(userId: string, lessonId: string, position: LastPosition): Promise<void> {
    await getDb()
      .insert(progressRecords)
      .values({ userId, lessonId, status: "in_progress", lastPosition: position })
      .onConflictDoUpdate({
        target: [progressRecords.userId, progressRecords.lessonId],
        // Never downgrade an already-completed lesson back to in_progress on revisit.
        set: { status: "in_progress", lastPosition: position },
        setWhere: ne(progressRecords.status, "completed"),
      });
  }

  async markCompleted(userId: string, lessonId: string, position: LastPosition): Promise<void> {
    await getDb()
      .insert(progressRecords)
      .values({ userId, lessonId, status: "completed", lastPosition: position, completedAt: new Date() })
      .onConflictDoUpdate({
        target: [progressRecords.userId, progressRecords.lessonId],
        set: { status: "completed", lastPosition: position, completedAt: new Date() },
      });
  }
}
