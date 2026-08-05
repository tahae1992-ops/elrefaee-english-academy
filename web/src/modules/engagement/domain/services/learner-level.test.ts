import { describe, expect, it } from "vitest";
import { deriveLevel } from "@/modules/engagement/domain/services/learner-level";

describe("deriveLevel", () => {
  it("is level 1 with zero XP", () => {
    expect(deriveLevel(0)).toEqual({ level: 1, xpIntoLevel: 0, xpForNextLevel: 100 });
  });

  it("stays level 1 until the level-1 XP threshold is crossed", () => {
    expect(deriveLevel(99)).toEqual({ level: 1, xpIntoLevel: 99, xpForNextLevel: 100 });
  });

  it("advances to level 2 exactly at the threshold", () => {
    expect(deriveLevel(100)).toEqual({ level: 2, xpIntoLevel: 0, xpForNextLevel: 100 });
  });

  it("computes xpIntoLevel as the remainder past the current level's threshold", () => {
    expect(deriveLevel(250)).toEqual({ level: 3, xpIntoLevel: 50, xpForNextLevel: 100 });
  });

  it("never returns a level below 1, even for negative XP", () => {
    expect(deriveLevel(-50).level).toBe(1);
  });
});
