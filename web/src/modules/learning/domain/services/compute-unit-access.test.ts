import { describe, expect, it } from "vitest";
import { computeUnitAccess } from "./compute-unit-access";

describe("computeUnitAccess", () => {
  it("the first unit is always available, never locked", () => {
    expect(computeUnitAccess(true, false, [])).toBe("available");
  });

  it("locks a non-first unit when the previous unit isn't fully completed", () => {
    expect(computeUnitAccess(false, false, [])).toBe("locked");
  });

  it("unlocks a non-first unit once the previous unit is fully completed", () => {
    expect(computeUnitAccess(false, true, [])).toBe("available");
  });

  it("is completed only when every lesson in the unit is completed", () => {
    expect(computeUnitAccess(true, false, ["completed", "completed"])).toBe("completed");
    expect(computeUnitAccess(true, false, ["completed", "not_started"])).toBe("in_progress");
  });

  it("is in_progress when at least one lesson has been started but not all completed", () => {
    expect(computeUnitAccess(true, false, ["in_progress", "not_started"])).toBe("in_progress");
  });

  it("is available when no lesson in the unit has been started", () => {
    expect(computeUnitAccess(true, false, ["not_started", "not_started"])).toBe("available");
  });
});
