export interface Enrollment {
  id: string;
  userId: string;
  academyId: string;
  currentCourseId: string;
  currentUnitId: string | null;
}

export interface EnrollmentRepositoryPort {
  findByUserAndAcademy(userId: string, academyId: string): Promise<Enrollment | null>;
  create(input: {
    userId: string;
    academyId: string;
    currentCourseId: string;
    placementMethod: "self_assessment" | "adaptive_test" | "manual";
  }): Promise<Enrollment>;
  /** Also clears `current_unit_id` — switching courses starts fresh. */
  updateCurrentCourse(enrollmentId: string, courseId: string): Promise<void>;
  updateCurrentUnit(enrollmentId: string, unitId: string): Promise<void>;
}
