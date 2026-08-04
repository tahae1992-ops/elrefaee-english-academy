import type { LessonContent } from "@/modules/curriculum/domain/services/lesson-blocks";

export interface PublishedLessonSummary {
  id: string;
  unitId: string;
  orderIndex: number;
  title: string;
}

export interface PublishedLesson extends PublishedLessonSummary {
  courseId: string;
  content: LessonContent;
}

export interface LessonRepositoryPort {
  listForUnit(unitId: string): Promise<PublishedLessonSummary[]>;
  /** All lessons across every unit of a course, for resume-position resolution — one query instead of N per-unit ones. */
  listForCourse(courseId: string): Promise<PublishedLessonSummary[]>;
  getById(lessonId: string): Promise<PublishedLesson | null>;
}
