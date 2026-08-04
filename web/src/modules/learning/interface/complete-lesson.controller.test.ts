import { describe, expect, it, vi } from "vitest";
import { handleCompleteLesson } from "./complete-lesson.controller";
import type { CompleteLessonUseCase } from "@/modules/learning/application/use-cases/complete-lesson.use-case";

function fakeUseCase(execute: CompleteLessonUseCase["execute"]): CompleteLessonUseCase {
  return { execute } as unknown as CompleteLessonUseCase;
}

describe("handleCompleteLesson", () => {
  it("returns 400 for a malformed request without calling the use case", async () => {
    const execute = vi.fn();
    const { status } = await handleCompleteLesson(fakeUseCase(execute), "u1", "l1", {});

    expect(status).toBe(400);
    expect(execute).not.toHaveBeenCalled();
  });

  it("marks the lesson complete and returns 200", async () => {
    const execute = vi.fn().mockResolvedValue(undefined);
    const { status, body } = await handleCompleteLesson(fakeUseCase(execute), "u1", "l1", { blockIndex: 4, blockInteractions: {} });

    expect(status).toBe(200);
    expect(body).toEqual({ completed: true });
    expect(execute).toHaveBeenCalledWith({ userId: "u1", lessonId: "l1", position: { blockIndex: 4, blockInteractions: {} } });
  });
});
