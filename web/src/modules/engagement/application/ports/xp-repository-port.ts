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

export interface XpTransactionRecord {
  amount: number;
  reason: string;
  createdAt: Date;
}

export interface XpRepositoryPort {
  award(input: AwardXpInput): Promise<AwardXpResult>;
  getBalance(userId: string): Promise<number>;
  /** API Spec §6.11's "Current XP balance + recent ledger" — soonest-first, capped at `limit`. */
  listRecentTransactions(userId: string, limit: number): Promise<XpTransactionRecord[]>;
  /** Gamification Engine slice — Daily Goal progress: sum of XP awarded at/after `since`. */
  getXpEarnedSince(userId: string, since: Date): Promise<number>;
}
