import type { CefrLevel } from "@/modules/assessment/domain/services/score-placement-attempt";

export interface CreateAttemptInput {
  userId: string;
  blueprintId: string;
  /** Placement only — omitted for checkpoint attempts, which have no self-assessment stage. */
  selfAssessedLevel?: CefrLevel;
  assembledItemIds: string[];
}

export interface AttemptRecord {
  id: string;
  userId: string;
  blueprintId: string;
  status: "in_progress" | "completed" | "abandoned";
  assembledItems: string[];
}

export interface RecordResponseInput {
  attemptId: string;
  itemId: string;
  responsePayload: Record<string, unknown>;
  isCorrect: boolean | null;
  scoredBy: "auto" | "human";
}

export interface StoredResponse {
  itemId: string;
  isCorrect: boolean | null;
}

export interface AttemptRepositoryPort {
  create(input: CreateAttemptInput): Promise<AttemptRecord>;
  findById(attemptId: string): Promise<AttemptRecord | null>;
  /** GET /quizzes/{unitId}/checkpoint's idempotent-resume path — reopening the checkpoint mid-attempt returns the same attempt rather than starting a fresh one. */
  findInProgressByUserAndBlueprint(userId: string, blueprintId: string): Promise<AttemptRecord | null>;
  hasResponseForItem(attemptId: string, itemId: string): Promise<boolean>;
  recordResponse(input: RecordResponseInput): Promise<void>;
  getResponses(attemptId: string): Promise<StoredResponse[]>;
  markCompleted(attemptId: string): Promise<void>;
}
