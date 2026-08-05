export interface BadgeWithStatus {
  key: string;
  name: string;
  description: string;
  iconRef: string;
  earnedAt: Date | null;
}

export interface BadgeRepositoryPort {
  /** Every defined badge, with this learner's earned status (earnedAt null if not yet earned) — API Spec §6.11's "Earned + available badges." */
  listForUser(userId: string): Promise<BadgeWithStatus[]>;
  listEarnedKeysForUser(userId: string): Promise<Set<string>>;
  /** Idempotent per (userId, badgeKey) via the underlying PK — awarding an already-earned key is a silent no-op. Returns only the badges newly awarded by this call. */
  awardBadges(userId: string, badgeKeys: string[], now: Date): Promise<BadgeWithStatus[]>;
}
