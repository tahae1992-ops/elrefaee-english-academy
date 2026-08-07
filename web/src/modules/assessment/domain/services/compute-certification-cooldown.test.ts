import { describe, expect, it } from "vitest";
import { computeCertificationEligibility, type CertificationAttemptOutcome } from "./compute-certification-cooldown";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("computeCertificationEligibility", () => {
  it("allows an attempt when there is no history", () => {
    const result = computeCertificationEligibility([], new Date("2026-08-06"), 14, 3);
    expect(result).toEqual({ canAttempt: true, unlockAt: null, consecutiveFailures: 0, shouldEscalate: false });
  });

  it("allows an attempt when the most recent one passed", () => {
    const history: CertificationAttemptOutcome[] = [{ passed: true, completedAt: new Date("2026-08-01") }];
    const result = computeCertificationEligibility(history, new Date("2026-08-02"), 14, 3);
    expect(result.canAttempt).toBe(true);
    expect(result.unlockAt).toBeNull();
  });

  it("blocks an attempt within the cooldown window after a failure", () => {
    const failedAt = new Date("2026-08-01T00:00:00Z");
    const now = new Date(failedAt.getTime() + 5 * DAY_MS);
    const history: CertificationAttemptOutcome[] = [{ passed: false, completedAt: failedAt }];

    const result = computeCertificationEligibility(history, now, 14, 3);

    expect(result.canAttempt).toBe(false);
    expect(result.unlockAt).toEqual(new Date(failedAt.getTime() + 14 * DAY_MS));
  });

  it("allows an attempt once the cooldown has fully elapsed", () => {
    const failedAt = new Date("2026-08-01T00:00:00Z");
    const now = new Date(failedAt.getTime() + 14 * DAY_MS);
    const history: CertificationAttemptOutcome[] = [{ passed: false, completedAt: failedAt }];

    const result = computeCertificationEligibility(history, now, 14, 3);

    expect(result.canAttempt).toBe(true);
    expect(result.unlockAt).toBeNull();
  });

  it("counts only consecutive failures since the last pass", () => {
    const history: CertificationAttemptOutcome[] = [
      { passed: false, completedAt: new Date("2026-08-01") },
      { passed: false, completedAt: new Date("2026-07-15") },
      { passed: true, completedAt: new Date("2026-07-01") },
      { passed: false, completedAt: new Date("2026-06-01") },
    ];

    const result = computeCertificationEligibility(history, new Date("2026-08-20"), 14, 3);

    expect(result.consecutiveFailures).toBe(2);
  });

  it("flags escalation once consecutive failures reach the configured threshold", () => {
    const history: CertificationAttemptOutcome[] = [
      { passed: false, completedAt: new Date("2026-08-01") },
      { passed: false, completedAt: new Date("2026-07-15") },
      { passed: false, completedAt: new Date("2026-07-01") },
    ];

    const result = computeCertificationEligibility(history, new Date("2026-09-01"), 14, 3);

    expect(result.shouldEscalate).toBe(true);
  });

  it("does not flag escalation below the threshold", () => {
    const history: CertificationAttemptOutcome[] = [{ passed: false, completedAt: new Date("2026-08-01") }];
    const result = computeCertificationEligibility(history, new Date("2026-09-01"), 14, 3);
    expect(result.shouldEscalate).toBe(false);
  });
});
