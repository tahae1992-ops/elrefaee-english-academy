import { describe, expect, it, vi } from "vitest";
import { ExerciseNotFoundError, ScoreExerciseUseCase } from "./score-exercise.use-case";
import type { ExerciseRepositoryPort } from "@/modules/curriculum/application/ports/exercise-repository-port";
import type { Exercise } from "@/modules/curriculum/domain/services/exercise";

describe("ScoreExerciseUseCase", () => {
  it("scores a correct multiple_choice response", async () => {
    const exercise: Exercise = { exerciseType: "multiple_choice", prompt: "p", options: ["a", "b"], correctOptionIndex: 1, explanation: "e" };
    const exercises: ExerciseRepositoryPort = { getById: vi.fn().mockResolvedValue(exercise), listByIds: vi.fn() };

    const result = await new ScoreExerciseUseCase(exercises).execute("ex-1", { exerciseType: "multiple_choice", selectedOptionIndex: 1 });

    expect(result.isCorrect).toBe(true);
  });

  it("throws ExerciseNotFoundError when the exercise doesn't exist", async () => {
    const exercises: ExerciseRepositoryPort = { getById: vi.fn().mockResolvedValue(null), listByIds: vi.fn() };

    await expect(
      new ScoreExerciseUseCase(exercises).execute("missing", { exerciseType: "multiple_choice", selectedOptionIndex: 0 }),
    ).rejects.toThrow(ExerciseNotFoundError);
  });
});
