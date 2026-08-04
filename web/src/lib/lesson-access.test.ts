import { describe, expect, it } from "vitest";
import { computeAllUnitAccess, isUnitUnlocked, resolveResumeTarget } from "./lesson-access";
import type { PublishedLessonSummary, PublishedUnit } from "@/modules/curriculum/interface/types";
import type { LessonProgressStatus } from "@/modules/learning/interface/types";

const units: Pick<PublishedUnit, "id" | "orderIndex">[] = [
  { id: "unit-1", orderIndex: 1 },
  { id: "unit-2", orderIndex: 2 },
];

function lesson(id: string, unitId: string, orderIndex: number): PublishedLessonSummary {
  return { id, unitId, orderIndex, title: id };
}

describe("computeAllUnitAccess", () => {
  it("locks unit 2 until every lesson in unit 1 is completed", () => {
    const lessonsByUnit = new Map([
      ["unit-1", [lesson("l1", "unit-1", 1), lesson("l2", "unit-1", 2)]],
      ["unit-2", [lesson("l3", "unit-2", 1)]],
    ]);
    const progress = new Map<string, LessonProgressStatus>([
      ["l1", "completed"],
      ["l2", "not_started"],
    ]);

    const result = computeAllUnitAccess(units, lessonsByUnit, progress);

    expect(result.get("unit-1")).toBe("in_progress");
    expect(result.get("unit-2")).toBe("locked");
  });

  it("unlocks unit 2 once every lesson in unit 1 is completed", () => {
    const lessonsByUnit = new Map([
      ["unit-1", [lesson("l1", "unit-1", 1), lesson("l2", "unit-1", 2)]],
      ["unit-2", [lesson("l3", "unit-2", 1)]],
    ]);
    const progress = new Map<string, LessonProgressStatus>([
      ["l1", "completed"],
      ["l2", "completed"],
    ]);

    const result = computeAllUnitAccess(units, lessonsByUnit, progress);

    expect(result.get("unit-1")).toBe("completed");
    expect(result.get("unit-2")).toBe("available");
  });
});

describe("isUnitUnlocked", () => {
  it("is false when the course itself isn't unlocked, regardless of unit access", () => {
    expect(isUnitUnlocked("b1", "a1", "available")).toBe(false);
  });

  it("is false when the unit is locked even if the course is unlocked", () => {
    expect(isUnitUnlocked("a1", "b1", "locked")).toBe(false);
  });

  it("is true when the course is unlocked and the unit isn't locked", () => {
    expect(isUnitUnlocked("a1", "b1", "available")).toBe(true);
    expect(isUnitUnlocked("a1", "a1", "in_progress")).toBe(true);
  });
});

describe("resolveResumeTarget", () => {
  it("prioritizes an in_progress lesson over a not_started one", () => {
    const lessonsByUnit = new Map([["unit-1", [lesson("l1", "unit-1", 1), lesson("l2", "unit-1", 2)]]]);
    const progress = new Map<string, LessonProgressStatus>([["l2", "in_progress"]]);
    const unitAccess = new Map([["unit-1", "in_progress" as const]]);

    const result = resolveResumeTarget([units[0]], lessonsByUnit, progress, unitAccess);

    expect(result).toEqual({ lessonId: "l2", unitId: "unit-1" });
  });

  it("falls back to the first not_started lesson in the first unlocked unit", () => {
    const lessonsByUnit = new Map([
      ["unit-1", [lesson("l1", "unit-1", 1), lesson("l2", "unit-1", 2)]],
      ["unit-2", [lesson("l3", "unit-2", 1)]],
    ]);
    const progress = new Map<string, LessonProgressStatus>([["l1", "completed"]]);
    const unitAccess = new Map([
      ["unit-1", "in_progress" as const],
      ["unit-2", "locked" as const],
    ]);

    const result = resolveResumeTarget(units, lessonsByUnit, progress, unitAccess);

    expect(result).toEqual({ lessonId: "l2", unitId: "unit-1" });
  });

  it("returns null when every lesson is completed", () => {
    const lessonsByUnit = new Map([["unit-1", [lesson("l1", "unit-1", 1)]]]);
    const progress = new Map<string, LessonProgressStatus>([["l1", "completed"]]);
    const unitAccess = new Map([["unit-1", "completed" as const]]);

    const result = resolveResumeTarget([units[0]], lessonsByUnit, progress, unitAccess);

    expect(result).toBeNull();
  });
});
