import { createGetLessonUseCase } from "@/composition-root";
import { handleGetLesson } from "@/modules/curriculum/interface/get-lesson.controller";
import { isUnitUnlocked } from "@/lib/lesson-access";
import { resolveCourseProgress, type CourseProgressSnapshot } from "@/lib/resolve-course-progress";
import type { CefrLevel, ClientLesson } from "@/modules/curriculum/interface/types";

export type LessonAccessResult =
  | { ok: true; lesson: ClientLesson; snapshot: CourseProgressSnapshot }
  | { ok: false; status: number; body: unknown };

/**
 * SRS FR-04's AC: "access denied server-side, not just hidden in the
 * UI" — applied to lessons too. Every route that touches a specific
 * lesson's content or progress calls this first. Returns the already-
 * fetched lesson + progress snapshot so callers don't refetch.
 */
export async function gateLessonAccess(lessonId: string, userId: string, learnerLevel: CefrLevel | null): Promise<LessonAccessResult> {
  const lessonResult = await handleGetLesson(createGetLessonUseCase(), lessonId);
  if (lessonResult.status !== 200) {
    return { ok: false, status: lessonResult.status, body: lessonResult.body };
  }
  const lesson = lessonResult.body as ClientLesson;

  const snapshot = await resolveCourseProgress(lesson.courseId, userId);
  const unlocked = isUnitUnlocked(snapshot.courseDetail.course.cefrLevel, learnerLevel, snapshot.unitAccess.get(lesson.unitId));
  if (!unlocked) {
    return { ok: false, status: 403, body: { error: "FORBIDDEN", message: "This lesson isn't unlocked yet." } };
  }

  return { ok: true, lesson, snapshot };
}
