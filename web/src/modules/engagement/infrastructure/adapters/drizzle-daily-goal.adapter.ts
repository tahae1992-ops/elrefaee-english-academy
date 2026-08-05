import { eq } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { dailyGoals } from "@/modules/engagement/infrastructure/db/tables/engagement";
import type { DailyGoalRecord, DailyGoalRepositoryPort } from "@/modules/engagement/application/ports/daily-goal-repository-port";

export class DrizzleDailyGoalAdapter implements DailyGoalRepositoryPort {
  async getOrCreateForUser(userId: string): Promise<DailyGoalRecord> {
    const [row] = await getDb()
      .insert(dailyGoals)
      .values({ userId })
      .onConflictDoNothing({ target: dailyGoals.userId })
      .returning();

    if (row) return { userId: row.userId, goalXp: row.goalXp };

    const [existing] = await getDb().select().from(dailyGoals).where(eq(dailyGoals.userId, userId)).limit(1);
    if (!existing) throw new Error(`daily_goals row for ${userId} unexpectedly missing after a conflicting insert.`);
    return { userId: existing.userId, goalXp: existing.goalXp };
  }
}
