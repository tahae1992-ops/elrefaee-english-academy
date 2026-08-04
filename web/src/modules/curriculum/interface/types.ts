// Re-exported so UI code stays within the arch-check boundary rule
// (only a module's interface layer is importable from outside it).
export type { CefrLevel, CourseAccess, CourseAccessState } from "@/modules/curriculum/domain/services/compute-course-access";
export type { CourseListItem } from "@/modules/curriculum/application/use-cases/list-courses.use-case";
