import type { SkillBreakdownEntry } from "@/modules/assessment/domain/services/score-checkpoint-attempt";

export interface SaveCheckpointResultInput {
  attemptId: string;
  userId: string;
  unitId: string;
  scorePercent: number;
  passed: boolean;
  skillBreakdown: Record<string, SkillBreakdownEntry>;
}

export interface CheckpointResultRecord extends SaveCheckpointResultInput {
  id: string;
  createdAt: Date;
}

export interface CheckpointResultRepositoryPort {
  save(input: SaveCheckpointResultInput): Promise<CheckpointResultRecord>;
  findByAttemptId(attemptId: string): Promise<CheckpointResultRecord | null>;
  /** The mastery-gate read path (lesson-access.ts): which of these units has this learner already passed the checkpoint for. */
  findPassedUnitIds(userId: string, unitIds: string[]): Promise<Set<string>>;
}
