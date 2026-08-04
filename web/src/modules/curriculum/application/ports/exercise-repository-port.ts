import type { Exercise } from "@/modules/curriculum/domain/services/exercise";

export interface ExerciseRepositoryPort {
  /** Full exercise (incl. answer key) — server-side scoring only, never sent to a client as-is. */
  getById(exerciseId: string): Promise<Exercise | null>;
  /** Batch fetch for resolving a lesson's `exerciseIds` in one query. */
  listByIds(exerciseIds: string[]): Promise<Map<string, Exercise>>;
}
