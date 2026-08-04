import { describe, expect, it, vi } from "vitest";
import { handleGetCourseDetail } from "./get-course-detail.controller";
import { CourseNotFoundError } from "@/modules/curriculum/application/use-cases/get-course-detail.use-case";
import type { GetCourseDetailUseCase } from "@/modules/curriculum/application/use-cases/get-course-detail.use-case";

function fakeUseCase(execute: GetCourseDetailUseCase["execute"]): GetCourseDetailUseCase {
  return { execute } as unknown as GetCourseDetailUseCase;
}

describe("handleGetCourseDetail", () => {
  it("returns 200 with the course detail on success", async () => {
    const detail = { course: { id: "c1" }, units: [] };
    const { status, body } = await handleGetCourseDetail(fakeUseCase(vi.fn().mockResolvedValue(detail)), "c1");

    expect(status).toBe(200);
    expect(body).toBe(detail);
  });

  it("maps CourseNotFoundError to 404", async () => {
    const { status } = await handleGetCourseDetail(fakeUseCase(vi.fn().mockRejectedValue(new CourseNotFoundError())), "missing");

    expect(status).toBe(404);
  });
});
