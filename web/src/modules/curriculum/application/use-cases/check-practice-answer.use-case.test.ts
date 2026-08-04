import { describe, expect, it, vi } from "vitest";
import { BlockNotFoundError, CheckPracticeAnswerUseCase, ExerciseNotFoundError } from "./check-practice-answer.use-case";
import { LessonNotFoundError } from "./get-lesson.use-case";
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
      objective: "o",
      teacherNote: { objective: "o", timing: "t", commonErrors: "c", extension: "e" },
      blocks: [
        { type: "warm_up", prompt: "p", content: "c" },
        {
          type: "controlled_practice",
          instructions: "i",
          exercises: [{ itemType: "multiple_choice", prompt: "p", options: ["a", "b"], correctOptionIndex: 1 }],
        },
      ],
    },
  };
}

describe("CheckPracticeAnswerUseCase", () => {
  it("returns isCorrect true and the correct index for a right answer", async () => {
    const lessons: LessonRepositoryPort = { listForUnit: vi.fn(), listForCourse: vi.fn(), getById: vi.fn().mockResolvedValue(fakeLesson()) };

    const result = await new CheckPracticeAnswerUseCase(lessons).execute({
      lessonId: "lesson-1",
      blockIndex: 1,
      exerciseIndex: 0,
      selectedOptionIndex: 1,
    });

    expect(result).toEqual({ isCorrect: true, correctOptionIndex: 1 });
  });

  it("returns isCorrect false for a wrong answer, still revealing the correct index", async () => {
    const lessons: LessonRepositoryPort = { listForUnit: vi.fn(), listForCourse: vi.fn(), getById: vi.fn().mockResolvedValue(fakeLesson()) };

    const result = await new CheckPracticeAnswerUseCase(lessons).execute({
      lessonId: "lesson-1",
      blockIndex: 1,
      exerciseIndex: 0,
      selectedOptionIndex: 0,
    });

    expect(result).toEqual({ isCorrect: false, correctOptionIndex: 1 });
  });

  it("throws LessonNotFoundError when the lesson doesn't exist", async () => {
    const lessons: LessonRepositoryPort = { listForUnit: vi.fn(), listForCourse: vi.fn(), getById: vi.fn().mockResolvedValue(null) };

    await expect(
      new CheckPracticeAnswerUseCase(lessons).execute({ lessonId: "x", blockIndex: 0, exerciseIndex: 0, selectedOptionIndex: 0 }),
    ).rejects.toThrow(LessonNotFoundError);
  });

  it("throws BlockNotFoundError when the block index isn't a controlled_practice block", async () => {
    const lessons: LessonRepositoryPort = { listForUnit: vi.fn(), listForCourse: vi.fn(), getById: vi.fn().mockResolvedValue(fakeLesson()) };

    await expect(
      new CheckPracticeAnswerUseCase(lessons).execute({ lessonId: "lesson-1", blockIndex: 0, exerciseIndex: 0, selectedOptionIndex: 0 }),
    ).rejects.toThrow(BlockNotFoundError);
  });

  it("throws ExerciseNotFoundError when the exercise index is out of range", async () => {
    const lessons: LessonRepositoryPort = { listForUnit: vi.fn(), listForCourse: vi.fn(), getById: vi.fn().mockResolvedValue(fakeLesson()) };

    await expect(
      new CheckPracticeAnswerUseCase(lessons).execute({ lessonId: "lesson-1", blockIndex: 1, exerciseIndex: 5, selectedOptionIndex: 0 }),
    ).rejects.toThrow(ExerciseNotFoundError);
  });
});
