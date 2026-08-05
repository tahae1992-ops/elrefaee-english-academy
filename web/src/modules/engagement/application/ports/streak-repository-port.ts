import type { StreakState } from "@/modules/engagement/domain/services/streak";

export interface StreakRecord extends StreakState {
  userId: string;
}

export interface StreakRepositoryPort {
  findByUser(userId: string): Promise<StreakRecord | null>;
  /** Upsert — creates the row on a learner's first-ever activity, updates it thereafter. */
  save(userId: string, state: StreakState): Promise<StreakRecord>;
}
