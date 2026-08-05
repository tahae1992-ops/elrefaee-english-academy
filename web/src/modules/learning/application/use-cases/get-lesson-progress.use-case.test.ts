import { describe, expect, it, vi } from "vitest";
import { GetLessonProgressUseCase } from "./get-lesson-progress.use-case";
import type { ProgressRepositoryPort } from "@/modules/learning/application/ports/progress-repository-port";

describe("GetLessonProgressUseCase", () => {
  it("fills in a not_started default for lessons with no progress row", async () => {
    const progress: ProgressRepositoryPort = {
      getForLesson: vi.fn(),
      listForLessons: vi.fn().mockResolvedValue([
        { lessonId: "l1", status: "completed", lastPosition: { blockIndex: 4, blockInteractions: {} }, completedAt: new Date() },
      ]),
      savePosition: vi.fn(),
      markCompleted: vi.fn(),
      countCompletedForUser: vi.fn(),
    };

    const result = await new GetLessonProgressUseCase(progress).execute("u1", ["l1", "l2"]);

    expect(result.get("l1")?.status).toBe("completed");
    expect(result.get("l2")).toEqual({
      lessonId: "l2",
      status: "not_started",
      lastPosition: { blockIndex: 0, blockInteractions: {} },
      completedAt: null,
    });
  });
});
