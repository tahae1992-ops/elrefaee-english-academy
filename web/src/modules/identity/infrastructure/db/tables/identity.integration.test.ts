import { afterAll, describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";

/**
 * DDD §3.1 / Sprint Plan line 136's DoD: "verified with a direct-DB test
 * bypassing the app layer." Runs against a TEMP TABLE that mirrors the
 * exact two-partial-unique-index definition from
 * 0003_identity_tables.sql, rather than the real `identity.user_roles`
 * table, because `user_roles.user_id` FKs through `user_profiles.id` to
 * Supabase-managed `auth.users` — and no AuthService exists yet
 * (Task 3) to create a real auth user to satisfy that FK. This proves
 * the index semantics identically; it does not depend on AuthService.
 */
describe("identity.user_roles — partial unique indexes (DDD §3.1)", () => {
  const db = getDb();

  it("rejects a duplicate platform-wide (academy_id IS NULL) grant but allows distinct academy-scoped grants for the same user+role", async () => {
    await db.execute(sql`
      CREATE TEMP TABLE IF NOT EXISTS probe_user_roles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        role_id uuid NOT NULL,
        academy_id uuid
      );
      CREATE UNIQUE INDEX IF NOT EXISTS probe_platform_wide_unique
        ON probe_user_roles (user_id, role_id) WHERE academy_id IS NULL;
      CREATE UNIQUE INDEX IF NOT EXISTS probe_academy_scoped_unique
        ON probe_user_roles (user_id, role_id, academy_id) WHERE academy_id IS NOT NULL;
    `);

    const userId = "11111111-1111-1111-1111-111111111111";
    const roleId = "22222222-2222-2222-2222-222222222222";
    const academyA = "33333333-3333-3333-3333-333333333333";
    const academyB = "44444444-4444-4444-4444-444444444444";

    await db.execute(sql`
      INSERT INTO probe_user_roles (user_id, role_id, academy_id)
      VALUES (${userId}::uuid, ${roleId}::uuid, NULL)
    `);

    await expect(
      db.execute(sql`
        INSERT INTO probe_user_roles (user_id, role_id, academy_id)
        VALUES (${userId}::uuid, ${roleId}::uuid, NULL)
      `),
    ).rejects.toThrow(/unique/i);

    // A naive UNIQUE(user_id, role_id, academy_id) would incorrectly
    // allow this pair too (Postgres treats NULLs as distinct), which is
    // exactly the bug this partial-index design closes.
    await db.execute(sql`
      INSERT INTO probe_user_roles (user_id, role_id, academy_id)
      VALUES (${userId}::uuid, ${roleId}::uuid, ${academyA}::uuid)
    `);
    await db.execute(sql`
      INSERT INTO probe_user_roles (user_id, role_id, academy_id)
      VALUES (${userId}::uuid, ${roleId}::uuid, ${academyB}::uuid)
    `);

    await expect(
      db.execute(sql`
        INSERT INTO probe_user_roles (user_id, role_id, academy_id)
        VALUES (${userId}::uuid, ${roleId}::uuid, ${academyA}::uuid)
      `),
    ).rejects.toThrow(/unique/i);

    const rows = await db.execute(
      sql`SELECT count(*)::int AS count FROM probe_user_roles`,
    );
    expect(rows[0]?.count).toBe(3);

    await db.execute(sql`DROP TABLE probe_user_roles`);
  });
});

describe("identity + academy tables — RLS is enabled (Sprint 2 DoD)", () => {
  const db = getDb();

  it("has row level security enabled on every table this migration created", async () => {
    const rows = await db.execute<{ schemaname: string; tablename: string }>(sql`
      SELECT schemaname, tablename
      FROM pg_tables
      WHERE (schemaname = 'identity')
         OR (schemaname = 'academy' AND tablename = 'academies')
      ORDER BY schemaname, tablename
    `);

    const expected = [
      "academy.academies",
      "identity.permissions",
      "identity.refresh_token_registry",
      "identity.role_permissions",
      "identity.roles",
      "identity.user_profiles",
      "identity.user_roles",
    ];
    const actual = rows.map((r) => `${r.schemaname}.${r.tablename}`).sort();
    expect(actual).toEqual(expected);

    const rlsRows = await db.execute<{ relname: string; relrowsecurity: boolean }>(sql`
      SELECT c.relname, c.relrowsecurity
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE (n.nspname = 'identity')
         OR (n.nspname = 'academy' AND c.relname = 'academies')
    `);
    for (const row of rlsRows) {
      expect(row.relrowsecurity, `${row.relname} should have RLS enabled`).toBe(true);
    }
  });
});

afterAll(async () => {
  const db = getDb();
  await db.$client.end();
});
