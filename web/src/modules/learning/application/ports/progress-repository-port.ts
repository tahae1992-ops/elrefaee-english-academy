import type { LessonProgressStatus } from "@/modules/learning/domain/services/compute-unit-access";

export interface LastPosition {
  blockIndex: number;
  /** Per-block interaction state (practice answers, task submission text) keyed by block index, so a resumed block re-satisfies its gating interaction if it was already done. */
  blockInteractions: Record<number, unknown>;
}

export interface LessonProgress {
  lessonId: string;
  status: LessonProgressStatus;
  lastPosition: LastPosition;
  completedAt: Date | null;
}

export interface ProgressRepositoryPort {
  getForLesson(userId: string, lessonId: string): Promise<LessonProgress | null>;
  /** Batch lookup — one query for a whole unit/course's lessons instead of N. */
  listForLessons(userId: string, lessonIds: string[]): Promise<LessonProgress[]>;
  savePosition(userId: string, lessonId: string, position: LastPosition): Promise<void>;
  markCompleted(userId: string, lessonId: string, position: LastPosition): Promise<void>;
}
