import { describe, expect, it, vi } from "vitest";
import { GetLessonUseCase, LessonNotFoundError } from "./get-lesson.use-case";
import type { LessonRepositoryPort, PublishedLesson } from "@/modules/curriculum/application/ports/lesson-repository-port";

function fakeLesson(): PublishedLesson {
  return {
    id: "lesson-1",
    unitId: "unit-1",
    courseId: "course-1",
    orderIndex: 1,
    title: "Meeting People",
    content: {
      title: "Meeting People",
      objective: "I can greet someone.",
      teacherNote: { objective: "o", timing: "t", commonErrors: "c", extension: "e" },
      blocks: [
        {
          type: "controlled_practice",
          instructions: "i",
          exercises: [{ itemType: "multiple_choice", prompt: "p", options: ["a", "b"], correctOptionIndex: 1 }],
        },
      ],
    },
  };
}

describe("GetLessonUseCase", () => {
  it("returns the lesson with practice answers stripped", async () => {
    const lessons: LessonRepositoryPort = { listForUnit: vi.fn(), listForCourse: vi.fn(), getById: vi.fn().mockResolvedValue(fakeLesson()) };

    const result = await new GetLessonUseCase(lessons).execute("lesson-1");

    expect(result.id).toBe("lesson-1");
    const block = result.content.blocks[0];
    expect(block.type).toBe("controlled_practice");
    if (block.type === "controlled_practice") {
      expect(block.exercises[0]).not.toHaveProperty("correctOptionIndex");
    }
  });

  it("throws LessonNotFoundError when the lesson doesn't exist", async () => {
    const lessons: LessonRepositoryPort = { listForUnit: vi.fn(), listForCourse: vi.fn(), getById: vi.fn().mockResolvedValue(null) };

    await expect(new GetLessonUseCase(lessons).execute("missing")).rejects.toThrow(LessonNotFoundError);
  });
});
