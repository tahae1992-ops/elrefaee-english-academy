export interface CertificationAttemptOutcome {
  passed: boolean;
  completedAt: Date;
}

export interface CertificationEligibility {
  canAttempt: boolean;
  /** Set only when canAttempt is false due to an active cooldown. */
  unlockAt: Date | null;
  /** Consecutive failures since the last pass (or ever, if never passed). */
  consecutiveFailures: number;
  /** SRS §9.6: "escalation to a human Instructor after repeated failures" -- no Instructor/Admin workflow exists yet (Phase 15), so this only drives a "contact support" message at MVP. */
  shouldEscalate: boolean;
}

/**
 * SRS §9.6's certification-exam attempt policy: unlimited practice
 * attempts don't apply here -- a failed attempt starts a cooldown
 * (blueprint-configured, e.g. 14 days) before the next attempt is
 * allowed, and repeated failures should surface an escalation path
 * rather than silently letting the learner keep retrying forever.
 * Pure function over the learner's completed-attempt history for
 * this level, not a DB read itself.
 */
export function computeCertificationEligibility(
  pastAttempts: readonly CertificationAttemptOutcome[],
  now: Date,
  cooldownDays: number,
  maxFailuresBeforeEscalation: number,
): CertificationEligibility {
  const sorted = [...pastAttempts].sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

  let consecutiveFailures = 0;
  for (const attempt of sorted) {
    if (attempt.passed) break;
    consecutiveFailures += 1;
  }

  const last = sorted[0];
  if (!last || last.passed) {
    return { canAttempt: true, unlockAt: null, consecutiveFailures, shouldEscalate: false };
  }

  const unlockAt = new Date(last.completedAt.getTime() + cooldownDays * 24 * 60 * 60 * 1000);
  const canAttempt = now >= unlockAt;

  return {
    canAttempt,
    unlockAt: canAttempt ? null : unlockAt,
    consecutiveFailures,
    shouldEscalate: consecutiveFailures >= maxFailuresBeforeEscalation,
  };
}
