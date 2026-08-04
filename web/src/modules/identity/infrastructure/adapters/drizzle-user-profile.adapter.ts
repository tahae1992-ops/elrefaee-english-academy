import { eq } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { roles, userProfiles, userRoles } from "@/modules/identity/infrastructure/db/tables/identity";
import { academies } from "@/shared/infrastructure/db/tables/academy";
import type {
  CreateUserProfileInput,
  UserProfile,
  UserProfileRepositoryPort,
} from "@/modules/identity/application/ports/user-profile-repository-port";

/**
 * Connects via DATABASE_URL as the `postgres` role, not through
 * PostgREST/RLS-scoped roles — table-owner connections bypass RLS by
 * default in Postgres, which is what lets this write to
 * identity.user_profiles/user_roles even though no client-role INSERT
 * policy exists there (0004_identity_tables_rls.sql — writes are
 * deliberately service-side only).
 */
export class DrizzleUserProfileAdapter implements UserProfileRepositoryPort {
  async createProfileWithDefaultRole(input: CreateUserProfileInput): Promise<void> {
    const db = getDb();

    await db.transaction(async (tx) => {
      await tx.insert(userProfiles).values({
        id: input.userId,
        displayName: input.displayName,
      });

      const [role] = await tx
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.key, input.defaultRoleKey))
        .limit(1);
      if (!role) {
        throw new Error(`Role "${input.defaultRoleKey}" is not seeded`);
      }

      // MVP has exactly one seeded academy (DDD §3.2) — a new Student
      // is enrolled there by default. Multi-academy signup selection
      // is out of scope until Sprint 3 actually builds academy
      // membership as a concept.
      const [academy] = await tx
        .select({ id: academies.id })
        .from(academies)
        .limit(1);
      if (!academy) {
        throw new Error("No academy is seeded");
      }

      await tx.insert(userRoles).values({
        userId: input.userId,
        roleId: role.id,
        academyId: academy.id,
      });
    });
  }

  async findById(userId: string): Promise<UserProfile | null> {
    const [profile] = await getDb()
      .select({
        userId: userProfiles.id,
        displayName: userProfiles.displayName,
        currentLevel: userProfiles.currentLevel,
      })
      .from(userProfiles)
      .where(eq(userProfiles.id, userId))
      .limit(1);

    return profile ?? null;
  }
}
