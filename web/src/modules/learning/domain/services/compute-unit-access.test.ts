import { describe, expect, it } from "vitest";
import { computeUnitAccess } from "./compute-unit-access";

describe("computeUnitAccess", () => {
  it("the first unit is always available, never locked", () => {
    expect(computeUnitAccess(true, false, [], false)).toBe("available");
  });

  it("locks a non-first unit when the previous unit isn't fully completed", () => {
    expect(computeUnitAccess(false, false, [], false)).toBe("locked");
  });

  it("unlocks a non-first unit once the previous unit is fully completed", () => {
    expect(computeUnitAccess(false, true, [], false)).toBe("available");
  });

  it("is checkpoint_available once every lesson is completed but the checkpoint hasn't been passed yet", () => {
    expect(computeUnitAccess(true, false, ["completed", "completed"], false)).toBe("checkpoint_available");
  });

  it("is completed only once every lesson is completed AND the checkpoint has been passed", () => {
    expect(computeUnitAccess(true, false, ["completed", "completed"], true)).toBe("completed");
  });

  it("is in_progress when not every lesson is completed yet, regardless of checkpoint status", () => {
    expect(computeUnitAccess(true, false, ["completed", "not_started"], false)).toBe("in_progress");
  });

  it("is in_progress when at least one lesson has been started but not all completed", () => {
    expect(computeUnitAccess(true, false, ["in_progress", "not_started"], false)).toBe("in_progress");
  });

  it("is available when no lesson in the unit has been started", () => {
    expect(computeUnitAccess(true, false, ["not_started", "not_started"], false)).toBe("available");
  });

  it("a checkpoint pass flag is meaningless (and ignored) if lessons aren't all done", () => {
    expect(computeUnitAccess(true, false, ["not_started"], true)).toBe("available");
  });
});
