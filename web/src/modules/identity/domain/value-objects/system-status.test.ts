import { describe, expect, it } from "vitest";
import { SystemStatus } from "./system-status";

describe("SystemStatus", () => {
  it("creates a healthy status defaulting to the current time", () => {
    const before = new Date();
    const status = SystemStatus.healthy();
    const after = new Date();

    expect(status.state).toBe("healthy");
    expect(status.isHealthy).toBe(true);
    expect(status.checkedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(status.checkedAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("creates an unhealthy status", () => {
    const status = SystemStatus.unhealthy();

    expect(status.state).toBe("unhealthy");
    expect(status.isHealthy).toBe(false);
  });

  it("accepts an explicit checkedAt for deterministic testing", () => {
    const fixedDate = new Date("2026-01-01T00:00:00.000Z");
    const status = SystemStatus.healthy(fixedDate);

    expect(status.checkedAt).toEqual(fixedDate);
  });

  it("serializes to a plain, ISO-8601 JSON shape", () => {
    const fixedDate = new Date("2026-01-01T00:00:00.000Z");
    const status = SystemStatus.unhealthy(fixedDate);

    expect(status.toJSON()).toEqual({
      state: "unhealthy",
      checkedAt: "2026-01-01T00:00:00.000Z",
    });
  });
});
