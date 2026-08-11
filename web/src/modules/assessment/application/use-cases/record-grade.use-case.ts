import type { Grade, GradeRepositoryPort, RecordGradeInput } from "@/modules/assessment/application/ports/grade-repository-port";

/** Thin pass-through, same shape as RecordExerciseAttemptUseCase/RecordActivityEventUseCase — the call sites decide what's grade-worthy, not this use-case. */
export class RecordGradeUseCase {
  constructor(private readonly grades: GradeRepositoryPort) {}

  async execute(input: RecordGradeInput): Promise<Grade> {
    return this.grades.record(input);
  }
}
