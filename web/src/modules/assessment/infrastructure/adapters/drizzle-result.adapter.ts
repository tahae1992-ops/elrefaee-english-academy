import { eq } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { results } from "@/modules/assessment/infrastructure/db/tables/assessment";
import type { CefrLevel } from "@/modules/assessment/domain/services/score-placement-attempt";
import type { ResultRecord, ResultRepositoryPort, SaveResultInput } from "@/modules/assessment/application/ports/result-repository-port";

export class DrizzleResultAdapter implements ResultRepositoryPort {
  async save(input: SaveResultInput): Promise<ResultRecord> {
    const [row] = await getDb()
      .insert(results)
      .values({
        attemptId: input.attemptId,
        userId: input.userId,
        skillLevels: input.skillLevels,
        overallLevel: input.overallLevel,
      })
      .returning();

    return {
      id: row.id,
      attemptId: row.attemptId,
      userId: row.userId,
      skillLevels: row.skillLevels as Record<string, CefrLevel>,
      overallLevel: row.overallLevel,
      createdAt: row.createdAt,
    };
  }

  async findByAttemptId(attemptId: string): Promise<ResultRecord | null> {
    const [row] = await getDb().select().from(results).where(eq(results.attemptId, attemptId)).limit(1);
    if (!row) return null;
    return {
      id: row.id,
      attemptId: row.attemptId,
      userId: row.userId,
      skillLevels: row.skillLevels as Record<string, CefrLevel>,
      overallLevel: row.overallLevel,
      createdAt: row.createdAt,
    };
  }
}
