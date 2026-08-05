export interface AwardXpInput {
  userId: string;
  amount: number;
  /** Idempotency key — a duplicate award for the same sourceEventId is a no-op (SRS FR-18: "duplicate delivery of the same completion event... XP is awarded exactly once"). */
  sourceEventId: string;
  reason: string;
}

export interface AwardXpResult {
  /** False when `sourceEventId` was already recorded — a replay, not a new award. */
  applied: boolean;
  totalXp: number;
}

export interface XpRepositoryPort {
  award(input: AwardXpInput): Promise<AwardXpResult>;
  getBalance(userId: string): Promise<number>;
}
