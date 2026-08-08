import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

/**
 * One physical Postgres connection, shared across every module's
 * Infrastructure-layer repositories (SAD §9 — schema-per-context inside a
 * single database instance). No module is permitted to open its own
 * connection; this is the single composition point for that rule.
 */
function createDbClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and provide " +
        "the Supabase connection string before starting the app.",
    );
  }

  const queryClient = postgres(connectionString, {
    // Connection pooling is Supabase-managed (SAD §9) via the
    // transaction pooler -- required for a serverless deployment
    // (see .env.example's DATABASE_URL comment for why session mode
    // isn't safe here). `prepare: false`: transaction-mode pooling
    // doesn't support server-side prepared statements persisting
    // across pooled connections.
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });

  return drizzle(queryClient);
}

let cachedDb: ReturnType<typeof createDbClient> | undefined;

/**
 * Lazily creates and memoizes the shared Drizzle client. Lazy so that
 * importing this module never throws at build time (e.g. during static
 * analysis or when DATABASE_URL genuinely isn't needed for a given route).
 */
export function getDb() {
  if (!cachedDb) {
    cachedDb = createDbClient();
  }
  return cachedDb;
}
