import type { ProgressRepositoryPort, LastPosition } from "@/modules/learning/application/ports/progress-repository-port";

export interface CompleteLessonInput {
  userId: string;
  lessonId: string;
  position: LastPosition;
}

/** FR-05 Main Flow step 4: "On wrap-up, ... marks lesson complete." Unit-advance orchestration (does completing this lesson unlock the next unit?) lives in the Route Handler, not here — it needs curriculum structure this module doesn't own. */
export class CompleteLessonUseCase {
  constructor(private readonly progress: ProgressRepositoryPort) {}

  async execute(input: CompleteLessonInput): Promise<void> {
    await this.progress.markCompleted(input.userId, input.lessonId, input.position);
  }
}
