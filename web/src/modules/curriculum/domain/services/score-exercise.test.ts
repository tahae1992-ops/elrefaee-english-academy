import { describe, expect, it } from "vitest";
import { ExerciseResponseTypeMismatchError, scoreExercise } from "./score-exercise";
import type { Exercise } from "./exercise";

describe("scoreExercise", () => {
  it("scores multiple_choice by exact index match", () => {
    const exercise: Exercise = { exerciseType: "multiple_choice", prompt: "p", options: ["a", "b", "c"], correctOptionIndex: 1, explanation: "e" };

    expect(scoreExercise(exercise, { exerciseType: "multiple_choice", selectedOptionIndex: 1 }).isCorrect).toBe(true);
    expect(scoreExercise(exercise, { exerciseType: "multiple_choice", selectedOptionIndex: 0 }).isCorrect).toBe(false);
    expect(scoreExercise(exercise, { exerciseType: "multiple_choice", selectedOptionIndex: 0 }).correctAnswer).toBe("b");
  });

  it("scores fill_in_blank with fuzzy matching against any accepted answer", () => {
    const exercise: Exercise = { exerciseType: "fill_in_blank", prompt: "p", acceptedAnswers: ["went", "did go"], explanation: "e" };

    expect(scoreExercise(exercise, { exerciseType: "fill_in_blank", submittedText: "went" }).isCorrect).toBe(true);
    expect(scoreExercise(exercise, { exerciseType: "fill_in_blank", submittedText: "wnt" }).isCorrect).toBe(true); // 1 deletion
    expect(scoreExercise(exercise, { exerciseType: "fill_in_blank", submittedText: "goed" }).isCorrect).toBe(false);
  });

  it("scores short_answer the same fuzzy way as fill_in_blank", () => {
    const exercise: Exercise = { exerciseType: "short_answer", prompt: "p", acceptedAnswers: ["exhausted"], explanation: "e" };

    expect(scoreExercise(exercise, { exerciseType: "short_answer", submittedText: "exhausted" }).isCorrect).toBe(true);
    expect(scoreExercise(exercise, { exerciseType: "short_answer", submittedText: "totally wrong" }).isCorrect).toBe(false);
  });

  it("scores true_false by boolean equality", () => {
    const exercise: Exercise = { exerciseType: "true_false", prompt: "p", correctAnswer: true, explanation: "e" };

    expect(scoreExercise(exercise, { exerciseType: "true_false", submittedAnswer: true }).isCorrect).toBe(true);
    expect(scoreExercise(exercise, { exerciseType: "true_false", submittedAnswer: false }).isCorrect).toBe(false);
  });

  it("scores matching as correct only when every pair matches, with per-pair detail", () => {
    const exercise: Exercise = {
      exerciseType: "matching",
      prompt: "p",
      pairs: [
        ["cat", "gato"],
        ["dog", "perro"],
      ],
      explanation: "e",
    };

    const allCorrect = scoreExercise(exercise, {
      exerciseType: "matching",
      matchedPairs: [
        ["cat", "gato"],
        ["dog", "perro"],
      ],
    });
    expect(allCorrect.isCorrect).toBe(true);
    expect(allCorrect.itemResults).toEqual([true, true]);

    const onePairWrong = scoreExercise(exercise, {
      exerciseType: "matching",
      matchedPairs: [
        ["cat", "perro"],
        ["dog", "perro"],
      ],
    });
    expect(onePairWrong.isCorrect).toBe(false);
    expect(onePairWrong.itemResults).toEqual([false, true]);
  });

  it("scores ordering as correct only when the full sequence matches, with per-position detail", () => {
    const exercise: Exercise = { exerciseType: "ordering", prompt: "p", items: ["first", "second", "third"], explanation: "e" };

    expect(scoreExercise(exercise, { exerciseType: "ordering", submittedOrder: ["first", "second", "third"] }).isCorrect).toBe(true);
    const partial = scoreExercise(exercise, { exerciseType: "ordering", submittedOrder: ["first", "third", "second"] });
    expect(partial.isCorrect).toBe(false);
    expect(partial.itemResults).toEqual([true, false, false]);
  });

  it("scores sentence_building the same way as ordering", () => {
    const exercise: Exercise = { exerciseType: "sentence_building", prompt: "p", chunks: ["I", "am", "happy"], explanation: "e" };

    expect(scoreExercise(exercise, { exerciseType: "sentence_building", submittedOrder: ["I", "am", "happy"] }).isCorrect).toBe(true);
    expect(scoreExercise(exercise, { exerciseType: "sentence_building", submittedOrder: ["I", "happy", "am"] }).isCorrect).toBe(false);
  });

  it("throws ExerciseResponseTypeMismatchError when the response type doesn't match the exercise", () => {
    const exercise: Exercise = { exerciseType: "true_false", prompt: "p", correctAnswer: true, explanation: "e" };

    expect(() => scoreExercise(exercise, { exerciseType: "multiple_choice", selectedOptionIndex: 0 })).toThrow(
      ExerciseResponseTypeMismatchError,
    );
  });
});
