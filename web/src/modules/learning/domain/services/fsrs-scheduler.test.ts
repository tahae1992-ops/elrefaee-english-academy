import { describe, expect, it } from "vitest";
import { retrievability, scheduleInitialReview, scheduleReview, type ReviewSchedulerState } from "@/modules/learning/domain/services/fsrs-scheduler";

const NOW = new Date("2026-08-05T00:00:00.000Z");

describe("retrievability", () => {
  it("is 1 at zero elapsed time regardless of stability", () => {
    expect(retrievability(0, 3)).toBe(1);
    expect(retrievability(0, 30)).toBe(1);
  });

  it("decreases monotonically as elapsed time grows", () => {
    const r1 = retrievability(1, 5);
    const r7 = retrievability(7, 5);
    const r30 = retrievability(30, 5);
    expect(r1).toBeGreaterThan(r7);
    expect(r7).toBeGreaterThan(r30);
  });

  it("decays slower for higher-stability items at the same elapsed time", () => {
    const lowStability = retrievability(10, 2);
    const highStability = retrievability(10, 20);
    expect(highStability).toBeGreaterThan(lowStability);
  });
});

describe("scheduleInitialReview", () => {
  it("orders resulting stability again < hard < good < easy", () => {
    const again = scheduleInitialReview("again", NOW);
    const hard = scheduleInitialReview("hard", NOW);
    const good = scheduleInitialReview("good", NOW);
    const easy = scheduleInitialReview("easy", NOW);
    expect(again.stability).toBeLessThan(hard.stability);
    expect(hard.stability).toBeLessThan(good.stability);
    expect(good.stability).toBeLessThan(easy.stability);
  });

  it("orders resulting due dates the same way (easy is due furthest out)", () => {
    const again = scheduleInitialReview("again", NOW);
    const easy = scheduleInitialReview("easy", NOW);
    expect(easy.dueAt.getTime()).toBeGreaterThan(again.dueAt.getTime());
  });

  it("schedules every rating at least one day out", () => {
    for (const rating of ["again", "hard", "good", "easy"] as const) {
      const result = scheduleInitialReview(rating, NOW);
      expect(result.dueAt.getTime() - NOW.getTime()).toBeGreaterThanOrEqual(86_400_000);
    }
  });

  it("keeps difficulty within the documented 1-10 range", () => {
    for (const rating of ["again", "hard", "good", "easy"] as const) {
      const result = scheduleInitialReview(rating, NOW);
      expect(result.difficulty).toBeGreaterThanOrEqual(1);
      expect(result.difficulty).toBeLessThanOrEqual(10);
    }
  });

  it("rates 'again' as harder (higher difficulty) than 'easy'", () => {
    const again = scheduleInitialReview("again", NOW);
    const easy = scheduleInitialReview("easy", NOW);
    expect(again.difficulty).toBeGreaterThan(easy.difficulty);
  });
});

describe("scheduleReview", () => {
  const prior: ReviewSchedulerState = { stability: 3, difficulty: 5 };
  const lastReviewedAt = new Date(NOW.getTime() - 3 * 86_400_000);

  it("grows stability on a successful ('good') recall reviewed on schedule", () => {
    const result = scheduleReview(prior, "good", NOW, lastReviewedAt);
    expect(result.stability).toBeGreaterThan(prior.stability);
  });

  it("grows stability more for 'easy' than for 'hard' given the same prior state", () => {
    const hard = scheduleReview(prior, "hard", NOW, lastReviewedAt);
    const easy = scheduleReview(prior, "easy", NOW, lastReviewedAt);
    expect(easy.stability).toBeGreaterThan(hard.stability);
  });

  it("collapses stability on a lapse ('again')", () => {
    const result = scheduleReview(prior, "again", NOW, lastReviewedAt);
    expect(result.stability).toBeLessThan(prior.stability);
  });

  it("never lets stability fall to zero or below after a lapse", () => {
    const veryLowStability: ReviewSchedulerState = { stability: 0.05, difficulty: 10 };
    const result = scheduleReview(veryLowStability, "again", NOW, lastReviewedAt);
    expect(result.stability).toBeGreaterThan(0);
  });

  it("always schedules the next review at least one day after now", () => {
    for (const rating of ["again", "hard", "good", "easy"] as const) {
      const result = scheduleReview(prior, rating, NOW, lastReviewedAt);
      expect(result.dueAt.getTime() - NOW.getTime()).toBeGreaterThanOrEqual(86_400_000);
    }
  });

  it("keeps difficulty within the documented 1-10 range even under repeated 'again' ratings", () => {
    let state: ReviewSchedulerState = prior;
    let reviewedAt = lastReviewedAt;
    for (let i = 0; i < 20; i++) {
      const result = scheduleReview(state, "again", NOW, reviewedAt);
      expect(result.difficulty).toBeLessThanOrEqual(10);
      state = result;
      reviewedAt = NOW;
    }
  });

  it("keeps difficulty within the documented 1-10 range even under repeated 'easy' ratings", () => {
    let state: ReviewSchedulerState = prior;
    let reviewedAt = lastReviewedAt;
    for (let i = 0; i < 20; i++) {
      const result = scheduleReview(state, "easy", NOW, reviewedAt);
      expect(result.difficulty).toBeGreaterThanOrEqual(1);
      state = result;
      reviewedAt = NOW;
    }
  });

  it("is a pure function: identical inputs produce identical outputs", () => {
    const a = scheduleReview(prior, "good", NOW, lastReviewedAt);
    const b = scheduleReview(prior, "good", NOW, lastReviewedAt);
    expect(a).toEqual(b);
  });
});
