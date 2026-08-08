import { test, expect } from "@playwright/test";
import { registerTestUser } from "./helpers";
import { readFixture } from "./helpers";
import { getTestDb, closeTestDb } from "./db";

/**
 * SRS §14.3's "certificate" leg of the critical journey. Registration
 * and the certification exam itself are driven through the real UI;
 * getting to "every unit's checkpoint already passed" is seeded
 * directly (see playwright.config.ts's own comment on why) rather
 * than re-clicking through lesson content and unit-checkpoint quizzes
 * a second time -- both are already covered, click-by-click, by this
 * same journey's placement/registration spec and by the manual
 * verification performed when those slices originally shipped.
 */
test.describe.configure({ mode: "serial" });

test("certification exam pass -> certificate issued -> publicly verifiable", async ({ page, context }) => {
  test.setTimeout(90_000);
  const fixture = readFixture();
  const user = await registerTestUser(page, "certify");

  const sql = getTestDb();
  const [profile] = await sql<{ id: string }[]>`
    select up.id from identity.user_profiles up
    join auth.users u on u.id = up.id
    where u.email = ${user.email}
    limit 1
  `;
  expect(profile, "test user's profile should exist after registration").toBeTruthy();
  const userId = profile.id;

  const [academy] = await sql<{ id: string }[]>`select id from academy.academies limit 1`;

  // Fast-forward: mark every lesson in every a1 unit complete, and
  // every unit's checkpoint passed -- exactly the state the checkpoint
  // and lesson-completion E2E coverage already exercises through the UI.
  await sql`update identity.user_profiles set current_level = 'a1' where id = ${userId}`;
  await sql`
    insert into learning.enrollments (user_id, academy_id, current_course_id, current_unit_id, placement_method)
    values (${userId}, ${academy.id}, ${fixture.a1CourseId}, ${fixture.a1Units[0].id}, 'e2e_seed')
  `;

  for (const unit of fixture.a1Units) {
    for (const lessonId of unit.lessonIds) {
      await sql`
        insert into learning.progress_records (user_id, lesson_id, status, completed_at)
        values (${userId}, ${lessonId}, 'completed', now())
      `;
    }
    const [attempt] = await sql<{ id: string }[]>`
      insert into assessment.attempts (user_id, blueprint_id, status, assembled_items, started_at, completed_at)
      values (${userId}, ${unit.checkpointBlueprintId}, 'completed', '{}', now(), now())
      returning id
    `;
    await sql`
      insert into assessment.checkpoint_results (attempt_id, user_id, unit_id, score_percent, passed, skill_breakdown)
      values (${attempt.id}, ${userId}, ${unit.id}, 100, true, '{}'::jsonb)
    `;
  }

  // Look up every a1 auto-scored item's correct answer once, keyed by
  // prompt text -- items are assembled in non-deterministic order, so
  // the test answers by reading each rendered prompt rather than
  // assuming a fixed sequence.
  const items = await sql<{ prompt: { prompt: string; options?: string[] }; scoring_key: { correctOptionIndex: number } | null }[]>`
    select prompt, scoring_key from assessment.item_bank where unit_id is null and cefr_level = 'a1'
  `;
  const correctAnswerByPrompt = new Map<string, string>();
  for (const item of items) {
    if (item.scoring_key && item.prompt.options) {
      correctAnswerByPrompt.set(item.prompt.prompt, item.prompt.options[item.scoring_key.correctOptionIndex]);
    }
  }

  // Release the harness's connection for the whole exam-taking phase --
  // each answer submit and the final scoring call are the dev server's
  // own queries, and the pooler's session-mode cap (15 clients, shared
  // with the dev server's pool) has no room to spare for an idle
  // connection sitting on the test-harness side too.
  await closeTestDb();

  await page.goto(`/courses/${fixture.a1CourseId}`);
  await page.getByRole("link", { name: /start exam/i }).click();
  await page.waitForURL(/\/exams\//);

  const promptLocator = page.locator("p.text-base.font-medium");
  let previousPromptText = "";
  for (let i = 0; i < items.length; i++) {
    // Waiting for "visible" (rather than for the text to actually
    // change) is a false-positive trap once the loop has run once:
    // the outgoing item's prompt can still be mounted (not yet
    // swapped out by React) the instant the next iteration starts, so
    // the wait resolves against the departing item -- its stale text
    // then gets looked up and answered against a label that doesn't
    // exist in the new item's DOM, hanging `.check()` indefinitely (a
    // real failure this exact loop shape produced on WebKit).
    await expect(promptLocator).not.toHaveText(previousPromptText, { timeout: 15_000 });
    const promptText = (await promptLocator.textContent())?.trim() ?? "";
    previousPromptText = promptText;

    const textbox = page.getByRole("textbox");
    if ((await textbox.count()) > 0) {
      await textbox.first().fill("E2E speaking answer.");
    } else {
      const correctOption = correctAnswerByPrompt.get(promptText);
      expect(correctOption, `no known correct answer for prompt: "${promptText}"`).toBeTruthy();
      // getByLabel resolves to the radio input itself (via the
      // label's `for` attribute), which .check() handles more
      // reliably than a generic .click() on the label text node.
      await page.getByLabel(correctOption!, { exact: true }).check();
    }

    const submitButton = page.getByRole("button", { name: /submit/i });
    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/responses") && res.request().method() === "POST", { timeout: 15_000 }).catch(() => null),
      submitButton.click(),
    ]);
    await page.waitForLoadState("networkidle").catch(() => undefined);

    const dialogVisible = await page.getByText(/certificate earned/i).isVisible().catch(() => false);
    if (dialogVisible) break;
  }

  await expect(page.getByText(/certificate earned/i)).toBeVisible({ timeout: 15_000 });

  const sqlAfter = getTestDb();
  const [certificate] = await sqlAfter<{ id: string; verification_code: string }[]>`
    select id, verification_code from assessment.certificates where user_id = ${userId} order by issued_at desc limit 1
  `;
  expect(certificate, "a certificate row should exist after a passing certification exam").toBeTruthy();

  await page.getByRole("link", { name: /view certificate/i }).click();
  await page.waitForURL(new RegExp(`/certificates/${certificate.id}`));
  await expect(page.getByText("A1", { exact: true })).toBeVisible();

  // Public verification: a fresh, unauthenticated browser context --
  // no cookies carried over from the logged-in session above.
  const publicContext = await context.browser()!.newContext();
  const publicPage = await publicContext.newPage();
  await publicPage.goto(`/verify/${certificate.verification_code}`);
  await expect(publicPage.getByText(/certificate verified/i)).toBeVisible();
  await publicContext.close();

  await closeTestDb();
});
