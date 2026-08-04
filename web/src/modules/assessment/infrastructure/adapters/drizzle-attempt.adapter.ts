import { and, eq } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { attempts, responses } from "@/modules/assessment/infrastructure/db/tables/assessment";
import type {
  AttemptRecord,
  AttemptRepositoryPort,
  CreateAttemptInput,
  RecordResponseInput,
  StoredResponse,
} from "@/modules/assessment/application/ports/attempt-repository-port";

export class DrizzleAttemptAdapter implements AttemptRepositoryPort {
  async create(input: CreateAttemptInput): Promise<AttemptRecord> {
    const [row] = await getDb()
      .insert(attempts)
      .values({
        userId: input.userId,
        blueprintId: input.blueprintId,
        selfAssessedLevel: input.selfAssessedLevel,
        assembledItems: input.assembledItemIds,
      })
      .returning({ id: attempts.id, userId: attempts.userId, status: attempts.status, assembledItems: attempts.assembledItems });

    return { id: row.id, userId: row.userId, status: row.status as AttemptRecord["status"], assembledItems: row.assembledItems };
  }

  async findById(attemptId: string): Promise<AttemptRecord | null> {
    const [row] = await getDb()
      .select({ id: attempts.id, userId: attempts.userId, status: attempts.status, assembledItems: attempts.assembledItems })
      .from(attempts)
      .where(eq(attempts.id, attemptId))
      .limit(1);

    return row ? { id: row.id, userId: row.userId, status: row.status as AttemptRecord["status"], assembledItems: row.assembledItems } : null;
  }

  async hasResponseForItem(attemptId: string, itemId: string): Promise<boolean> {
    const [row] = await getDb()
      .select({ id: responses.id })
      .from(responses)
      .where(and(eq(responses.attemptId, attemptId), eq(responses.itemId, itemId)))
      .limit(1);
    return !!row;
  }

  async recordResponse(input: RecordResponseInput): Promise<void> {
    await getDb().insert(responses).values({
      attemptId: input.attemptId,
      itemId: input.itemId,
      responsePayload: input.responsePayload,
      isCorrect: input.isCorrect,
      scoredBy: input.scoredBy,
    });
  }

  async getResponses(attemptId: string): Promise<StoredResponse[]> {
    const rows = await getDb()
      .select({ itemId: responses.itemId, isCorrect: responses.isCorrect })
      .from(responses)
      .where(eq(responses.attemptId, attemptId));
    return rows;
  }

  async markCompleted(attemptId: string): Promise<void> {
    await getDb()
      .update(attempts)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(attempts.id, attemptId));
  }
}
