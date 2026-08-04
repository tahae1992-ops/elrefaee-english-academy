/**
 * The 7 exercise types this slice supports. FR-07 itself only names
 * input *modalities* (typed/spoken/drag-drop/selection) and treats
 * multiple-choice as a restricted recognition format (EDD Sec16); it
 * doesn't enumerate a type catalog. Fill-in-the-blank and (drag-and-
 * drop) matching are named once each, at a one-line "variant" level,
 * in doc 07 Sec5.12 "Quiz Components" — Ordering, True/False, Short
 * Answer, and Sentence Building appear nowhere in the doc set. All 7
 * are built here per explicit user instruction; the shapes below are
 * designed for this slice (no schema for any of them exists in the
 * docs), following EDD Sec16's stated retrieval-over-recognition
 * preference where the type allows it.
 *
 * Every exercise carries a real, authored `explanation` — doc 07
 * Sec5.12: "green/red + explanation, never just a checkmark with no
 * reasoning."
 *
 * Ordering/matching/sentence-building are built as tap-to-select /
 * tap-to-place interactions, not pointer drag-and-drop — doc 07
 * Sec5.12 states this exact pattern for matching ("reflows to a
 * tap-to-select-tap-to-place pattern on touch devices, which doubles
 * as the accessibility alternative") and it's extended consistently
 * to Ordering/Sentence Building (undocumented UI, full design
 * latitude) so all three share one accessible-by-construction
 * interaction model instead of a second, drag-based implementation
 * needing its own WCAG 2.2 Dragging-Movements alternative.
 */

export type ExerciseType =
  | "multiple_choice"
  | "fill_in_blank"
  | "matching"
  | "ordering"
  | "true_false"
  | "short_answer"
  | "sentence_building";

interface ExerciseBase {
  prompt: string;
  explanation: string;
}

export interface MultipleChoiceExercise extends ExerciseBase {
  exerciseType: "multiple_choice";
  options: string[];
  correctOptionIndex: number;
}

export interface FillInBlankExercise extends ExerciseBase {
  exerciseType: "fill_in_blank";
  /** Fuzzy-matched per FR-07's Levenshtein tolerance rule (fuzzy-match.ts). */
  acceptedAnswers: string[];
}

export interface MatchingExercise extends ExerciseBase {
  exerciseType: "matching";
  /** Each pair is [leftText, rightText] — the canonical correct pairing. */
  pairs: [string, string][];
}

export interface OrderingExercise extends ExerciseBase {
  exerciseType: "ordering";
  /** In correct order — shuffled for display, scored by exact-sequence match against this. */
  items: string[];
}

export interface TrueFalseExercise extends ExerciseBase {
  exerciseType: "true_false";
  correctAnswer: boolean;
}

export interface ShortAnswerExercise extends ExerciseBase {
  exerciseType: "short_answer";
  /** Fuzzy-matched per FR-07's Levenshtein tolerance rule (fuzzy-match.ts). */
  acceptedAnswers: string[];
}

export interface SentenceBuildingExercise extends ExerciseBase {
  exerciseType: "sentence_building";
  /** Word/chunk bank in correct order — shuffled for display, scored by exact-sequence match. */
  chunks: string[];
}

export type Exercise =
  | MultipleChoiceExercise
  | FillInBlankExercise
  | MatchingExercise
  | OrderingExercise
  | TrueFalseExercise
  | ShortAnswerExercise
  | SentenceBuildingExercise;

// --- Client-safe variants: never carry the answer key. ---

export type ClientMultipleChoiceExercise = Pick<MultipleChoiceExercise, "exerciseType" | "prompt" | "options">;
export type ClientFillInBlankExercise = Pick<FillInBlankExercise, "exerciseType" | "prompt">;
export interface ClientMatchingExercise extends Pick<MatchingExercise, "exerciseType" | "prompt"> {
  leftItems: string[];
  rightItems: string[];
}
export interface ClientOrderingExercise extends Pick<OrderingExercise, "exerciseType" | "prompt"> {
  shuffledItems: string[];
}
export type ClientTrueFalseExercise = Pick<TrueFalseExercise, "exerciseType" | "prompt">;
export type ClientShortAnswerExercise = Pick<ShortAnswerExercise, "exerciseType" | "prompt">;
export interface ClientSentenceBuildingExercise extends Pick<SentenceBuildingExercise, "exerciseType" | "prompt"> {
  shuffledChunks: string[];
}

export type ClientExercise =
  | ClientMultipleChoiceExercise
  | ClientFillInBlankExercise
  | ClientMatchingExercise
  | ClientOrderingExercise
  | ClientTrueFalseExercise
  | ClientShortAnswerExercise
  | ClientSentenceBuildingExercise;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Strips the answer key from an exercise before it reaches the client — same rule as assessment.item_bank.scoring_key. */
export function toClientExercise(exercise: Exercise): ClientExercise {
  switch (exercise.exerciseType) {
    case "multiple_choice":
      return { exerciseType: "multiple_choice", prompt: exercise.prompt, options: exercise.options };
    case "fill_in_blank":
      return { exerciseType: "fill_in_blank", prompt: exercise.prompt };
    case "matching": {
      const leftItems = shuffle(exercise.pairs.map(([left]) => left));
      const rightItems = shuffle(exercise.pairs.map(([, right]) => right));
      return { exerciseType: "matching", prompt: exercise.prompt, leftItems, rightItems };
    }
    case "ordering":
      return { exerciseType: "ordering", prompt: exercise.prompt, shuffledItems: shuffle(exercise.items) };
    case "true_false":
      return { exerciseType: "true_false", prompt: exercise.prompt };
    case "short_answer":
      return { exerciseType: "short_answer", prompt: exercise.prompt };
    case "sentence_building":
      return { exerciseType: "sentence_building", prompt: exercise.prompt, shuffledChunks: shuffle(exercise.chunks) };
  }
}
