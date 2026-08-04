import { describe, expect, it, vi } from "vitest";
import { SaveLessonPositionUseCase } from "./save-lesson-position.use-case";
import type { ProgressRepositoryPort } from "@/modules/learning/application/ports/progress-repository-port";

describe("SaveLessonPositionUseCase", () => {
  it("delegates to the repository's savePosition", async () => {
    const progress: ProgressRepositoryPort = {
      getForLesson: vi.fn(),
      listForLessons: vi.fn(),
      savePosition: vi.fn().mockResolvedValue(undefined),
      markCompleted: vi.fn(),
    };
    const position = { blockIndex: 2, blockInteractions: { 1: { done: true } } };

    await new SaveLessonPositionUseCase(progress).execute({ userId: "u1", lessonId: "l1", position });

    expect(progress.savePosition).toHaveBeenCalledWith("u1", "l1", position);
  });
});
