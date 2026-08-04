export interface PracticeAnswerRecord {
  selectedOptionIndex: number;
  isCorrect: boolean;
  correctOptionIndex: number;
}

export interface BlockInteractionRecord {
  done: boolean;
  practiceAnswers?: Record<number, PracticeAnswerRecord>;
  taskSubmission?: string;
}

export type BlockInteractions = Record<number, BlockInteractionRecord>;
