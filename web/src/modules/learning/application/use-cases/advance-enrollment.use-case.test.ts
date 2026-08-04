import { describe, expect, it, vi } from "vitest";
import { AdvanceEnrollmentUseCase, EnrollmentNotFoundError } from "./advance-enrollment.use-case";
import type { EnrollmentRepositoryPort } from "@/modules/learning/application/ports/enrollment-repository-port";

describe("AdvanceEnrollmentUseCase", () => {
  it("updates the enrollment's current_unit_id", async () => {
    const enrollment = { id: "e1", userId: "u1", academyId: "a1", currentCourseId: "c1", currentUnitId: "unit-1" };
    const enrollments: EnrollmentRepositoryPort = {
      findByUserAndAcademy: vi.fn().mockResolvedValue(enrollment),
      create: vi.fn(),
      updateCurrentCourse: vi.fn(),
      updateCurrentUnit: vi.fn().mockResolvedValue(undefined),
    };

    await new AdvanceEnrollmentUseCase(enrollments).execute("u1", "a1", "unit-2");

    expect(enrollments.updateCurrentUnit).toHaveBeenCalledWith("e1", "unit-2");
  });

  it("throws EnrollmentNotFoundError when no enrollment exists", async () => {
    const enrollments: EnrollmentRepositoryPort = {
      findByUserAndAcademy: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      updateCurrentCourse: vi.fn(),
      updateCurrentUnit: vi.fn(),
    };

    await expect(new AdvanceEnrollmentUseCase(enrollments).execute("u1", "a1", "unit-2")).rejects.toThrow(EnrollmentNotFoundError);
  });
});
