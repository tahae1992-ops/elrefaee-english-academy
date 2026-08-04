export type CefrLevel = "pre_a1" | "a1" | "a2" | "b1" | "b2" | "c1";

/** Same fixed ordering as assessment's domain service — duplicated rather than imported to keep module boundaries clean (SAD §4). */
export const CEFR_LEVEL_ORDER: readonly CefrLevel[] = ["pre_a1", "a1", "a2", "b1", "b2", "c1"];

export type CourseAccessState = "requires_placement" | "locked" | "current" | "unlocked";

export interface CourseAccess {
  state: CourseAccessState;
  /** Set only for `locked` — the CEFR level a learner needs to reach first. */
  unlocksAfterLevel?: CefrLevel;
}

/**
 * PRD §7.4 / SRS FR-04's prerequisite mastery gate, computed from the
 * learner's placement-derived `current_level` rather than a real
 * per-lesson completion history (`learning.progress_records` doesn't
 * exist yet — Phase 6 scope). A course at or below the learner's
 * assessed level is accessible; anything above is locked until the
 * learner reaches the level immediately below it.
 */
export function computeCourseAccess(
  courseLevel: CefrLevel,
  learnerLevel: CefrLevel | null,
): CourseAccess {
  if (learnerLevel === null) {
    return { state: "requires_placement" };
  }

  const courseIndex = CEFR_LEVEL_ORDER.indexOf(courseLevel);
  const learnerIndex = CEFR_LEVEL_ORDER.indexOf(learnerLevel);

  if (courseIndex === learnerIndex) {
    return { state: "current" };
  }
  if (courseIndex < learnerIndex) {
    return { state: "unlocked" };
  }
  return { state: "locked", unlocksAfterLevel: CEFR_LEVEL_ORDER[courseIndex - 1] };
}
