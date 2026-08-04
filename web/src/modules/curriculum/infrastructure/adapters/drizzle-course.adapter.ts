import { eq } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { contentItems, courses } from "@/modules/curriculum/infrastructure/db/tables/curriculum";
import type { CourseRepositoryPort, PublishedCourse } from "@/modules/curriculum/application/ports/course-repository-port";
import type { CefrLevel } from "@/modules/curriculum/domain/services/compute-course-access";

export class DrizzleCourseAdapter implements CourseRepositoryPort {
  async listPublished(): Promise<PublishedCourse[]> {
    const rows = await getDb()
      .select({
        id: courses.id,
        cefrLevel: courses.cefrLevel,
        payload: contentItems.payload,
      })
      .from(courses)
      .innerJoin(contentItems, eq(courses.contentItemId, contentItems.id))
      .where(eq(contentItems.status, "published"));

    return rows.map((row) => {
      const payload = row.payload as { title: string; description: string };
      return {
        id: row.id,
        cefrLevel: row.cefrLevel as CefrLevel,
        title: payload.title,
        description: payload.description,
      };
    });
  }
}
