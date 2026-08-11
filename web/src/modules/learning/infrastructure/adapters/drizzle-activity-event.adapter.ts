import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { activityEvents } from "@/modules/learning/infrastructure/db/tables/learning";
import type {
  ActivityEvent,
  ActivityEventRepositoryPort,
  RecordActivityEventInput,
} from "@/modules/learning/application/ports/activity-event-repository-port";

function toDomain(row: typeof activityEvents.$inferSelect): ActivityEvent {
  return {
    id: row.id,
    userId: row.userId,
    eventType: row.eventType,
    lessonId: row.lessonId ?? undefined,
    materialId: row.materialId ?? undefined,
    exerciseId: row.exerciseId ?? undefined,
    metadata: row.metadata as Record<string, unknown>,
    createdAt: row.createdAt,
  };
}

export class DrizzleActivityEventAdapter implements ActivityEventRepositoryPort {
  async record(input: RecordActivityEventInput): Promise<ActivityEvent> {
    const [row] = await getDb()
      .insert(activityEvents)
      .values({
        userId: input.userId,
        eventType: input.eventType,
        lessonId: input.lessonId,
        materialId: input.materialId,
        exerciseId: input.exerciseId,
        metadata: input.metadata ?? {},
      })
      .returning();

    return toDomain(row);
  }

  async listRecentForUser(userId: string, limit: number): Promise<ActivityEvent[]> {
    const rows = await getDb()
      .select()
      .from(activityEvents)
      .where(eq(activityEvents.userId, userId))
      .orderBy(desc(activityEvents.createdAt))
      .limit(limit);

    return rows.map(toDomain);
  }

  async getLastActivityForUsers(userIds: string[]): Promise<Map<string, Date>> {
    if (userIds.length === 0) return new Map();

    const rows = await getDb()
      .select({ userId: activityEvents.userId, lastActivity: sql<Date>`max(${activityEvents.createdAt})` })
      .from(activityEvents)
      .where(inArray(activityEvents.userId, userIds))
      .groupBy(activityEvents.userId);

    return new Map(rows.map((row) => [row.userId, new Date(row.lastActivity)]));
  }

  async listViewedBlockIndexes(userId: string, lessonId: string): Promise<number[]> {
    const rows = await getDb()
      .selectDistinct({ blockIndex: sql<number>`(${activityEvents.metadata} ->> 'blockIndex')::int` })
      .from(activityEvents)
      .where(and(eq(activityEvents.userId, userId), eq(activityEvents.lessonId, lessonId), eq(activityEvents.eventType, "section_viewed")));

    return rows.map((row) => row.blockIndex).filter((index) => Number.isInteger(index));
  }
}
