import type { StreakRecord, StreakRepositoryPort } from "@/modules/engagement/application/ports/streak-repository-port";
import { updateStreak } from "@/modules/engagement/domain/services/streak";

/** FR-18: "streak counted on any-day-active basis." Called once per qualifying activity (lesson completion, correct exercise answer, review response) — the pure `updateStreak` domain function is itself idempotent for same-day repeats (`gap <= 0` returns the prior state unchanged), so calling this more than once in a day is always safe. */
export class UpdateStreakUseCase {
  constructor(private readonly streaks: StreakRepositoryPort) {}

  async execute(userId: string, now: Date): Promise<StreakRecord> {
    const prior = await this.streaks.findByUser(userId);
    const next = updateStreak(prior, now);
    return this.streaks.save(userId, next);
  }
}
