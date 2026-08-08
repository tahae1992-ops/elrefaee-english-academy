import { defineConfig, devices } from "@playwright/test";

/**
 * SRS §14.3's E2E requirement, Phase 18 (Testing). Of the 3 named
 * critical journeys (PRD §9), only "placement -> first lesson ->
 * certificate" is buildable against the app as it exists today --
 * "instructor grading flow" and "content-authoring -> review ->
 * publish flow" both depend on features from Phases 10 (CMS) and 15
 * (Admin Dashboard) that haven't been built yet. Their E2E specs are
 * deferred until those phases land, not faked against a UI that
 * doesn't exist.
 *
 * Runs against the local dev server (webServer below starts it) --
 * cross-browser (chromium/firefox/webkit) per SRS §14.3's own ask,
 * all headless, no manual QA pass substituted for real automation.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"]],
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
