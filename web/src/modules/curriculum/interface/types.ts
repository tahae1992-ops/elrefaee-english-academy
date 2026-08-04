// Re-exported so UI code stays within the arch-check boundary rule
// (only a module's interface layer is importable from outside it).
export { computeCourseAccess } from "@/modules/curriculum/domain/services/compute-course-access";
export type { CefrLevel, CourseAccess, CourseAccessState } from "@/modules/curriculum/domain/services/compute-course-access";
export type { CourseListItem } from "@/modules/curriculum/application/use-cases/list-courses.use-case";
export type { PublishedCourse } from "@/modules/curriculum/application/ports/course-repository-port";
export type { PublishedUnit } from "@/modules/curriculum/application/ports/unit-repository-port";
export type { PublishedLessonSummary, PublishedLesson } from "@/modules/curriculum/application/ports/lesson-repository-port";
export { toClientLessonContent, blockRequiresInteraction } from "@/modules/curriculum/domain/services/lesson-blocks";
export type {
  ClientLessonContent,
  ClientLessonBlock,
  LessonContent,
  LessonBlock,
} from "@/modules/curriculum/domain/services/lesson-blocks";
export { CourseNotFoundError } from "@/modules/curriculum/application/use-cases/get-course-detail.use-case";
export type { CourseDetail } from "@/modules/curriculum/application/use-cases/get-course-detail.use-case";
export { UnitNotFoundError } from "@/modules/curriculum/application/use-cases/get-unit-detail.use-case";
export type { UnitDetail } from "@/modules/curriculum/application/use-cases/get-unit-detail.use-case";
export { LessonNotFoundError } from "@/modules/curriculum/application/use-cases/get-lesson.use-case";
export type { ClientLesson } from "@/modules/curriculum/application/use-cases/get-lesson.use-case";
