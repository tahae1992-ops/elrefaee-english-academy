export interface ExerciseAttemptRecord {
  /** True once correct, or once the learner chose "show answer" after an incorrect attempt — either way, this exercise no longer blocks Continue. */
  done: boolean;
  isCorrect: boolean;
  correctAnswer: unknown;
  explanation: string;
  itemResults?: boolean[];
  /** True only when `done` was reached via "show answer" rather than a correct submission — distinct visual treatment. */
  revealed?: boolean;
}

export interface BlockInteractionRecord {
  done: boolean;
  /** Keyed by exercise id — controlled_practice blocks. */
  exerciseAttempts?: Record<string, ExerciseAttemptRecord>;
  /** communicative_task blocks. */
  taskSubmission?: string;
}

export type BlockInteractions = Record<number, BlockInteractionRecord>;
