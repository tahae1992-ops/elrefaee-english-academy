import { describe, expect, it, vi } from "vitest";
import { handleSaveLessonPosition } from "./save-lesson-position.controller";
import type { SaveLessonPositionUseCase } from "@/modules/learning/application/use-cases/save-lesson-position.use-case";

function fakeUseCase(execute: SaveLessonPositionUseCase["execute"]): SaveLessonPositionUseCase {
  return { execute } as unknown as SaveLessonPositionUseCase;
}

describe("handleSaveLessonPosition", () => {
  it("returns 400 for a malformed request without calling the use case", async () => {
    const execute = vi.fn();
    const { status } = await handleSaveLessonPosition(fakeUseCase(execute), "u1", "l1", { blockIndex: "bad" });

    expect(status).toBe(400);
    expect(execute).not.toHaveBeenCalled();
  });

  it("saves the position and returns 200", async () => {
    const execute = vi.fn().mockResolvedValue(undefined);
    const { status, body } = await handleSaveLessonPosition(fakeUseCase(execute), "u1", "l1", {
      blockIndex: 2,
      blockInteractions: { 1: { answered: true } },
    });

    expect(status).toBe(200);
    expect(body).toEqual({ saved: true });
    expect(execute).toHaveBeenCalledWith({
      userId: "u1",
      lessonId: "l1",
      position: { blockIndex: 2, blockInteractions: { 1: { answered: true } } },
    });
  });
});
