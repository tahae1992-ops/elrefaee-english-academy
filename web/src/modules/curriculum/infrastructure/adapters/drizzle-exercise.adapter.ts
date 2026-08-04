import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { contentItems } from "@/modules/curriculum/infrastructure/db/tables/curriculum";
import type { ExerciseRepositoryPort } from "@/modules/curriculum/application/ports/exercise-repository-port";
import type { Exercise } from "@/modules/curriculum/domain/services/exercise";

export class DrizzleExerciseAdapter implements ExerciseRepositoryPort {
  async getById(exerciseId: string): Promise<Exercise | null> {
    const [row] = await getDb()
      .select({ id: contentItems.id, payload: contentItems.payload })
      .from(contentItems)
      .where(and(eq(contentItems.id, exerciseId), eq(contentItems.type, "exercise"), eq(contentItems.status, "published")))
      .limit(1);

    return row ? (row.payload as Exercise) : null;
  }

  async listByIds(exerciseIds: string[]): Promise<Map<string, Exercise>> {
    if (exerciseIds.length === 0) return new Map();

    const rows = await getDb()
      .select({ id: contentItems.id, payload: contentItems.payload })
      .from(contentItems)
      .where(and(inArray(contentItems.id, exerciseIds), eq(contentItems.type, "exercise"), eq(contentItems.status, "published")));

    return new Map(rows.map((row) => [row.id, row.payload as Exercise]));
  }
}
