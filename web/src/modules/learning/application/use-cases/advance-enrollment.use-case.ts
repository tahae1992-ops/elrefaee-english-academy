import type { EnrollmentRepositoryPort } from "@/modules/learning/application/ports/enrollment-repository-port";

export class EnrollmentNotFoundError extends Error {
  constructor() {
    super("Enrollment not found.");
    this.name = "EnrollmentNotFoundError";
  }
}

/** Called by the Route Handler after a unit's last lesson is completed, to point `current_unit_id` at the next unit — so the Course Details "Continue" CTA resumes there (doc 08 §4.8's "always resumes actual position" rule). */
export class AdvanceEnrollmentUseCase {
  constructor(private readonly enrollments: EnrollmentRepositoryPort) {}

  async execute(userId: string, academyId: string, nextUnitId: string): Promise<void> {
    const enrollment = await this.enrollments.findByUserAndAcademy(userId, academyId);
    if (!enrollment) throw new EnrollmentNotFoundError();

    await this.enrollments.updateCurrentUnit(enrollment.id, nextUnitId);
  }
}
