import { test, expect } from "@playwright/test";
import { registerTestUser } from "./helpers";

/**
 * SRS §14.3's "placement" leg of the critical journey: a brand-new
 * account, through the real signup form, taking the actual adaptive
 * placement diagnostic to a result -- not asserting a specific
 * outcome level (that precision is what score-placement-attempt.ts's
 * own unit tests already verify exhaustively), just that the whole
 * user-facing flow works end to end.
 */
test("register -> self-assess -> diagnostic -> results -> dashboard reflects assessed level", async ({ page }) => {
  // Up to 25 diagnostic items, each a real network round trip -- needs
  // more headroom than the certification exam's shorter item count.
  // WebKit's automation layer has noticeably higher per-action overhead
  // than Chromium's (a known Playwright/WebKit driver characteristic,
  // not an app issue -- the same run reaches the correct results screen,
  // just slower), so this needs enough budget for the slowest project.
  test.setTimeout(300_000);
  await registerTestUser(page, "placement");

  // Registration either lands the learner straight on the dashboard
  // (no email confirmation required in this environment) or shows a
  // success message while staying on /register (confirmation
  // required) -- get to the dashboard before continuing either way.
  if (!page.url().includes("/dashboard")) {
    await page.goto("/dashboard");
  }

  await page.getByRole("link", { name: /take the placement test/i }).click();
  await page.waitForURL(/\/placement-test/);

  // Self-assessment stage -- selected by the radio's own id (the
  // visible label is a full descriptive sentence, not "A1").
  await page.locator("#level-a1").click();
  await page.getByRole("button", { name: /continue/i }).click();

  // Transition stage -- a single "start" CTA (scoped to <main> to
  // avoid matching Next.js's dev-only "Open Next.js Dev Tools" button).
  await page.locator("main").getByRole("button").click();

  // Diagnostic stage: answer every item generically (first option for
  // multiple-choice, free text for the one Speaking/free_text item)
  // until the attempt finalizes into the results screen.
  const maxItems = 30;
  const progress = page.locator("main").getByText(/^Question \d+ of \d+$/);
  let previousProgressText = "";
  for (let i = 0; i < maxItems; i++) {
    const goToDashboard = page.getByRole("button", { name: /go to dashboard/i });
    // Waiting for "any radio/textbox visible" is a false-positive trap
    // once the loop has already run once: the outgoing item's controls
    // can still be mounted (not yet swapped out by React) at the very
    // moment the next iteration starts, so that wait resolves against
    // the departing item, and the interaction below then races its
    // unmount -- exactly what produced an indefinite `.check()` hang
    // on the item-24 -> item-25 (radio -> free_text) transition. The
    // progress text ("Question N of M") only changes once the new item
    // has actually landed, so it's an unambiguous sync point.
    await Promise.race([
      goToDashboard.waitFor({ state: "visible", timeout: 60_000 }).catch(() => undefined),
      expect(progress).not.toHaveText(previousProgressText, { timeout: 60_000 }).catch(() => undefined),
    ]);

    const onResults = await goToDashboard.isVisible().catch(() => false);
    if (onResults) break;

    previousProgressText = (await progress.textContent().catch(() => null)) ?? previousProgressText;

    const radios = page.locator("main").getByRole("radio");
    const radioCount = await radios.count();
    if (radioCount > 0) {
      await radios.first().check();
    } else {
      const textbox = page.locator("main").getByRole("textbox");
      if ((await textbox.count()) > 0) {
        await textbox.first().fill("This is an E2E test answer.");
      }
    }

    // Named specifically, not "the first enabled button in <main>" --
    // listening items also render an always-enabled "Play audio"
    // button ahead of "Next" in DOM order, which a generic picker
    // grabs instead, replaying audio forever without ever advancing.
    const nextButton = page.locator("main").getByRole("button", { name: /^next$/i });
    const clicked = await nextButton.isEnabled().catch(() => false);
    if (!clicked) break;
    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/responses") && res.request().method() === "POST", { timeout: 10_000 }).catch(() => null),
      nextButton.click(),
    ]);
    // No networkidle wait here: the top of the next iteration already
    // waits for the next item's own controls (or the results screen)
    // to appear, which is a tighter, faster sync point than idle network.
  }

  // Results stage: an overall level is shown, and the learner can
  // reach their course from here (both a "go to dashboard" button and
  // a "view my course" link render together, so target the one this
  // test actually clicks next rather than the pair as a strict-mode
  // locator).
  const goToDashboardButton = page.getByRole("button", { name: /go to dashboard/i });
  await expect(goToDashboardButton).toBeVisible({ timeout: 15_000 });

  await goToDashboardButton.click();
  await page.waitForURL(/\/dashboard/);

  // Dashboard no longer shows "not yet assessed" -- the placement
  // result actually persisted and is reflected back.
  await expect(page.getByText(/not yet assessed/i)).not.toBeVisible();
});
