import path from "node:path";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { registerTestUser, readFixture } from "./helpers";

const authStatePath = path.join(import.meta.dirname, ".a11y-auth-state.json");

/**
 * SRS §14.4's automated half: axe-core against a representative page
 * from every distinct layout/component family in the app, scoped to
 * WCAG 2.0/2.1/2.2 A+AA rules (the project's conformance target).
 * Doesn't replace the manual screen-reader pass §14.4 also asks for
 * (VoiceOver/NVDA) -- that needs a human and is disclosed as deferred,
 * not simulated here.
 */
const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function scan(page: import("@playwright/test").Page) {
  // axe injects and evaluates a script in the page; a handful of routes
  // (client-side auth/locale redirects, post-hydration data fetches)
  // can still be mid-navigation right after `goto` resolves, which
  // tears down that execution context out from under the injected
  // script. Settling first avoids racing it.
  await page.waitForLoadState("networkidle").catch(() => undefined);
  return new AxeBuilder({ page }).withTags(wcagTags).analyze();
}

function reportViolations(pageName: string, results: Awaited<ReturnType<typeof scan>>) {
  if (results.violations.length > 0) {
    const summary = results.violations
      .map((v) => `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s)) — ${v.helpUrl}`)
      .join("\n");
    console.log(`\naxe violations on ${pageName}:\n${summary}\n`);
  }
  expect(results.violations, `axe violations on ${pageName}:\n${JSON.stringify(results.violations, null, 2)}`).toEqual([]);
}

test.describe("WCAG 2.2 AA automated audit (axe-core)", () => {
  test("home page", async ({ page }) => {
    await page.goto("/");
    reportViolations("home", await scan(page));
  });

  test("login page", async ({ page }) => {
    await page.goto("/login");
    reportViolations("login", await scan(page));
  });

  test("register page", async ({ page }) => {
    await page.goto("/register");
    reportViolations("register", await scan(page));
  });

  test("design system reference page", async ({ page }) => {
    await page.goto("/design-system");
    reportViolations("design-system", await scan(page));
  });

  test("verify page (invalid code state)", async ({ page }) => {
    await page.goto("/verify/does-not-exist");
    reportViolations("verify (not found state)", await scan(page));
  });

  test.describe("authenticated pages", () => {
    // One registration for the whole describe block, not one per test
    // (per test was the original shape): register.action.ts's own
    // Phase 17 IP rate limit (10 registrations / 10 min) exists
    // specifically to stop mass account creation, and re-registering
    // per page here was tripping that same real limiter, not hitting
    // an app bug. Registering once and reusing the session via
    // storageState is both the fix and simply better test design.
    test.beforeAll(async ({ browser }) => {
      // Explicit `storageState: undefined` overrides this describe
      // block's own `test.use({ storageState: authStatePath })` below
      // -- without it, this manual newContext() inherits that option
      // too and tries to read the very file this hook is about to
      // create, before it exists.
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();
      await registerTestUser(page, "a11y");
      if (!page.url().includes("/dashboard")) {
        await page.goto("/dashboard");
      }
      await context.storageState({ path: authStatePath });
      await context.close();
    });

    test.use({ storageState: authStatePath });

    test("dashboard", async ({ page }) => {
      await page.goto("/dashboard");
      reportViolations("dashboard", await scan(page));
    });

    test("course catalog", async ({ page }) => {
      await page.goto("/courses");
      reportViolations("courses", await scan(page));
    });

    test("course details", async ({ page }) => {
      const fixture = readFixture();
      await page.goto(`/courses/${fixture.a1CourseId}`);
      reportViolations("course details", await scan(page));
    });

    test("unit page", async ({ page }) => {
      const fixture = readFixture();
      const unit = fixture.a1Units[0];
      await page.goto(`/courses/${fixture.a1CourseId}/units/${unit.id}`);
      reportViolations("unit page", await scan(page));
    });

    test("lesson page", async ({ page }) => {
      const fixture = readFixture();
      const unit = fixture.a1Units[0];
      await page.goto(`/lessons/${unit.lessonIds[0]}`);
      reportViolations("lesson page", await scan(page));
    });

    test("review page", async ({ page }) => {
      await page.goto("/review");
      reportViolations("review", await scan(page));
    });

    test("certificates list", async ({ page }) => {
      await page.goto("/certificates");
      reportViolations("certificates", await scan(page));
    });

    test("placement test entry", async ({ page }) => {
      await page.goto("/placement-test");
      reportViolations("placement-test entry", await scan(page));
    });
  });
});
