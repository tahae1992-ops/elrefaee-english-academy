import {
  createGetCourseDetailUseCase,
  createGetLessonProgressUseCase,
  createDrizzleLessonAdapter,
} from "@/composition-root";
import { computeAllUnitAccess, resolveResumeTarget } from "@/lib/lesson-access";
import type { CourseDetail, PublishedLessonSummary } from "@/modules/curriculum/interface/types";
import type { LessonProgressStatus, UnitAccessState } from "@/modules/learning/interface/types";

export interface CourseProgressSnapshot {
  courseDetail: CourseDetail;
  lessonsForCourse: PublishedLessonSummary[];
  lessonsByUnit: Map<string, PublishedLessonSummary[]>;
  statusByLesson: Map<string, LessonProgressStatus>;
  unitAccess: Map<string, UnitAccessState>;
  resumeTarget: { lessonId: string; unitId: string } | null;
}

/**
 * The one DB-backed composition point combining curriculum structure
 * (units/lessons) with `learning` progress for a course — used by the
 * Course Details/Unit/Lesson pages and every access-gated lesson API
 * route, so this exact composition (and its access-gating guarantee)
 * isn't duplicated with subtly different logic in each call site.
 * Three round trips total (course+units, all lessons for the course,
 * progress for those lessons) regardless of how many units/lessons
 * exist — same N+1-avoidance discipline as the Placement Test fixes.
 */
export async function resolveCourseProgress(courseId: string, userId: string): Promise<CourseProgressSnapshot> {
  const courseDetail = await createGetCourseDetailUseCase().execute(courseId);

  const lessonsForCourse = await createDrizzleLessonAdapter().listForCourse(courseId);
  const lessonIds = lessonsForCourse.map((lesson) => lesson.id);

  const progressByLesson = await createGetLessonProgressUseCase().execute(userId, lessonIds);
  const statusByLesson = new Map<string, LessonProgressStatus>(
    [...progressByLesson.entries()].map(([lessonId, progress]) => [lessonId, progress.status]),
  );

  const lessonsByUnit = new Map<string, PublishedLessonSummary[]>();
  for (const lesson of lessonsForCourse) {
    const existing = lessonsByUnit.get(lesson.unitId) ?? [];
    existing.push(lesson);
    lessonsByUnit.set(lesson.unitId, existing);
  }

  const unitAccess = computeAllUnitAccess(courseDetail.units, lessonsByUnit, statusByLesson);
  const resumeTarget = resolveResumeTarget(courseDetail.units, lessonsByUnit, statusByLesson, unitAccess);

  return { courseDetail, lessonsForCourse, lessonsByUnit, statusByLesson, unitAccess, resumeTarget };
}
