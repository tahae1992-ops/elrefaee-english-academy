import type { CourseRepositoryPort, PublishedCourse } from "@/modules/curriculum/application/ports/course-repository-port";
import type { UnitRepositoryPort, PublishedUnit } from "@/modules/curriculum/application/ports/unit-repository-port";

export class CourseNotFoundError extends Error {
  constructor() {
    super("Course not found.");
    this.name = "CourseNotFoundError";
  }
}

export interface CourseDetail {
  course: PublishedCourse;
  units: PublishedUnit[];
}

/** doc 08 §4.8 Course Details — course + its ordered unit list. No access/progress computation here (page-level composition, per this module's boundary with `learning`). */
export class GetCourseDetailUseCase {
  constructor(
    private readonly courses: CourseRepositoryPort,
    private readonly units: UnitRepositoryPort,
  ) {}

  async execute(courseId: string): Promise<CourseDetail> {
    const course = await this.courses.getById(courseId);
    if (!course) throw new CourseNotFoundError();

    const units = await this.units.listForCourse(courseId);
    units.sort((a, b) => a.orderIndex - b.orderIndex);

    return { course, units };
  }
}
