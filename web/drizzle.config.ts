import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and provide " +
      "your Supabase connection string before running drizzle-kit.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/shared/infrastructure/db/schemas.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Every migration must be reversible (Sprint Workflow rule 14) —
  // drizzle-kit's "down" migrations are generated from schema diffs, and
  // this strict flag ensures a destructive change is never silently
  // auto-applied without an explicit review step.
  strict: true,
  verbose: true,
});
