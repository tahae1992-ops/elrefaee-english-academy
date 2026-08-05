import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { badges, userBadges } from "@/modules/engagement/infrastructure/db/tables/engagement";
import type { BadgeRepositoryPort, BadgeWithStatus } from "@/modules/engagement/application/ports/badge-repository-port";

export class DrizzleBadgeAdapter implements BadgeRepositoryPort {
  async listForUser(userId: string): Promise<BadgeWithStatus[]> {
    const rows = await getDb()
      .select({
        key: badges.key,
        name: badges.name,
        description: badges.description,
        iconRef: badges.iconRef,
        earnedAt: userBadges.earnedAt,
      })
      .from(badges)
      .leftJoin(userBadges, and(eq(userBadges.badgeId, badges.id), eq(userBadges.userId, userId)));

    return rows.map((row) => ({ ...row, earnedAt: row.earnedAt ?? null }));
  }

  async listEarnedKeysForUser(userId: string): Promise<Set<string>> {
    const rows = await getDb()
      .select({ key: badges.key })
      .from(userBadges)
      .innerJoin(badges, eq(badges.id, userBadges.badgeId))
      .where(eq(userBadges.userId, userId));

    return new Set(rows.map((row) => row.key));
  }

  async awardBadges(userId: string, badgeKeys: string[], now: Date): Promise<BadgeWithStatus[]> {
    if (badgeKeys.length === 0) return [];

    const definitions = await getDb().select().from(badges).where(inArray(badges.key, badgeKeys));

    const awarded: BadgeWithStatus[] = [];
    for (const definition of definitions) {
      const [inserted] = await getDb()
        .insert(userBadges)
        .values({ userId, badgeId: definition.id, earnedAt: now })
        .onConflictDoNothing({ target: [userBadges.userId, userBadges.badgeId] })
        .returning();

      if (inserted) {
        awarded.push({ key: definition.key, name: definition.name, description: definition.description, iconRef: definition.iconRef, earnedAt: now });
      }
    }

    return awarded;
  }
}
