import type { DailyGoalRepositoryPort } from "@/modules/engagement/application/ports/daily-goal-repository-port";
import type { XpRepositoryPort } from "@/modules/engagement/application/ports/xp-repository-port";
import { toUtcDateOnly } from "@/modules/engagement/domain/services/streak";

export interface DailyGoalProgress {
  goalXp: number;
  earnedTodayXp: number;
}

/** "Implement daily goals" — today's earned XP against the learner's (auto-defaulted) daily target. Both `daily_goals` and `xp_transactions` are engagement-owned, so this composition stays inside the module — no cross-module lib file needed, unlike badge evaluation. */
export class GetDailyGoalProgressUseCase {
  constructor(
    private readonly dailyGoals: DailyGoalRepositoryPort,
    private readonly xp: XpRepositoryPort,
  ) {}

  async execute(userId: string, now: Date): Promise<DailyGoalProgress> {
    const startOfToday = new Date(`${toUtcDateOnly(now)}T00:00:00.000Z`);
    const [goal, earnedTodayXp] = await Promise.all([
      this.dailyGoals.getOrCreateForUser(userId),
      this.xp.getXpEarnedSince(userId, startOfToday),
    ]);

    return { goalXp: goal.goalXp, earnedTodayXp };
  }
}
