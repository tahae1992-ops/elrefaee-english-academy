import { describe, expect, it, vi } from "vitest";
import { handleScoreExercise } from "./score-exercise.controller";
import { ExerciseNotFoundError } from "@/modules/curriculum/application/use-cases/score-exercise.use-case";
import type { ScoreExerciseUseCase } from "@/modules/curriculum/application/use-cases/score-exercise.use-case";

function fakeUseCase(execute: ScoreExerciseUseCase["execute"]): ScoreExerciseUseCase {
  return { execute } as unknown as ScoreExerciseUseCase;
}

describe("handleScoreExercise", () => {
  it("returns 400 for a malformed request without calling the use case", async () => {
    const execute = vi.fn();
    const { status, body } = await handleScoreExercise(fakeUseCase(execute), "ex-1", { exerciseType: "not_a_real_type" });

    expect(status).toBe(400);
    expect(body).toEqual({ error: "VALIDATION_FAILED", message: "Invalid request." });
    expect(execute).not.toHaveBeenCalled();
  });

  it("returns 200 with the score on a valid multiple_choice submission", async () => {
    const execute = vi.fn().mockResolvedValue({ isCorrect: true, explanation: "e", correctAnswer: "b" });
    const { status, body, score, parsedResponse } = await handleScoreExercise(fakeUseCase(execute), "ex-1", {
      exerciseType: "multiple_choice",
      selectedOptionIndex: 1,
    });

    expect(status).toBe(200);
    expect(body).toEqual({ isCorrect: true, explanation: "e", correctAnswer: "b" });
    expect(score?.isCorrect).toBe(true);
    expect(parsedResponse).toEqual({ exerciseType: "multiple_choice", selectedOptionIndex: 1 });
    expect(execute).toHaveBeenCalledWith("ex-1", { exerciseType: "multiple_choice", selectedOptionIndex: 1 });
  });

  it("accepts a valid matching submission shape", async () => {
    const execute = vi.fn().mockResolvedValue({ isCorrect: false, explanation: "e", correctAnswer: [["a", "b"]] });
    const { status } = await handleScoreExercise(fakeUseCase(execute), "ex-1", {
      exerciseType: "matching",
      matchedPairs: [["a", "b"]],
    });

    expect(status).toBe(200);
  });

  it("maps ExerciseNotFoundError to 404", async () => {
    const execute = vi.fn().mockRejectedValue(new ExerciseNotFoundError());
    const { status } = await handleScoreExercise(fakeUseCase(execute), "missing", { exerciseType: "true_false", submittedAnswer: true });

    expect(status).toBe(404);
  });
});
