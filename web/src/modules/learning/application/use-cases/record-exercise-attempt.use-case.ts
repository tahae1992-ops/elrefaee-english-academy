import type { ExerciseAttempt, ExerciseAttemptRepositoryPort, RecordExerciseAttemptInput } from "@/modules/learning/application/ports/exercise-attempt-repository-port";

/** SRS FR-07's postcondition: "Correctness + latency event recorded." Every submission is recorded, right or wrong — this is the real per-attempt audit trail (curriculum's ScoreExerciseUseCase only returns a score, it never persists anything). */
export class RecordExerciseAttemptUseCase {
  constructor(private readonly attempts: ExerciseAttemptRepositoryPort) {}

  async execute(input: RecordExerciseAttemptInput): Promise<ExerciseAttempt> {
    return this.attempts.record(input);
  }
}
