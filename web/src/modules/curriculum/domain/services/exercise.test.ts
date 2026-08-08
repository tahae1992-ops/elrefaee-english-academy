import { describe, expect, it } from "vitest";
import { toClientExercise } from "./exercise";
import type {
  FillInBlankExercise,
  MatchingExercise,
  MultipleChoiceExercise,
  OrderingExercise,
  SentenceBuildingExercise,
  ShortAnswerExercise,
  TrueFalseExercise,
} from "./exercise";

/**
 * Phase 18's coverage push (SRS §3/§14.1): this function is the one
 * guarantee that an exercise's answer key never reaches the client
 * (same rule as assessment.item_bank.scoring_key, per its own
 * comment) -- before this test, 6 of its 7 exercise-type branches
 * had zero coverage, so a bug leaking `correctOptionIndex`, `pairs`,
 * `items`, `correctAnswer`, `acceptedAnswers`, or `chunks` into a
 * client response would have gone undetected.
 */
describe("toClientExercise", () => {
  it("multiple_choice: strips correctOptionIndex", () => {
    const exercise: MultipleChoiceExercise = {
      exerciseType: "multiple_choice",
      prompt: "Pick one",
      explanation: "because",
      options: ["a", "b"],
      correctOptionIndex: 1,
    };
    const client = toClientExercise(exercise);
    expect(client).toEqual({ exerciseType: "multiple_choice", prompt: "Pick one", options: ["a", "b"] });
    expect(client).not.toHaveProperty("correctOptionIndex");
    expect(client).not.toHaveProperty("explanation");
  });

  it("fill_in_blank: strips acceptedAnswers", () => {
    const exercise: FillInBlankExercise = {
      exerciseType: "fill_in_blank",
      prompt: "The sky is ___",
      explanation: "because",
      acceptedAnswers: ["blue"],
    };
    const client = toClientExercise(exercise);
    expect(client).toEqual({ exerciseType: "fill_in_blank", prompt: "The sky is ___" });
    expect(client).not.toHaveProperty("acceptedAnswers");
  });

  it("matching: strips the correct pairing, shuffles left/right independently", () => {
    const exercise: MatchingExercise = {
      exerciseType: "matching",
      prompt: "Match them",
      explanation: "because",
      pairs: [
        ["cat", "gato"],
        ["dog", "perro"],
        ["bird", "pájaro"],
      ],
    };
    const client = toClientExercise(exercise);
    expect(client.exerciseType).toBe("matching");
    expect(client).not.toHaveProperty("pairs");
    if (client.exerciseType !== "matching") throw new Error("unreachable");
    expect(client.leftItems.sort()).toEqual(["cat", "dog", "bird"].sort());
    expect(client.rightItems.sort()).toEqual(["gato", "perro", "pájaro"].sort());
  });

  it("ordering: strips the correct order, returns a shuffled copy", () => {
    const exercise: OrderingExercise = {
      exerciseType: "ordering",
      prompt: "Put in order",
      explanation: "because",
      items: ["first", "second", "third"],
    };
    const client = toClientExercise(exercise);
    expect(client.exerciseType).toBe("ordering");
    expect(client).not.toHaveProperty("items");
    if (client.exerciseType !== "ordering") throw new Error("unreachable");
    expect(client.shuffledItems.sort()).toEqual(["first", "second", "third"]);
  });

  it("true_false: strips correctAnswer", () => {
    const exercise: TrueFalseExercise = {
      exerciseType: "true_false",
      prompt: "The earth is flat",
      explanation: "because",
      correctAnswer: false,
    };
    const client = toClientExercise(exercise);
    expect(client).toEqual({ exerciseType: "true_false", prompt: "The earth is flat" });
    expect(client).not.toHaveProperty("correctAnswer");
  });

  it("short_answer: strips acceptedAnswers", () => {
    const exercise: ShortAnswerExercise = {
      exerciseType: "short_answer",
      prompt: "Capital of France?",
      explanation: "because",
      acceptedAnswers: ["Paris", "paris"],
    };
    const client = toClientExercise(exercise);
    expect(client).toEqual({ exerciseType: "short_answer", prompt: "Capital of France?" });
    expect(client).not.toHaveProperty("acceptedAnswers");
  });

  it("sentence_building: strips the correct chunk order, returns a shuffled copy", () => {
    const exercise: SentenceBuildingExercise = {
      exerciseType: "sentence_building",
      prompt: "Build the sentence",
      explanation: "because",
      chunks: ["I", "like", "coffee"],
    };
    const client = toClientExercise(exercise);
    expect(client.exerciseType).toBe("sentence_building");
    expect(client).not.toHaveProperty("chunks");
    if (client.exerciseType !== "sentence_building") throw new Error("unreachable");
    expect(client.shuffledChunks.sort()).toEqual(["I", "coffee", "like"]);
  });
});
