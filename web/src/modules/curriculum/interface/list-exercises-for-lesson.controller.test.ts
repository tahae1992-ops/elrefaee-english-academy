import { describe, expect, it, vi } from "vitest";
import { handleListExercisesForLesson } from "./list-exercises-for-lesson.controller";
import { LessonNotFoundError } from "@/modules/curriculum/application/use-cases/get-lesson.use-case";
import type { ListExercisesForLessonUseCase } from "@/modules/curriculum/application/use-cases/list-exercises-for-lesson.use-case";

function fakeUseCase(execute: ListExercisesForLessonUseCase["execute"]): ListExercisesForLessonUseCase {
  return { execute } as unknown as ListExercisesForLessonUseCase;
}

describe("handleListExercisesForLesson", () => {
  it("returns 200 with the exercise list on success", async () => {
    const list = [{ id: "ex-1", exercise: { exerciseType: "true_false" as const, prompt: "p" } }];
    const { status, body } = await handleListExercisesForLesson(fakeUseCase(vi.fn().mockResolvedValue(list)), "lesson-1");

    expect(status).toBe(200);
    expect(body).toEqual({ exercises: list });
  });

  it("maps LessonNotFoundError to 404", async () => {
    const { status } = await handleListExercisesForLesson(fakeUseCase(vi.fn().mockRejectedValue(new LessonNotFoundError())), "missing");

    expect(status).toBe(404);
  });
});
