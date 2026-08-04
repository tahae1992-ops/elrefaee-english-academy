import { describe, expect, it, vi } from "vitest";
import { GetLessonUseCase, LessonNotFoundError } from "./get-lesson.use-case";
import type { LessonRepositoryPort, PublishedLesson } from "@/modules/curriculum/application/ports/lesson-repository-port";
import type { ExerciseRepositoryPort } from "@/modules/curriculum/application/ports/exercise-repository-port";
import type { Exercise } from "@/modules/curriculum/domain/services/exercise";

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
      blocks: [{ type: "controlled_practice", instructions: "i", exerciseIds: ["ex-1"] }],
    },
  };
}

describe("GetLessonUseCase", () => {
  it("resolves exerciseIds into client-safe exercises with the answer key stripped", async () => {
    const lessons: LessonRepositoryPort = { listForUnit: vi.fn(), listForCourse: vi.fn(), getById: vi.fn().mockResolvedValue(fakeLesson()) };
    const exercise: Exercise = { exerciseType: "multiple_choice", prompt: "p", options: ["a", "b"], correctOptionIndex: 1, explanation: "e" };
    const exercises: ExerciseRepositoryPort = {
      getById: vi.fn(),
      listByIds: vi.fn().mockResolvedValue(new Map([["ex-1", exercise]])),
    };

    const result = await new GetLessonUseCase(lessons, exercises).execute("lesson-1");

    expect(result.id).toBe("lesson-1");
    const block = result.content.blocks[0];
    expect(block.type).toBe("controlled_practice");
    if (block.type === "controlled_practice") {
      expect(block.exercises).toEqual([{ id: "ex-1", exercise: { exerciseType: "multiple_choice", prompt: "p", options: ["a", "b"] } }]);
    }
  });

  it("throws LessonNotFoundError when the lesson doesn't exist", async () => {
    const lessons: LessonRepositoryPort = { listForUnit: vi.fn(), listForCourse: vi.fn(), getById: vi.fn().mockResolvedValue(null) };
    const exercises: ExerciseRepositoryPort = { getById: vi.fn(), listByIds: vi.fn() };

    await expect(new GetLessonUseCase(lessons, exercises).execute("missing")).rejects.toThrow(LessonNotFoundError);
  });
});
