import { computeCourseAccess } from "@/modules/curriculum/interface/types";
import type { CefrLevel, PublishedUnit, PublishedLessonSummary } from "@/modules/curriculum/interface/types";
import { computeUnitAccess } from "@/modules/learning/interface/types";
import type { LessonProgressStatus, UnitAccessState } from "@/modules/learning/interface/types";

/**
 * Cross-module composition (curriculum structure + learning progress)
 * lives here — plain code outside both modules, importing only their
 * interface layers, same "orchestration in Route Handler/page-adjacent
 * code, not inside either module" pattern the Placement Test finalize
 * route established. Pure functions only; no DB access — callers fetch
 * via composition-root and pass the results in.
 */

export function computeAllUnitAccess(
  units: Pick<PublishedUnit, "id" | "orderIndex">[],
  lessonsByUnit: Map<string, PublishedLessonSummary[]>,
  progressByLesson: Map<string, LessonProgressStatus>,
  passedCheckpointUnitIds: ReadonlySet<string>,
): Map<string, UnitAccessState> {
  const sorted = [...units].sort((a, b) => a.orderIndex - b.orderIndex);
  const result = new Map<string, UnitAccessState>();

  let previousUnitFullyCompleted = true;
  for (let i = 0; i < sorted.length; i++) {
    const unit = sorted[i];
    const lessons = lessonsByUnit.get(unit.id) ?? [];
    const statuses = lessons.map((lesson) => progressByLesson.get(lesson.id) ?? "not_started");

    const access = computeUnitAccess(i === 0, previousUnitFullyCompleted, statuses, passedCheckpointUnitIds.has(unit.id));
    result.set(unit.id, access);

    previousUnitFullyCompleted = access === "completed";
  }

  return result;
}

/** SRS FR-04's AC, extended to units: a course must be unlocked by CEFR level AND the specific unit must not be locked. */
export function isUnitUnlocked(
  courseLevel: CefrLevel,
  learnerLevel: CefrLevel | null,
  unitAccess: UnitAccessState | undefined,
): boolean {
  const courseAccess = computeCourseAccess(courseLevel, learnerLevel);
  const courseUnlocked = courseAccess.state === "current" || courseAccess.state === "unlocked";
  return courseUnlocked && unitAccess !== undefined && unitAccess !== "locked";
}

export interface ResumeTarget {
  lessonId: string;
  unitId: string;
}

/**
 * doc 08 §4.8: "Continue CTA always resumes actual position." Priority:
 * (1) a lesson already in_progress, (2) the first not-yet-completed
 * lesson in the first unit that isn't locked, (3) null if the whole
 * course is done or has no lessons yet.
 */
export function resolveResumeTarget(
  units: Pick<PublishedUnit, "id" | "orderIndex">[],
  lessonsByUnit: Map<string, PublishedLessonSummary[]>,
  progressByLesson: Map<string, LessonProgressStatus>,
  unitAccessByUnit: Map<string, UnitAccessState>,
): ResumeTarget | null {
  const sorted = [...units].sort((a, b) => a.orderIndex - b.orderIndex);

  for (const unit of sorted) {
    const lessons = [...(lessonsByUnit.get(unit.id) ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);
    const inProgress = lessons.find((lesson) => progressByLesson.get(lesson.id) === "in_progress");
    if (inProgress) return { lessonId: inProgress.id, unitId: unit.id };
  }

  for (const unit of sorted) {
    if (unitAccessByUnit.get(unit.id) === "locked") continue;
    const lessons = [...(lessonsByUnit.get(unit.id) ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);
    const notStarted = lessons.find((lesson) => (progressByLesson.get(lesson.id) ?? "not_started") === "not_started");
    if (notStarted) return { lessonId: notStarted.id, unitId: unit.id };
  }

  return null;
}
