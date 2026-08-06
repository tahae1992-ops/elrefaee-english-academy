import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { checkpointResults } from "@/modules/assessment/infrastructure/db/tables/assessment";
import type { SkillBreakdownEntry } from "@/modules/assessment/domain/services/score-checkpoint-attempt";
import type {
  CheckpointResultRecord,
  CheckpointResultRepositoryPort,
  SaveCheckpointResultInput,
} from "@/modules/assessment/application/ports/checkpoint-result-repository-port";

function toRecord(row: typeof checkpointResults.$inferSelect): CheckpointResultRecord {
  return {
    id: row.id,
    attemptId: row.attemptId,
    userId: row.userId,
    unitId: row.unitId,
    scorePercent: row.scorePercent,
    passed: row.passed,
    skillBreakdown: row.skillBreakdown as Record<string, SkillBreakdownEntry>,
    createdAt: row.createdAt,
  };
}

export class DrizzleCheckpointResultAdapter implements CheckpointResultRepositoryPort {
  async save(input: SaveCheckpointResultInput): Promise<CheckpointResultRecord> {
    const [row] = await getDb()
      .insert(checkpointResults)
      .values({
        attemptId: input.attemptId,
        userId: input.userId,
        unitId: input.unitId,
        scorePercent: input.scorePercent,
        passed: input.passed,
        skillBreakdown: input.skillBreakdown,
      })
      .returning();

    return toRecord(row);
  }

  async findByAttemptId(attemptId: string): Promise<CheckpointResultRecord | null> {
    const [row] = await getDb().select().from(checkpointResults).where(eq(checkpointResults.attemptId, attemptId)).limit(1);
    return row ? toRecord(row) : null;
  }

  async findPassedUnitIds(userId: string, unitIds: string[]): Promise<Set<string>> {
    if (unitIds.length === 0) return new Set();
    const rows = await getDb()
      .select({ unitId: checkpointResults.unitId })
      .from(checkpointResults)
      .where(and(eq(checkpointResults.userId, userId), eq(checkpointResults.passed, true), inArray(checkpointResults.unitId, unitIds)));

    return new Set(rows.map((row) => row.unitId));
  }
}
