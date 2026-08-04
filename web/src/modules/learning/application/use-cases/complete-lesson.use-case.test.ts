import { describe, expect, it, vi } from "vitest";
import { CompleteLessonUseCase } from "./complete-lesson.use-case";
import type { ProgressRepositoryPort } from "@/modules/learning/application/ports/progress-repository-port";

describe("CompleteLessonUseCase", () => {
  it("delegates to the repository's markCompleted", async () => {
    const progress: ProgressRepositoryPort = {
      getForLesson: vi.fn(),
      listForLessons: vi.fn(),
      savePosition: vi.fn(),
      markCompleted: vi.fn().mockResolvedValue(undefined),
    };
    const position = { blockIndex: 4, blockInteractions: {} };

    await new CompleteLessonUseCase(progress).execute({ userId: "u1", lessonId: "l1", position });

    expect(progress.markCompleted).toHaveBeenCalledWith("u1", "l1", position);
  });
});
