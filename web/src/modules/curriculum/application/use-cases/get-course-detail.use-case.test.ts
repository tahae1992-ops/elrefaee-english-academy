import { describe, expect, it, vi } from "vitest";
import { CourseNotFoundError, GetCourseDetailUseCase } from "./get-course-detail.use-case";
import type { CourseRepositoryPort } from "@/modules/curriculum/application/ports/course-repository-port";
import type { UnitRepositoryPort } from "@/modules/curriculum/application/ports/unit-repository-port";

describe("GetCourseDetailUseCase", () => {
  it("returns the course with units sorted by order_index", async () => {
    const courses: CourseRepositoryPort = {
      listPublished: vi.fn(),
      getById: vi.fn().mockResolvedValue({ id: "course-1", academyId: "academy-1", cefrLevel: "a1", title: "Starter", description: "d" }),
    };
    const units: UnitRepositoryPort = {
      listForCourse: vi.fn().mockResolvedValue([
        { id: "u2", courseId: "course-1", orderIndex: 2, title: "Daily Routines", description: "d" },
        { id: "u1", courseId: "course-1", orderIndex: 1, title: "Everyday Introductions", description: "d" },
      ]),
      getById: vi.fn(),
    };

    const result = await new GetCourseDetailUseCase(courses, units).execute("course-1");

    expect(result.course.id).toBe("course-1");
    expect(result.units.map((u) => u.id)).toEqual(["u1", "u2"]);
  });

  it("throws CourseNotFoundError when the course doesn't exist", async () => {
    const courses: CourseRepositoryPort = { listPublished: vi.fn(), getById: vi.fn().mockResolvedValue(null) };
    const units: UnitRepositoryPort = { listForCourse: vi.fn(), getById: vi.fn() };

    await expect(new GetCourseDetailUseCase(courses, units).execute("missing")).rejects.toThrow(CourseNotFoundError);
  });
});
