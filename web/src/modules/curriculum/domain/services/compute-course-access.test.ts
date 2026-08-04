import { describe, expect, it } from "vitest";
import { computeCourseAccess } from "./compute-course-access";

describe("computeCourseAccess", () => {
  it("requires placement when the learner has no assessed level", () => {
    expect(computeCourseAccess("a1", null)).toEqual({ state: "requires_placement" });
  });

  it("marks the course matching the learner's level as current", () => {
    expect(computeCourseAccess("b1", "b1")).toEqual({ state: "current" });
  });

  it("unlocks courses at or below the learner's level", () => {
    expect(computeCourseAccess("a1", "b1")).toEqual({ state: "unlocked" });
    expect(computeCourseAccess("pre_a1", "c1")).toEqual({ state: "unlocked" });
  });

  it("locks courses above the learner's level, naming the prerequisite level", () => {
    expect(computeCourseAccess("b2", "b1")).toEqual({ state: "locked", unlocksAfterLevel: "b1" });
    expect(computeCourseAccess("c1", "pre_a1")).toEqual({ state: "locked", unlocksAfterLevel: "b2" });
  });
});
