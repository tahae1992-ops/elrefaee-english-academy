export interface DailyGoalRecord {
  userId: string;
  goalXp: number;
}

export interface DailyGoalRepositoryPort {
  /** Lazily creates the row (default goalXp) on first read — mirrors `vocabulary_review_state`/`streaks`' lazy-creation pattern, no learner action required before the feature does anything. */
  getOrCreateForUser(userId: string): Promise<DailyGoalRecord>;
}
