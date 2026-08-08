import { config } from "dotenv";
import postgres from "postgres";

// Playwright doesn't load .env.local the way Next.js does (same
// reason vitest.integration.setup.ts loads it explicitly).
config({ path: ".env.local" });

let sql: ReturnType<typeof postgres> | undefined;

/**
 * A direct connection for E2E test setup/teardown -- seeding state
 * that's out of scope for a given spec to click through itself (see
 * playwright.config.ts's own comment on why). Never used by
 * application code, only by the E2E harness. `max: 1`: Supabase's
 * session-mode pooler on this project tier caps total clients at 15,
 * shared with the dev server's own Drizzle pool (max: 10) -- this
 * harness only ever runs one query at a time anyway, so it doesn't
 * need more than one connection, and closeTestDb() (called after
 * every seed/lookup block, not just at the end of a spec) releases
 * it promptly rather than holding a slot for the whole test.
 */
export function getTestDb() {
  if (!sql) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL not set -- copy .env.example to .env.local first.");
    sql = postgres(connectionString, { max: 1, prepare: false });
  }
  return sql;
}

export async function closeTestDb() {
  if (sql) {
    await sql.end();
    sql = undefined;
  }
}
