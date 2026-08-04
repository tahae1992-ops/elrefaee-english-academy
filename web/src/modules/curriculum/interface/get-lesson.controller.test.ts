import { describe, expect, it, vi } from "vitest";
import { handleGetLesson } from "./get-lesson.controller";
import { LessonNotFoundError } from "@/modules/curriculum/application/use-cases/get-lesson.use-case";
import type { GetLessonUseCase } from "@/modules/curriculum/application/use-cases/get-lesson.use-case";

function fakeUseCase(execute: GetLessonUseCase["execute"]): GetLessonUseCase {
  return { execute } as unknown as GetLessonUseCase;
}

describe("handleGetLesson", () => {
  it("returns 200 with the lesson on success", async () => {
    const lesson = { id: "l1" };
    const { status, body } = await handleGetLesson(fakeUseCase(vi.fn().mockResolvedValue(lesson)), "l1");

    expect(status).toBe(200);
    expect(body).toBe(lesson);
  });

  it("maps LessonNotFoundError to 404", async () => {
    const { status } = await handleGetLesson(fakeUseCase(vi.fn().mockRejectedValue(new LessonNotFoundError())), "missing");

    expect(status).toBe(404);
  });
});
