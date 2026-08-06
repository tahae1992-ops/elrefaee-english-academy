export type LessonProgressStatus = "not_started" | "in_progress" | "completed";

export type UnitAccessState = "locked" | "available" | "in_progress" | "checkpoint_available" | "completed";

/**
 * FR-06's mastery gate, now real (Assessment Engine's Unit Checkpoint
 * slice) — a unit only counts as fully "completed" once every lesson
 * is done AND the unit's checkpoint quiz has been passed. All lessons
 * done but no passing checkpoint attempt yet is its own distinct state
 * (`checkpoint_available`) rather than being folded into "completed" —
 * the UI needs to tell those two apart (one shows an actionable
 * "take your checkpoint" card, the other shows the finished state).
 * A unit beyond the first stays locked until the PREVIOUS unit reaches
 * that same fully-"completed" state (SRS FR-06's default "require-full-
 * completion" skip-ahead behavior, restated here for the checkpoint).
 */
export function computeUnitAccess(
  isFirstUnit: boolean,
  previousUnitFullyCompleted: boolean,
  thisUnitLessonStatuses: LessonProgressStatus[],
  thisUnitCheckpointPassed: boolean,
): UnitAccessState {
  if (!isFirstUnit && !previousUnitFullyCompleted) return "locked";

  const allLessonsCompleted =
    thisUnitLessonStatuses.length > 0 && thisUnitLessonStatuses.every((status) => status === "completed");

  if (allLessonsCompleted && thisUnitCheckpointPassed) return "completed";
  if (allLessonsCompleted) return "checkpoint_available";
  if (thisUnitLessonStatuses.some((status) => status === "completed" || status === "in_progress")) return "in_progress";
  return "available";
}
