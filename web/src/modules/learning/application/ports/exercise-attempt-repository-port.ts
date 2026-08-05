export interface ExerciseAttempt {
  id: string;
  userId: string;
  exerciseId: string;
  lessonId: string;
  attemptNumber: number;
  responsePayload: unknown;
  isCorrect: boolean;
  latencyMs: number;
  createdAt: Date;
}

export interface RecordExerciseAttemptInput {
  userId: string;
  exerciseId: string;
  lessonId: string;
  responsePayload: unknown;
  isCorrect: boolean;
  latencyMs: number;
}

export interface ExerciseAttemptRepositoryPort {
  /** Inserts a new attempt row with `attempt_number` = count of this user's prior attempts on this exercise + 1. */
  record(input: RecordExerciseAttemptInput): Promise<ExerciseAttempt>;
  /** Gamification Engine slice — progress-statistics input: distinct exercises this user has ever answered correctly (a retried-until-correct exercise counts once). */
  countDistinctCorrectForUser(userId: string): Promise<number>;
  /** AI Tutor slice — "tutor suggestions based on learner mistakes": exercises in this lesson the learner has answered incorrectly at least once, most-recent-mistake first. Exercise ids only — the caller resolves these to client-safe (answer-key-free) prompt text itself (see src/lib/build-tutor-lesson-context.ts), never from this port. */
  listDistinctIncorrectExerciseIdsForLesson(userId: string, lessonId: string, limit: number): Promise<string[]>;
}
