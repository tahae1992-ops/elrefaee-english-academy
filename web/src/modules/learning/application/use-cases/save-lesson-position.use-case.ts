import type { ProgressRepositoryPort, LastPosition } from "@/modules/learning/application/ports/progress-repository-port";

export interface SaveLessonPositionInput {
  userId: string;
  lessonId: string;
  position: LastPosition;
}

/** FR-05's Alternative Flow ("system persists exact block/exercise position"). Never downgrades an already-completed lesson back to in_progress — the adapter's upsert only touches `not_started`/`in_progress` rows for the position write. */
export class SaveLessonPositionUseCase {
  constructor(private readonly progress: ProgressRepositoryPort) {}

  async execute(input: SaveLessonPositionInput): Promise<void> {
    await this.progress.savePosition(input.userId, input.lessonId, input.position);
  }
}
