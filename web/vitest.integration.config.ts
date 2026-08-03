import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Integration tests hit a real database (SRS §14.1/§14.2) — the
 * counterpart to vitest.config.ts's unit run, which never touches
 * DATABASE_URL. Run via `npm run test:integration`, requires
 * DATABASE_URL to be set (see .env.example), and is not part of the
 * default `npm test` gate.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["**/*.integration.test.ts"],
    exclude: ["**/node_modules/**"],
    // DB round-trips are slower than jsdom unit tests; the default
    // 5s timeout is too tight for a cold connection pool.
    testTimeout: 15000,
  },
});
