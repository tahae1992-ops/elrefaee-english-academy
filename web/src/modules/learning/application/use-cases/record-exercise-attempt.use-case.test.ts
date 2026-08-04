import { describe, expect, it, vi } from "vitest";
import { RecordExerciseAttemptUseCase } from "./record-exercise-attempt.use-case";
import type { ExerciseAttemptRepositoryPort } from "@/modules/learning/application/ports/exercise-attempt-repository-port";

describe("RecordExerciseAttemptUseCase", () => {
  it("delegates to the repository's record", async () => {
    const recorded = {
      id: "a1",
      userId: "u1",
      exerciseId: "ex-1",
      lessonId: "l1",
      attemptNumber: 1,
      responsePayload: { exerciseType: "true_false", submittedAnswer: true },
      isCorrect: true,
      latencyMs: 1200,
      createdAt: new Date(),
    };
    const attempts: ExerciseAttemptRepositoryPort = { record: vi.fn().mockResolvedValue(recorded) };
    const input = {
      userId: "u1",
      exerciseId: "ex-1",
      lessonId: "l1",
      responsePayload: { exerciseType: "true_false" as const, submittedAnswer: true },
      isCorrect: true,
      latencyMs: 1200,
    };

    const result = await new RecordExerciseAttemptUseCase(attempts).execute(input);

    expect(attempts.record).toHaveBeenCalledWith(input);
    expect(result).toBe(recorded);
  });
});
