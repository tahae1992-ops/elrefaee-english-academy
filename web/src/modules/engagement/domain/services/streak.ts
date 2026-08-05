/**
 * FR-18's streak rules: "streak counted on any-day-active basis,"
 * "vacation/streak-freeze — a user-invoked or auto-granted freeze
 * prevents streak loss for a defined number of days, framed
 * non-punitively." Pure, zero-I/O (SAD §17's pattern for the FSRS
 * scheduler, applied here) — the caller loads/saves state, this
 * function only computes the transition.
 *
 * Freeze credits are auto-granted (not user-invoked/purchased — no
 * such UI exists yet, not requested for this slice): one credit every
 * `FREEZE_GRANT_INTERVAL_DAYS`-day milestone reached, framing
 * consistency itself as what earns the safety net.
 *
 * Dates are UTC calendar dates (`YYYY-MM-DD`), matching the `date`
 * column type — this codebase has no per-user timezone concept yet
 * (identity.user_profiles has no timezone field), so "today" is one
 * global day boundary, same simplification already implicit in
 * `daily_goals`.
 */

export interface StreakState {
  currentStreakDays: number;
  longestStreakDays: number;
  lastActiveDate: string;
  freezeCredits: number;
}

const FREEZE_GRANT_INTERVAL_DAYS = 7;
const MS_PER_DAY = 86_400_000;

export function toUtcDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysBetween(earlier: string, later: string): number {
  return Math.round((Date.parse(`${later}T00:00:00Z`) - Date.parse(`${earlier}T00:00:00Z`)) / MS_PER_DAY);
}

function grantFreezeIfMilestone(streakDays: number, freezeCredits: number): number {
  return streakDays > 0 && streakDays % FREEZE_GRANT_INTERVAL_DAYS === 0 ? freezeCredits + 1 : freezeCredits;
}

export function updateStreak(prior: StreakState | null, now: Date): StreakState {
  const today = toUtcDateOnly(now);

  if (!prior) {
    return { currentStreakDays: 1, longestStreakDays: 1, lastActiveDate: today, freezeCredits: 0 };
  }

  const gap = daysBetween(prior.lastActiveDate, today);

  if (gap <= 0) {
    return prior;
  }

  if (gap === 1) {
    const currentStreakDays = prior.currentStreakDays + 1;
    return {
      currentStreakDays,
      longestStreakDays: Math.max(prior.longestStreakDays, currentStreakDays),
      lastActiveDate: today,
      freezeCredits: grantFreezeIfMilestone(currentStreakDays, prior.freezeCredits),
    };
  }

  if (gap === 2 && prior.freezeCredits > 0) {
    const currentStreakDays = prior.currentStreakDays + 1;
    return {
      currentStreakDays,
      longestStreakDays: Math.max(prior.longestStreakDays, currentStreakDays),
      lastActiveDate: today,
      freezeCredits: grantFreezeIfMilestone(currentStreakDays, prior.freezeCredits - 1),
    };
  }

  return {
    currentStreakDays: 1,
    longestStreakDays: prior.longestStreakDays,
    lastActiveDate: today,
    freezeCredits: prior.freezeCredits,
  };
}
