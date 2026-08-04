import { and, eq } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { contentItems, lessons, units } from "@/modules/curriculum/infrastructure/db/tables/curriculum";
import type {
  LessonRepositoryPort,
  PublishedLesson,
  PublishedLessonSummary,
} from "@/modules/curriculum/application/ports/lesson-repository-port";
import type { LessonContent } from "@/modules/curriculum/domain/services/lesson-blocks";

function toSummary(row: { id: string; unitId: string; orderIndex: number; payload: unknown }): PublishedLessonSummary {
  const payload = row.payload as LessonContent;
  return { id: row.id, unitId: row.unitId, orderIndex: row.orderIndex, title: payload.title };
}

export class DrizzleLessonAdapter implements LessonRepositoryPort {
  async listForUnit(unitId: string): Promise<PublishedLessonSummary[]> {
    const rows = await getDb()
      .select({ id: lessons.id, unitId: lessons.unitId, orderIndex: lessons.orderIndex, payload: contentItems.payload })
      .from(lessons)
      .innerJoin(contentItems, eq(lessons.contentItemId, contentItems.id))
      .where(and(eq(lessons.unitId, unitId), eq(contentItems.status, "published")));

    return rows.map(toSummary);
  }

  async listForCourse(courseId: string): Promise<PublishedLessonSummary[]> {
    const rows = await getDb()
      .select({ id: lessons.id, unitId: lessons.unitId, orderIndex: lessons.orderIndex, payload: contentItems.payload })
      .from(lessons)
      .innerJoin(contentItems, eq(lessons.contentItemId, contentItems.id))
      .innerJoin(units, eq(lessons.unitId, units.id))
      .where(and(eq(units.courseId, courseId), eq(contentItems.status, "published")));

    return rows.map(toSummary);
  }

  async getById(lessonId: string): Promise<PublishedLesson | null> {
    const [row] = await getDb()
      .select({
        id: lessons.id,
        unitId: lessons.unitId,
        orderIndex: lessons.orderIndex,
        payload: contentItems.payload,
        courseId: units.courseId,
      })
      .from(lessons)
      .innerJoin(contentItems, eq(lessons.contentItemId, contentItems.id))
      .innerJoin(units, eq(lessons.unitId, units.id))
      .where(and(eq(lessons.id, lessonId), eq(contentItems.status, "published")))
      .limit(1);

    if (!row) return null;
    return {
      id: row.id,
      unitId: row.unitId,
      orderIndex: row.orderIndex,
      title: (row.payload as LessonContent).title,
      courseId: row.courseId,
      content: row.payload as LessonContent,
    };
  }
}
