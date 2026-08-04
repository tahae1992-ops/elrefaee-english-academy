import { describe, expect, it, vi } from "vitest";
import { handleListCourses } from "./list-courses.controller";
import type { ListCoursesUseCase } from "@/modules/curriculum/application/use-cases/list-courses.use-case";

function fakeUseCase(execute: ListCoursesUseCase["execute"]): ListCoursesUseCase {
  return { execute } as unknown as ListCoursesUseCase;
}

describe("handleListCourses", () => {
  it("returns 200 with the course list on success", async () => {
    const courseList = [{ id: "c1", cefrLevel: "a1" as const, title: "Starter", description: "d", access: { state: "unlocked" as const } }];
    const execute = vi.fn().mockResolvedValue(courseList);

    const { status, body } = await handleListCourses(fakeUseCase(execute), "b1");

    expect(status).toBe(200);
    expect(body).toEqual({ courses: courseList });
    expect(execute).toHaveBeenCalledWith("b1");
  });

  it("returns 500 when the use case throws", async () => {
    const execute = vi.fn().mockRejectedValue(new Error("db down"));

    const { status, body } = await handleListCourses(fakeUseCase(execute), null);

    expect(status).toBe(500);
    expect(body).toEqual({ error: "INTERNAL", message: "Could not load courses." });
  });
});
