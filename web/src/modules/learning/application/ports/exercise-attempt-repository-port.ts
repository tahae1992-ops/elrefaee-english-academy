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
}
