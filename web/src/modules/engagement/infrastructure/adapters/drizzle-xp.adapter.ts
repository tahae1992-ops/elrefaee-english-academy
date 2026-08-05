import { eq, sql } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { xpBalances, xpTransactions } from "@/modules/engagement/infrastructure/db/tables/engagement";
import type { AwardXpInput, AwardXpResult, XpRepositoryPort } from "@/modules/engagement/application/ports/xp-repository-port";

export class DrizzleXpAdapter implements XpRepositoryPort {
  async award(input: AwardXpInput): Promise<AwardXpResult> {
    return getDb().transaction(async (tx) => {
      const [inserted] = await tx
        .insert(xpTransactions)
        .values({
          userId: input.userId,
          amount: input.amount,
          sourceEventId: input.sourceEventId,
          reason: input.reason,
        })
        .onConflictDoNothing({ target: xpTransactions.sourceEventId })
        .returning({ id: xpTransactions.id });

      if (!inserted) {
        // Already awarded for this sourceEventId (duplicate/retried delivery, FR-18) — return the current balance untouched.
        const [balance] = await tx.select({ totalXp: xpBalances.totalXp }).from(xpBalances).where(eq(xpBalances.userId, input.userId)).limit(1);
        return { applied: false, totalXp: balance?.totalXp ?? 0 };
      }

      const [balance] = await tx
        .insert(xpBalances)
        .values({ userId: input.userId, totalXp: input.amount })
        .onConflictDoUpdate({
          target: xpBalances.userId,
          set: { totalXp: sql`${xpBalances.totalXp} + ${input.amount}`, updatedAt: sql`now()` },
        })
        .returning({ totalXp: xpBalances.totalXp });

      return { applied: true, totalXp: balance.totalXp };
    });
  }

  async getBalance(userId: string): Promise<number> {
    const [row] = await getDb().select({ totalXp: xpBalances.totalXp }).from(xpBalances).where(eq(xpBalances.userId, userId)).limit(1);
    return row?.totalXp ?? 0;
  }
}
