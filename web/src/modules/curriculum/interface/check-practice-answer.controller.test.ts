import { describe, expect, it, vi } from "vitest";
import { handleCheckPracticeAnswer } from "./check-practice-answer.controller";
import { BlockNotFoundError } from "@/modules/curriculum/application/use-cases/check-practice-answer.use-case";
import type { CheckPracticeAnswerUseCase } from "@/modules/curriculum/application/use-cases/check-practice-answer.use-case";

function fakeUseCase(execute: CheckPracticeAnswerUseCase["execute"]): CheckPracticeAnswerUseCase {
  return { execute } as unknown as CheckPracticeAnswerUseCase;
}

describe("handleCheckPracticeAnswer", () => {
  it("returns 400 for a malformed request without calling the use case", async () => {
    const execute = vi.fn();
    const { status, body } = await handleCheckPracticeAnswer(fakeUseCase(execute), "l1", { blockIndex: "not-a-number" });

    expect(status).toBe(400);
    expect(body).toEqual({ error: "VALIDATION_FAILED", message: "Invalid request." });
    expect(execute).not.toHaveBeenCalled();
  });

  it("returns 200 with the scoring result on success", async () => {
    const execute = vi.fn().mockResolvedValue({ isCorrect: true, correctOptionIndex: 1 });
    const { status, body } = await handleCheckPracticeAnswer(fakeUseCase(execute), "l1", {
      blockIndex: 2,
      exerciseIndex: 0,
      selectedOptionIndex: 1,
    });

    expect(status).toBe(200);
    expect(body).toEqual({ isCorrect: true, correctOptionIndex: 1 });
    expect(execute).toHaveBeenCalledWith({ lessonId: "l1", blockIndex: 2, exerciseIndex: 0, selectedOptionIndex: 1 });
  });

  it("maps BlockNotFoundError to 400", async () => {
    const execute = vi.fn().mockRejectedValue(new BlockNotFoundError());
    const { status } = await handleCheckPracticeAnswer(fakeUseCase(execute), "l1", {
      blockIndex: 0,
      exerciseIndex: 0,
      selectedOptionIndex: 0,
    });

    expect(status).toBe(400);
  });
});
