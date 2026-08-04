import type { CourseRepositoryPort } from "@/modules/curriculum/application/ports/course-repository-port";
import {
  CEFR_LEVEL_ORDER,
  computeCourseAccess,
  type CefrLevel,
  type CourseAccess,
} from "@/modules/curriculum/domain/services/compute-course-access";

export interface CourseListItem {
  id: string;
  cefrLevel: CefrLevel;
  title: string;
  description: string;
  access: CourseAccess;
}

/**
 * Doc 08 §4.7's Course Catalog read model — the learner's CEFR level
 * (from the Placement Test slice) is passed in rather than looked up
 * here, so this use-case has no dependency on the identity module
 * (SAD §4's module-boundary rule; same pattern as
 * assessment/finalize-attempt's cross-module write living in the
 * Route Handler, not either module's own code).
 */
export class ListCoursesUseCase {
  constructor(private readonly courses: CourseRepositoryPort) {}

  async execute(learnerLevel: CefrLevel | null): Promise<CourseListItem[]> {
    const published = await this.courses.listPublished();

    return [...published]
      .sort((a, b) => CEFR_LEVEL_ORDER.indexOf(a.cefrLevel) - CEFR_LEVEL_ORDER.indexOf(b.cefrLevel))
      .map((course) => ({
        ...course,
        access: computeCourseAccess(course.cefrLevel, learnerLevel),
      }));
  }
}
