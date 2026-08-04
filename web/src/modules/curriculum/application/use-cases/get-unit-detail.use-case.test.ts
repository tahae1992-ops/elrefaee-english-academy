import { describe, expect, it, vi } from "vitest";
import { GetUnitDetailUseCase, UnitNotFoundError } from "./get-unit-detail.use-case";
import type { UnitRepositoryPort } from "@/modules/curriculum/application/ports/unit-repository-port";
import type { CourseRepositoryPort } from "@/modules/curriculum/application/ports/course-repository-port";
import type { LessonRepositoryPort } from "@/modules/curriculum/application/ports/lesson-repository-port";

describe("GetUnitDetailUseCase", () => {
  it("returns the unit, its course, and lessons sorted by order_index", async () => {
    const units: UnitRepositoryPort = {
      listForCourse: vi.fn(),
      getById: vi.fn().mockResolvedValue({ id: "unit-1", courseId: "course-1", orderIndex: 1, title: "Unit 1", description: "d" }),
    };
    const courses: CourseRepositoryPort = {
      listPublished: vi.fn(),
      getById: vi.fn().mockResolvedValue({ id: "course-1", academyId: "academy-1", cefrLevel: "a1", title: "Starter", description: "d" }),
    };
    const lessons: LessonRepositoryPort = {
      listForUnit: vi.fn().mockResolvedValue([
        { id: "l2", unitId: "unit-1", orderIndex: 2, title: "Lesson 2" },
        { id: "l1", unitId: "unit-1", orderIndex: 1, title: "Lesson 1" },
      ]),
      listForCourse: vi.fn(),
      getById: vi.fn(),
    };

    const result = await new GetUnitDetailUseCase(units, courses, lessons).execute("unit-1");

    expect(result.unit.id).toBe("unit-1");
    expect(result.course.id).toBe("course-1");
    expect(result.lessons.map((l) => l.id)).toEqual(["l1", "l2"]);
  });

  it("throws UnitNotFoundError when the unit doesn't exist", async () => {
    const units: UnitRepositoryPort = { listForCourse: vi.fn(), getById: vi.fn().mockResolvedValue(null) };
    const courses: CourseRepositoryPort = { listPublished: vi.fn(), getById: vi.fn() };
    const lessons: LessonRepositoryPort = { listForUnit: vi.fn(), listForCourse: vi.fn(), getById: vi.fn() };

    await expect(new GetUnitDetailUseCase(units, courses, lessons).execute("missing")).rejects.toThrow(UnitNotFoundError);
  });
});
