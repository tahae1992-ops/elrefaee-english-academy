import { describe, expect, it, vi } from "vitest";
import { EnterCourseUseCase } from "./enter-course.use-case";
import type { EnrollmentRepositoryPort } from "@/modules/learning/application/ports/enrollment-repository-port";

describe("EnterCourseUseCase", () => {
  it("creates a new enrollment when none exists", async () => {
    const created = { id: "e1", userId: "u1", academyId: "a1", currentCourseId: "c1", currentUnitId: null };
    const enrollments: EnrollmentRepositoryPort = {
      findByUserAndAcademy: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(created),
      updateCurrentCourse: vi.fn(),
      updateCurrentUnit: vi.fn(),
    };

    const result = await new EnterCourseUseCase(enrollments).execute({ userId: "u1", academyId: "a1", courseId: "c1" });

    expect(enrollments.create).toHaveBeenCalledWith({ userId: "u1", academyId: "a1", currentCourseId: "c1", placementMethod: "manual" });
    expect(result).toBe(created);
  });

  it("returns the existing enrollment unchanged when it already points at this course", async () => {
    const existing = { id: "e1", userId: "u1", academyId: "a1", currentCourseId: "c1", currentUnitId: "unit-2" };
    const enrollments: EnrollmentRepositoryPort = {
      findByUserAndAcademy: vi.fn().mockResolvedValue(existing),
      create: vi.fn(),
      updateCurrentCourse: vi.fn(),
      updateCurrentUnit: vi.fn(),
    };

    const result = await new EnterCourseUseCase(enrollments).execute({ userId: "u1", academyId: "a1", courseId: "c1" });

    expect(enrollments.updateCurrentCourse).not.toHaveBeenCalled();
    expect(result).toBe(existing);
  });

  it("switches course and resets current_unit_id when entering a different course in the same academy", async () => {
    const existing = { id: "e1", userId: "u1", academyId: "a1", currentCourseId: "old-course", currentUnitId: "unit-5" };
    const enrollments: EnrollmentRepositoryPort = {
      findByUserAndAcademy: vi.fn().mockResolvedValue(existing),
      create: vi.fn(),
      updateCurrentCourse: vi.fn().mockResolvedValue(undefined),
      updateCurrentUnit: vi.fn(),
    };

    const result = await new EnterCourseUseCase(enrollments).execute({ userId: "u1", academyId: "a1", courseId: "new-course" });

    expect(enrollments.updateCurrentCourse).toHaveBeenCalledWith("e1", "new-course");
    expect(result).toEqual({ ...existing, currentCourseId: "new-course", currentUnitId: null });
  });
});
