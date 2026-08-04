export type LessonProgressStatus = "not_started" | "in_progress" | "completed";

export type UnitAccessState = "locked" | "available" | "in_progress" | "completed";

/**
 * FR-06's default behavior ("explicit open decision on skip-ahead
 * defaulting to require-full-completion until decided") — a unit
 * beyond the first is locked until every lesson in the PREVIOUS unit
 * is completed. FR-06's own separate mastery-checkpoint exam is not
 * built (a whole Assessment-Engine integration on its own); "complete
 * all lessons" stands in as the checkpoint for this slice, disclosed
 * as a simplification.
 */
export function computeUnitAccess(
  isFirstUnit: boolean,
  previousUnitAllLessonsCompleted: boolean,
  thisUnitLessonStatuses: LessonProgressStatus[],
): UnitAccessState {
  if (!isFirstUnit && !previousUnitAllLessonsCompleted) return "locked";

  if (thisUnitLessonStatuses.length > 0 && thisUnitLessonStatuses.every((status) => status === "completed")) {
    return "completed";
  }
  if (thisUnitLessonStatuses.some((status) => status === "completed" || status === "in_progress")) {
    return "in_progress";
  }
  return "available";
}
