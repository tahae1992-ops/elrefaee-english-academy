import { eq } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { streaks } from "@/modules/engagement/infrastructure/db/tables/engagement";
import type { StreakRecord, StreakRepositoryPort } from "@/modules/engagement/application/ports/streak-repository-port";
import type { StreakState } from "@/modules/engagement/domain/services/streak";

function toRecord(row: typeof streaks.$inferSelect): StreakRecord {
  return {
    userId: row.userId,
    currentStreakDays: row.currentStreakDays,
    longestStreakDays: row.longestStreakDays,
    lastActiveDate: row.lastActiveDate,
    freezeCredits: row.freezeCredits,
  };
}

export class DrizzleStreakAdapter implements StreakRepositoryPort {
  async findByUser(userId: string): Promise<StreakRecord | null> {
    const [row] = await getDb().select().from(streaks).where(eq(streaks.userId, userId)).limit(1);
    return row ? toRecord(row) : null;
  }

  async save(userId: string, state: StreakState): Promise<StreakRecord> {
    const [row] = await getDb()
      .insert(streaks)
      .values({ userId, ...state })
      .onConflictDoUpdate({
        target: streaks.userId,
        set: {
          currentStreakDays: state.currentStreakDays,
          longestStreakDays: state.longestStreakDays,
          lastActiveDate: state.lastActiveDate,
          freezeCredits: state.freezeCredits,
        },
      })
      .returning();

    return toRecord(row);
  }
}
