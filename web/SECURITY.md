# Secrets Management & Rotation Policy

Operationalizes SRS §12.4 ("rotation cadence: quarterly as a default
policy, immediate on any suspected compromise") — roadmap Phase 17's
deliverable. This is the runbook; it is deliberately **not** a record
of a rotation having been performed. Rotating a live production
secret (especially the database password) can break the running app
if the new value isn't propagated to Vercel in the same step, so the
first real rotation is something to run deliberately with the
project owner present, not something to execute unattended as part
of a routine code change.

## Inventory — every secret this app actually uses

| Secret | Where it lives | Where it's used | Rotation impact if done wrong |
|---|---|---|---|
| `DATABASE_URL` (Postgres password) | Vercel env vars, local `.env.local` | Every server-side DB query (`src/shared/infrastructure/db/client.ts`) — this app has **no** Supabase service-role key or client-side Supabase SDK anywhere, confirmed by the Phase 17 audit; all DB access is this one direct connection string | Every request fails until the new password is in Vercel too |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel env vars, local `.env.local` | Supabase Auth only (`server-client.ts`) — publishable by design (protected by RLS, not secrecy), already visible in every production client bundle | Auth breaks (login/register/session refresh) until rotated everywhere Auth is called from |
| `ANTHROPIC_API_KEY` | Vercel env vars, local `.env.local` | `AnthropicTutorAdapter` only (AI Tutor, currently deferred post-launch — see project memory) | AI Tutor falls back to its documented "unavailable" state — no other feature affected |
| `SENTRY_AUTH_TOKEN` | Vercel env vars (CI only) | Source-map upload at build time only, never at runtime | Next deploy's source maps just don't upload; no user-facing impact |
| `NEXT_PUBLIC_SENTRY_DSN` | Vercel env vars | Client + server Sentry init | Rotating stops new events from reaching the old Sentry project; not a security-sensitive value itself |

## Quarterly rotation procedure

Run once per quarter (calendar reminder, not a CI job — rotating a
live DB password automatically, unattended, is a bigger blast-radius
risk than the cadence discipline it would buy). For each secret in
priority order (`DATABASE_URL` first, it's the one with real
blast radius):

1. **Generate the new value** in the secret's own system of record — Supabase Dashboard → Project Settings → Database → "Reset database password" for `DATABASE_URL`; Supabase Dashboard → API settings for the anon key; the relevant provider console for `ANTHROPIC_API_KEY`/Sentry.
2. **Update Vercel first, in the same sitting** — Project Settings → Environment Variables → update the value for Production (and Preview/Development if they differ) — never leave old and new out of sync across environments for longer than the time it takes to save the form.
3. **Redeploy** (`npx vercel deploy --prod --yes` from `web/`, or trigger via the Vercel dashboard) so the running app actually picks up the new value — Vercel does not hot-reload env vars into already-running serverless functions.
4. **Verify** the specific thing that secret gates still works in production before considering the rotation done: `DATABASE_URL` → hit `/api/v1/health` and confirm 200; Supabase Auth keys → a real login attempt; `ANTHROPIC_API_KEY` → an AI Tutor message (once that feature is back in scope); Sentry → trigger a test error and confirm it lands in the dashboard.
5. **Update local `.env.local`** for anyone who develops against this project, and confirm the *old* value has actually been invalidated at the provider (a "rotation" that leaves the old key still valid isn't a rotation).
6. **Record that it happened** — a dated line in this file's changelog section below is sufficient; the point is a future rotation (or an incident responder) can see when each secret last turned over without needing to ask.

## Immediate (out-of-cycle) rotation

Triggered by *any* suspected compromise — a secret appearing in a
public commit, a dependency CVE affecting a key-handling library, a
laptop/credential-manager compromise, or a departing team member who
had access. Same procedure as above, but skip the calendar and do it
now; treat step 4's verification as non-optional in this case since
an incomplete out-of-cycle rotation under time pressure is exactly
when a step gets skipped.

## What this policy deliberately does not cover

- **Session/JWT rotation** — already handled by Supabase Auth itself (short-lived JWTs, refresh-token rotation-on-use per SRS §12.8) and is not a manually-operated secret in the sense this document covers.
- **A real external penetration test** — the roadmap's other Phase 17 deliverable. That's a vendor engagement/budget decision for the project owner, not something performed as part of this rotation policy or by an autonomous coding session.

## Rotation log

| Date | Secret(s) rotated | Reason | Performed by |
|---|---|---|---|
| — | — | — | *(no rotation has been performed yet — this table starts empty, not backfilled with a fabricated entry)* |
