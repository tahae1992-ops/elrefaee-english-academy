import { and, eq } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { contentItems, units } from "@/modules/curriculum/infrastructure/db/tables/curriculum";
import type { UnitRepositoryPort, PublishedUnit } from "@/modules/curriculum/application/ports/unit-repository-port";

function toPublishedUnit(row: { id: string; courseId: string; orderIndex: number; payload: unknown }): PublishedUnit {
  const payload = row.payload as { title: string; description: string };
  return { id: row.id, courseId: row.courseId, orderIndex: row.orderIndex, title: payload.title, description: payload.description };
}

export class DrizzleUnitAdapter implements UnitRepositoryPort {
  async listForCourse(courseId: string): Promise<PublishedUnit[]> {
    const rows = await getDb()
      .select({ id: units.id, courseId: units.courseId, orderIndex: units.orderIndex, payload: contentItems.payload })
      .from(units)
      .innerJoin(contentItems, eq(units.contentItemId, contentItems.id))
      .where(and(eq(units.courseId, courseId), eq(contentItems.status, "published")));

    return rows.map(toPublishedUnit);
  }

  async getById(unitId: string): Promise<PublishedUnit | null> {
    const [row] = await getDb()
      .select({ id: units.id, courseId: units.courseId, orderIndex: units.orderIndex, payload: contentItems.payload })
      .from(units)
      .innerJoin(contentItems, eq(units.contentItemId, contentItems.id))
      .where(and(eq(units.id, unitId), eq(contentItems.status, "published")))
      .limit(1);

    return row ? toPublishedUnit(row) : null;
  }
}
