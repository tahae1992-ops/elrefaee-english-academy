import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // Integration tests (real DB) live under *.integration.test.ts and are
    // run by a separate script, per SRS §14.1/§14.2 — unit tests never
    // depend on a live database.
    exclude: ["**/node_modules/**", "**/*.integration.test.ts", "**/e2e/**"],
    coverage: {
      provider: "v8",
      // SRS §3's coverage target is scoped to learning-loop/scoring logic,
      // not a blanket repo-wide number — Sprint 1 has none of that yet,
      // so no coverage gate is enforced until Sprint 6/7 introduce it.
      reporter: ["text", "html"],
    },
  },
});
