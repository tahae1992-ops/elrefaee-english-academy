import { and, count, countDistinct, eq } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { exerciseAttempts } from "@/modules/learning/infrastructure/db/tables/learning";
import type {
  ExerciseAttempt,
  ExerciseAttemptRepositoryPort,
  RecordExerciseAttemptInput,
} from "@/modules/learning/application/ports/exercise-attempt-repository-port";

function toExerciseAttempt(row: typeof exerciseAttempts.$inferSelect): ExerciseAttempt {
  return {
    id: row.id,
    userId: row.userId,
    exerciseId: row.exerciseId,
    lessonId: row.lessonId,
    attemptNumber: row.attemptNumber,
    responsePayload: row.responsePayload,
    isCorrect: row.isCorrect,
    latencyMs: row.latencyMs,
    createdAt: row.createdAt,
  };
}

export class DrizzleExerciseAttemptAdapter implements ExerciseAttemptRepositoryPort {
  async record(input: RecordExerciseAttemptInput): Promise<ExerciseAttempt> {
    const [{ value: priorAttempts }] = await getDb()
      .select({ value: count() })
      .from(exerciseAttempts)
      .where(and(eq(exerciseAttempts.userId, input.userId), eq(exerciseAttempts.exerciseId, input.exerciseId)));

    const [row] = await getDb()
      .insert(exerciseAttempts)
      .values({
        userId: input.userId,
        exerciseId: input.exerciseId,
        lessonId: input.lessonId,
        attemptNumber: priorAttempts + 1,
        responsePayload: input.responsePayload,
        isCorrect: input.isCorrect,
        latencyMs: input.latencyMs,
      })
      .returning();

    return toExerciseAttempt(row);
  }

  async countDistinctCorrectForUser(userId: string): Promise<number> {
    const [{ value }] = await getDb()
      .select({ value: countDistinct(exerciseAttempts.exerciseId) })
      .from(exerciseAttempts)
      .where(and(eq(exerciseAttempts.userId, userId), eq(exerciseAttempts.isCorrect, true)));

    return value;
  }
}
