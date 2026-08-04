import { describe, expect, it } from "vitest";
import {
  scorePlacementAttempt,
  tiersAroundLevel,
  type GradedResponse,
} from "./score-placement-attempt";

describe("scorePlacementAttempt", () => {
  it("places a skill at the highest tier where the pass threshold was met", () => {
    const responses: GradedResponse[] = [
      { skill: "grammar", cefrLevel: "a1", isCorrect: true },
      { skill: "grammar", cefrLevel: "a1", isCorrect: true },
      { skill: "grammar", cefrLevel: "a2", isCorrect: true },
      { skill: "grammar", cefrLevel: "a2", isCorrect: false },
      { skill: "grammar", cefrLevel: "b1", isCorrect: false },
      { skill: "grammar", cefrLevel: "b1", isCorrect: false },
    ];

    const result = scorePlacementAttempt(responses);

    // a1: 2/2 = 100% (pass), a2: 1/2 = 50% (fail), b1: 0/2 = 0% (fail)
    expect(result.skillLevels.grammar).toBe("a1");
  });

  it("defaults to pre_a1 for a skill with no passing tier at all", () => {
    const responses: GradedResponse[] = [
      { skill: "reading", cefrLevel: "b1", isCorrect: false },
      { skill: "reading", cefrLevel: "b1", isCorrect: false },
    ];

    expect(scorePlacementAttempt(responses).skillLevels.reading).toBe("pre_a1");
  });

  it("picks the highest passing tier even when a lower tier also failed (non-contiguous results)", () => {
    const responses: GradedResponse[] = [
      { skill: "vocabulary", cefrLevel: "a1", isCorrect: false },
      { skill: "vocabulary", cefrLevel: "a1", isCorrect: false },
      { skill: "vocabulary", cefrLevel: "a2", isCorrect: true },
      { skill: "vocabulary", cefrLevel: "a2", isCorrect: true },
    ];

    expect(scorePlacementAttempt(responses).skillLevels.vocabulary).toBe("a2");
  });

  it("computes the overall level as the lower-median across graded skills", () => {
    const responses: GradedResponse[] = [
      { skill: "grammar", cefrLevel: "b1", isCorrect: true },
      { skill: "vocabulary", cefrLevel: "b2", isCorrect: true },
      { skill: "reading", cefrLevel: "a1", isCorrect: true },
      { skill: "listening", cefrLevel: "a2", isCorrect: true },
    ];

    // levels: b1(3), b2(4), a1(1), a2(2) -> sorted [1,2,3,4] -> lower-median index floor(3/2)=1 -> value 2 -> a2
    expect(scorePlacementAttempt(responses).overallLevel).toBe("a2");
  });
});

describe("tiersAroundLevel", () => {
  it("returns the level plus tiersAround on each side", () => {
    expect(tiersAroundLevel("b1", 1)).toEqual(["a2", "b1", "b2"]);
  });

  it("clamps at the bottom of the CEFR range", () => {
    expect(tiersAroundLevel("pre_a1", 1)).toEqual(["pre_a1", "a1"]);
  });

  it("clamps at the top of the CEFR range", () => {
    expect(tiersAroundLevel("c1", 1)).toEqual(["b2", "c1"]);
  });
});
