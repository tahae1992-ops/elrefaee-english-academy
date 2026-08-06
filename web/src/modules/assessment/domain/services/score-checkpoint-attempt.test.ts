import { describe, expect, it } from "vitest";
import { scoreCheckpointAttempt, type CheckpointGradedResponse } from "./score-checkpoint-attempt";

describe("scoreCheckpointAttempt", () => {
  it("passes when the score meets the threshold", () => {
    const responses: CheckpointGradedResponse[] = [
      { skill: "grammar", isCorrect: true },
      { skill: "grammar", isCorrect: true },
      { skill: "grammar", isCorrect: true },
      { skill: "vocabulary", isCorrect: false },
    ];

    const result = scoreCheckpointAttempt(responses, 0.7);

    expect(result.scorePercent).toBe(75);
    expect(result.passed).toBe(true);
  });

  it("fails when the score is below the threshold", () => {
    const responses: CheckpointGradedResponse[] = [
      { skill: "grammar", isCorrect: true },
      { skill: "grammar", isCorrect: false },
      { skill: "vocabulary", isCorrect: false },
    ];

    const result = scoreCheckpointAttempt(responses, 0.7);

    expect(result.scorePercent).toBe(33);
    expect(result.passed).toBe(false);
  });

  it("breaks the score down per skill, so a failing skill can be surfaced", () => {
    const responses: CheckpointGradedResponse[] = [
      { skill: "grammar", isCorrect: true },
      { skill: "grammar", isCorrect: true },
      { skill: "vocabulary", isCorrect: false },
      { skill: "vocabulary", isCorrect: false },
    ];

    const result = scoreCheckpointAttempt(responses, 0.7);

    expect(result.skillBreakdown).toEqual({
      grammar: { correct: 2, total: 2 },
      vocabulary: { correct: 0, total: 2 },
    });
  });

  it("never passes an attempt with zero responses", () => {
    expect(scoreCheckpointAttempt([], 0.7)).toEqual({ scorePercent: 0, passed: false, skillBreakdown: {} });
  });

  it("passes exactly at the threshold (inclusive)", () => {
    const responses: CheckpointGradedResponse[] = [
      { skill: "grammar", isCorrect: true },
      { skill: "grammar", isCorrect: true },
      { skill: "grammar", isCorrect: true },
      { skill: "grammar", isCorrect: false },
      { skill: "grammar", isCorrect: false },
      { skill: "grammar", isCorrect: false },
      { skill: "grammar", isCorrect: false },
      { skill: "grammar", isCorrect: false },
      { skill: "grammar", isCorrect: false },
      { skill: "grammar", isCorrect: false },
    ];

    // 3/10 = 30% correct fails a 70% pass threshold -- sanity check the boundary the other direction too.
    expect(scoreCheckpointAttempt(responses, 0.3).passed).toBe(true);
    expect(scoreCheckpointAttempt(responses, 0.31).passed).toBe(false);
  });
});
