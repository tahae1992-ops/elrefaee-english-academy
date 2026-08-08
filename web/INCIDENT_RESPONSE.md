# Incident Response Runbook

Operationalizes roadmap Phase 20's "incident-response runbook active"
deliverable and doc 10 (development roadmap) §7's Rollback Strategy.
This is the runbook — how to respond, given a real incident — not a
record of an incident having occurred, and not a substitute for the
other two Phase 20 deliverables it depends on: **on-call staffing**
and a **rehearsed** rollback. Both require a human's real-time
presence and are disclosed as outstanding at the bottom of this file,
not simulated here.

## Monitoring — where you'd actually find out something is wrong

| Source | What it catches | Where |
|---|---|---|
| Sentry | Unhandled exceptions, both client and server (`instrumentation.ts` / `instrumentation-client.ts`) | Sentry project dashboard (DSN in `NEXT_PUBLIC_SENTRY_DSN`) |
| Vercel deployment status | A build/deploy that fails outright | Vercel dashboard, or `npx vercel ls --prod` from `web/` |
| `/api/v1/health` | Whether the app can reach the database at all (the one thing this endpoint actually checks) | `curl https://elrefaee-english-academy.vercel.app/api/v1/health` — expect `{"status":"healthy",...}` |
| Supabase dashboard | Database-level issues (connection pool exhaustion, query errors) independent of what Sentry catches at the app layer | Supabase project dashboard, Logs & Reports |

There is no alerting/paging system wired to any of these yet (see
"What this runbook doesn't cover" below) — today, "monitoring" means
a human checking these sources, not something that pages anyone
automatically.

## Severity levels

- **SEV1 — full outage or data-integrity risk.** The site is down,
  `/api/v1/health` fails, authentication is broken for everyone, or
  something is writing incorrect data (e.g., wrong scores, wrong
  certificates). Roll back immediately (see below); investigate the
  root cause after service is restored, not before.
- **SEV2 — degraded, not down.** A specific feature is broken (e.g.,
  certificate issuance failing, one exercise type crashing) but the
  rest of the app works. Assess whether a full rollback or a targeted
  fix-forward is faster; a rollback is still usually the safer first
  move given this app currently has no feature-flag kill switch (Doc
  10 §7 names this as a Phase 8+ capability that hasn't been built).
- **SEV3 — cosmetic or low-impact.** A visual bug, a copy error, a
  non-blocking console warning. Fix forward in the normal course of
  work; no rollback warranted.

## Rollback procedure (SEV1/SEV2)

Vercel's deploy model is atomic per the roadmap's own strategy —
rolling back means pointing production at the immediately-prior
*successful* build, not reverting code and redeploying from scratch.

1. **Identify the last known-good deployment.**
   ```bash
   npx vercel ls --prod
   ```
   Look for the most recent entry with status `● Ready` *before* the
   one that introduced the problem — entries with `● Error` were
   failed builds and are never valid rollback targets.

2. **Roll back to it.**
   ```bash
   npx vercel rollback <deployment-url-or-id> --yes
   ```
   This re-aliases production to that build immediately; it does not
   rebuild anything.

3. **Verify the rollback actually resolved it** — re-check
   `/api/v1/health`, and manually re-test whatever the incident was
   (e.g., register a test account, submit a certification exam) on
   the live URL, the same way every phase in this project has
   verified production after a deploy.

4. **Mind the database separately from the code.** This app's
   migrations are additive (new columns/tables, not destructive
   renames-in-place — see the expand/contract note in doc 10 §7), so
   a code rollback is safe against the current schema in every case
   so far. If a future migration ever *removes* something the rolled-
   back code still expects, that migration's own `.down.sql`
   companion (every migration in `drizzle/migrations/` has one, per
   this project's own reversibility rule) is the tool to reach for —
   apply it before or alongside the code rollback, not after.

5. **Record what happened** in this file's incident log below —
   what broke, when, how it was caught, what the rollback target was,
   and the actual root cause once found. The point is the next
   responder (human or otherwise) doesn't have to re-derive it.

## Escalation

No formal on-call rotation exists yet (Phase 20's other named
deliverable, not something an autonomous session can staff). Until
one does, the person who can act on any of the above is whoever has
access to this repo, the Vercel project, and the Supabase project —
today, that's the project owner.

## What this runbook deliberately does not cover

- **A rehearsed rollback.** This document was verified against a real
  deployment history (`npx vercel ls --prod` confirmed multiple
  retained, addressable prior successful builds), but the actual
  `vercel rollback` command has not been executed — doing so against
  the live, currently-serving production deployment is a real,
  user-visible, hard-to-reverse action that belongs in a deliberate,
  explicitly-approved rehearsal with the project owner present, not
  something to trigger unattended while verifying a document.
- **Alerting/paging.** Nothing here pages anyone automatically; see
  "Monitoring" above. Wiring Sentry alerts to a real notification
  channel is future work, not yet built.
- **On-call staffing.** A real, human commitment — Phase 20's own
  listed deliverable, separate from this runbook.

## Incident log

| Date | Severity | What happened | Rollback target (if any) | Root cause | Resolved by |
|---|---|---|---|---|---|
| — | — | — | — | — | *(no incident has occurred yet — this table starts empty, not backfilled with a fabricated entry)* |
