import type { ProgressRepositoryPort, LessonProgress } from "@/modules/learning/application/ports/progress-repository-port";

/** Fills in a `not_started` default for every lessonId with no row yet, so callers never have to special-case "no progress record exists". */
export class GetLessonProgressUseCase {
  constructor(private readonly progress: ProgressRepositoryPort) {}

  async execute(userId: string, lessonIds: string[]): Promise<Map<string, LessonProgress>> {
    const records = await this.progress.listForLessons(userId, lessonIds);
    const byLessonId = new Map(records.map((record) => [record.lessonId, record]));

    const result = new Map<string, LessonProgress>();
    for (const lessonId of lessonIds) {
      result.set(
        lessonId,
        byLessonId.get(lessonId) ?? {
          lessonId,
          status: "not_started",
          lastPosition: { blockIndex: 0, blockInteractions: {} },
          completedAt: null,
        },
      );
    }
    return result;
  }
}
