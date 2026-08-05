import type { BadgeRepositoryPort, BadgeWithStatus } from "@/modules/engagement/application/ports/badge-repository-port";
import { evaluateNewBadges, type LearnerStatsSnapshot } from "@/modules/engagement/domain/services/badge-evaluator";

/**
 * Takes an already-built stats snapshot rather than computing one
 * itself — the snapshot spans data owned by other modules (lessons
 * completed, exercises correct, reviews completed all live in
 * `learning`), and cross-module composition happens in a shared lib/
 * Route Handler, never inside a module's own use-case (this codebase's
 * established boundary rule — see src/lib/build-learner-stats-snapshot.ts).
 */
export class EvaluateAndAwardBadgesUseCase {
  constructor(private readonly badges: BadgeRepositoryPort) {}

  async execute(userId: string, snapshot: LearnerStatsSnapshot, now: Date): Promise<BadgeWithStatus[]> {
    const alreadyEarnedKeys = await this.badges.listEarnedKeysForUser(userId);
    const newKeys = evaluateNewBadges(snapshot, alreadyEarnedKeys);
    if (newKeys.length === 0) return [];
    return this.badges.awardBadges(userId, newKeys, now);
  }
}
