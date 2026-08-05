import { describe, expect, it } from "vitest";
import { deriveReviewState } from "@/modules/learning/domain/services/review-state";

describe("deriveReviewState", () => {
  it("is 'new' whenever reviewCount is zero, regardless of stability", () => {
    expect(deriveReviewState(0, 0)).toBe("new");
    expect(deriveReviewState(0, 100)).toBe("new");
  });

  it("is 'learning' for a reviewed item with low stability", () => {
    expect(deriveReviewState(1, 0.4)).toBe("learning");
    expect(deriveReviewState(3, 6.9)).toBe("learning");
  });

  it("is 'review' once stability crosses the review threshold", () => {
    expect(deriveReviewState(4, 7)).toBe("review");
    expect(deriveReviewState(5, 29.9)).toBe("review");
  });

  it("is 'mastered' once stability crosses the mastered threshold", () => {
    expect(deriveReviewState(10, 30)).toBe("mastered");
    expect(deriveReviewState(20, 200)).toBe("mastered");
  });
});
