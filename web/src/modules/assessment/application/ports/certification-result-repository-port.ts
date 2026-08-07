import type { CefrLevel } from "@/modules/assessment/domain/services/score-placement-attempt";
import type { SkillBreakdownEntry } from "@/modules/assessment/domain/services/score-checkpoint-attempt";

export interface SaveCertificationResultInput {
  attemptId: string;
  userId: string;
  cefrLevel: CefrLevel;
  scorePercent: number;
  passed: boolean;
  skillBreakdown: Record<string, SkillBreakdownEntry>;
  pendingReviewCount: number;
}

export interface CertificationResultRecord extends SaveCertificationResultInput {
  id: string;
  createdAt: Date;
}

export interface CertificationAttemptHistoryEntry {
  passed: boolean;
  completedAt: Date;
}

export interface CertificationResultRepositoryPort {
  save(input: SaveCertificationResultInput): Promise<CertificationResultRecord>;
  findByAttemptId(attemptId: string): Promise<CertificationResultRecord | null>;
  /** Cooldown/escalation computation (compute-certification-cooldown.ts) needs this learner's pass/fail history for this level, most-recent-relevant first not required -- the domain function sorts it. */
  findHistoryByUserAndLevel(userId: string, cefrLevel: CefrLevel): Promise<CertificationAttemptHistoryEntry[]>;
}
