import type { ExerciseRepositoryPort } from "@/modules/curriculum/application/ports/exercise-repository-port";
import { scoreExercise, type ExerciseResponse, type ScoreResult } from "@/modules/curriculum/domain/services/score-exercise";

export class ExerciseNotFoundError extends Error {
  constructor() {
    super("Exercise not found.");
    this.name = "ExerciseNotFoundError";
  }
}

/**
 * SRS FR-07 Main Flow steps 2-4: "Learner responds... System
 * evaluates... System shows immediate feedback." Scores any of the 7
 * exercise types server-side (score-exercise.ts) — the response's
 * exerciseType is validated against the real exercise before scoring,
 * so a client can never submit a mismatched response shape.
 */
export class ScoreExerciseUseCase {
  constructor(private readonly exercises: ExerciseRepositoryPort) {}

  async execute(exerciseId: string, response: ExerciseResponse): Promise<ScoreResult> {
    const exercise = await this.exercises.getById(exerciseId);
    if (!exercise) throw new ExerciseNotFoundError();

    return scoreExercise(exercise, response);
  }
}
