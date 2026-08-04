import type { UnitRepositoryPort, PublishedUnit } from "@/modules/curriculum/application/ports/unit-repository-port";
import type { LessonRepositoryPort, PublishedLessonSummary } from "@/modules/curriculum/application/ports/lesson-repository-port";
import type { CourseRepositoryPort, PublishedCourse } from "@/modules/curriculum/application/ports/course-repository-port";

export class UnitNotFoundError extends Error {
  constructor() {
    super("Unit not found.");
    this.name = "UnitNotFoundError";
  }
}

export interface UnitDetail {
  unit: PublishedUnit;
  course: PublishedCourse;
  lessons: PublishedLessonSummary[];
}

/** doc 08 §4.9 Unit — unit + its parent course + its ordered lesson list. */
export class GetUnitDetailUseCase {
  constructor(
    private readonly units: UnitRepositoryPort,
    private readonly courses: CourseRepositoryPort,
    private readonly lessons: LessonRepositoryPort,
  ) {}

  async execute(unitId: string): Promise<UnitDetail> {
    const unit = await this.units.getById(unitId);
    if (!unit) throw new UnitNotFoundError();

    const [course, lessons] = await Promise.all([
      this.courses.getById(unit.courseId),
      this.lessons.listForUnit(unitId),
    ]);
    if (!course) throw new UnitNotFoundError();

    lessons.sort((a, b) => a.orderIndex - b.orderIndex);

    return { unit, course, lessons };
  }
}
