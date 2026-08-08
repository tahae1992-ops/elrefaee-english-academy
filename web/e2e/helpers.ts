import { readFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import type { E2eFixtureData } from "./global-setup";

export function readFixture(): E2eFixtureData {
  return JSON.parse(readFileSync(path.join(import.meta.dirname, ".fixture-data.json"), "utf8"));
}

export interface TestUser {
  email: string;
  password: string;
  displayName: string;
}

/**
 * `.fill()` normally doesn't need a retry -- it auto-waits for
 * actionability before writing. But immediately after `page.goto`, on
 * WebKit specifically, a fill can land on the pre-hydration DOM node
 * a beat before React hydrates and takes the controlled input back
 * over, silently reverting it to its empty defaultValue. Filling,
 * then verifying the value actually stuck (and retrying if not)
 * survives that race regardless of exact hydration timing.
 */
async function fillReliably(locator: ReturnType<Page["getByLabel"]>, value: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    await locator.fill(value);
    if ((await locator.inputValue()) === value) return;
  }
  throw new Error(`fillReliably: value never stuck after 5 attempts (wanted "${value}")`);
}

/** Real signup through the UI (not a DB insert) -- the point of this journey is proving registration itself works, and it's the only way to get a valid Supabase Auth account without reimplementing Supabase's own password hashing. */
export async function registerTestUser(page: Page, label: string): Promise<TestUser> {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const user: TestUser = {
    email: `e2e-${label}-${unique}@example.com`,
    password: `E2eTest!${unique}`,
    displayName: `E2E ${label}`,
  };

  await page.goto("/register");
  await fillReliably(page.getByLabel(/name/i), user.displayName);
  await fillReliably(page.getByLabel(/email/i), user.email);
  await fillReliably(page.getByLabel(/password/i), user.password);
  await page.getByRole("button", { name: /create account/i }).click();

  // Success either navigates to /dashboard (no email confirmation
  // required) or shows a success message on the same page (email
  // confirmation required) -- wait for whichever actually happens,
  // not just for the click to register, since the submit is async.
  await Promise.race([
    page.waitForURL(/\/dashboard/, { timeout: 15_000 }),
    page.getByText(/account created/i).waitFor({ state: "visible", timeout: 15_000 }),
  ]);

  return user;
}
