import { describe, expect, it } from "vitest";
import { decideRateLimit } from "./rate-limit-window";

describe("decideRateLimit", () => {
  it("allows the first request in a fresh bucket", () => {
    const now = new Date("2026-08-06T00:00:00Z");
    const result = decideRateLimit(null, now, 20, 10);
    expect(result).toEqual({ allowed: true, nextState: { windowStart: now, requestCount: 1 } });
  });

  it("allows and increments while under the limit within the window", () => {
    const windowStart = new Date("2026-08-06T00:00:00Z");
    const now = new Date(windowStart.getTime() + 60_000);
    const result = decideRateLimit({ windowStart, requestCount: 5 }, now, 20, 10);
    expect(result).toEqual({ allowed: true, nextState: { windowStart, requestCount: 6 } });
  });

  it("blocks once the limit is exceeded within the same window", () => {
    const windowStart = new Date("2026-08-06T00:00:00Z");
    const now = new Date(windowStart.getTime() + 60_000);
    const result = decideRateLimit({ windowStart, requestCount: 20 }, now, 20, 10);
    expect(result.allowed).toBe(false);
    expect(result.nextState.requestCount).toBe(21);
  });

  it("resets to a fresh window once the window has expired, even after being blocked", () => {
    const windowStart = new Date("2026-08-06T00:00:00Z");
    const now = new Date(windowStart.getTime() + 10 * 60_000 + 1);
    const result = decideRateLimit({ windowStart, requestCount: 999 }, now, 20, 10);
    expect(result).toEqual({ allowed: true, nextState: { windowStart: now, requestCount: 1 } });
  });

  it("treats the exact window boundary as expired", () => {
    const windowStart = new Date("2026-08-06T00:00:00Z");
    const now = new Date(windowStart.getTime() + 10 * 60_000);
    const result = decideRateLimit({ windowStart, requestCount: 5 }, now, 20, 10);
    expect(result.nextState.windowStart).toEqual(now);
    expect(result.nextState.requestCount).toBe(1);
  });
});
