import { describe, expect, it, vi } from "vitest";
import { ListCoursesUseCase } from "./list-courses.use-case";
import type { CourseRepositoryPort, PublishedCourse } from "@/modules/curriculum/application/ports/course-repository-port";

function fakeCourse(overrides: Partial<PublishedCourse> = {}): PublishedCourse {
  return { id: "course-1", academyId: "academy-1", cefrLevel: "a1", title: "Starter", description: "desc", ...overrides };
}

describe("ListCoursesUseCase", () => {
  it("orders courses by CEFR level regardless of repository order", async () => {
    const courses: CourseRepositoryPort = {
      listPublished: vi.fn().mockResolvedValue([
        fakeCourse({ id: "c1", cefrLevel: "b1" }),
        fakeCourse({ id: "c2", cefrLevel: "pre_a1" }),
        fakeCourse({ id: "c3", cefrLevel: "a1" }),
      ]),
      getById: vi.fn(),
    };

    const result = await new ListCoursesUseCase(courses).execute("b1");

    expect(result.map((c) => c.id)).toEqual(["c2", "c3", "c1"]);
  });

  it("attaches the correct access state for each course given the learner's level", async () => {
    const courses: CourseRepositoryPort = {
      listPublished: vi.fn().mockResolvedValue([
        fakeCourse({ id: "below", cefrLevel: "a1" }),
        fakeCourse({ id: "same", cefrLevel: "a2" }),
        fakeCourse({ id: "above", cefrLevel: "b1" }),
      ]),
      getById: vi.fn(),
    };

    const result = await new ListCoursesUseCase(courses).execute("a2");

    expect(result.find((c) => c.id === "below")?.access).toEqual({ state: "unlocked" });
    expect(result.find((c) => c.id === "same")?.access).toEqual({ state: "current" });
    expect(result.find((c) => c.id === "above")?.access).toEqual({ state: "locked", unlocksAfterLevel: "a2" });
  });

  it("marks every course as requiring placement when the learner has no level yet", async () => {
    const courses: CourseRepositoryPort = {
      listPublished: vi.fn().mockResolvedValue([fakeCourse()]),
      getById: vi.fn(),
    };

    const result = await new ListCoursesUseCase(courses).execute(null);

    expect(result[0].access).toEqual({ state: "requires_placement" });
  });
});
