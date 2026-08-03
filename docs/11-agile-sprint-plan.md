# Elrefaee English Academy — Agile Sprint Planning Document

**Status:** Draft for review · **Date:** 2026-08-03 · **Builds on:** [10-development-roadmap.md](10-development-roadmap.md) (the 20 phases this document decomposes into sprints)

**A scoping call stated up front, grounded in Scrum itself rather than just this series' usual discipline:** a real Scrum team does not fully task-break Sprint 17 before Sprint 1 starts — that's not a shortcut, it's **rolling-wave planning / progressive elaboration**, a core Scrum/agile principle: the backlog is fully structured (Epics → Features → User Stories) end to end, but only the next sprint or two gets full task-level decomposition; everything further out stays at story-level until its own Sprint Planning/Refinement session. Applying full 7-field task detail to all ~17 MVP sprints plus V2/V3 would not just be long — it would be **bad Scrum practice**, pretending to know today what a Sprint 14 task list should look like before Sprints 1–13 have taught the team anything. This document therefore: **(1)** builds the complete Epic→Feature→Story backlog for all of V1/V2/V3, so nothing is unscoped; **(2)** fully details Sprints 1–4 (through the start of the Curriculum Engine) with the full task/field treatment requested; **(3)** gives every remaining V1 sprint a real, planning-grade overview (goal, squad, epics touched, point estimate, key risk) rather than fabricated task lists; **(4)** keeps V2/V3 at Epic/Feature/Story granularity, exactly as far out as real release planning should commit today.

**Team & velocity assumptions** (inherited from doc 10, made Scrum-concrete): 2-week sprints; a single Scrum team of 6 for Sprints 1–5; **splitting into two squads at Sprint 6** (Squad Alpha continues the critical path, Squad Beta starts once the team has grown, per doc 10's Phase 8 growth trigger pulled slightly earlier to unblock Phase 10's CMS work, which only depends on Phase 5 and doesn't need to wait for Phase 8); both squads **reunite for the hardening/launch sprints**. Estimated velocity: **~20 story points/sprint** for the 6-person team, **~14–16 points/sprint per squad** once split (two smaller teams, some coordination overhead).

### Table of contents
1. Product Backlog — Epics & Features (V1/V2/V3, complete)
2. Sprint 1 — Project Setup (full detail)
   - Sprint 1.5 — i18n Architecture Retrofit *(inserted 2026-08-03, between Sprints 1 and 2)*
3. Sprint 2 — Authentication (full detail)
4. Sprint 3 — User & Academy Management (full detail)
5. Sprint 4 — Curriculum Engine, Part 1 (full detail)
6. V1 (MVP) Sprint Overview — Sprints 5–17
7. Version 2.0 Backlog
8. Version 3.0 Backlog
9. Critical Path & Optimal Implementation Order

---

## 1. Product Backlog — Epics & Features

| Epic | Maps to (Roadmap phase) | Features |
|---|---|---|
| **E1 — Platform Foundation** | 1–4 | Repo & infra scaffolding · Authentication & sessions · RBAC data model · User profiles & GDPR rights · Academy/tenant scoping |
| **E2 — Curriculum Governance** | 5 | Content lifecycle FSM · Versioning & optimistic locking · Review workflow · Course/unit/lesson structure |
| **E3 — Core Learning Experience** | 6 | Lesson delivery (block flow) · Exercises & retrieval scoring · Spaced-repetition engine · Vocabulary notebook & flashcards · Gamification (XP/streak/badges) |
| **E4 — Assessment & Certification** | 7, 14 | Placement (self-assessment + diagnostic) · Item bank & blueprints · Attempt/scoring engine · Mastery gating · Certificate issuance & verification |
| **E5 — AI-Augmented Learning** | 8, 9 | AI Gateway & provider adapters · AI Tutor · Pronunciation Coach (Phase 1) |
| **E6 — Curriculum Studio** | 10 | Block editor · Vocabulary bulk editor · Review queue UI · Media upload & accessibility gate · Scheduling & version history |
| **E7 — Analytics & Insights** | 11 | Event pipeline · Background aggregation jobs · Student/Teacher/Admin dashboards |
| **E8 — Notifications** | 12 | Event-driven dispatch · Preference management · Email delivery |
| **E9 — Billing** | 13 | `BillingProvider` abstraction · Stripe checkout · Webhook idempotency |
| **E10 — Institutional & Admin Tools** | 15 | Publishing queue console · User/role management · Academy KPI views |
| **E11 — Platform Hardening** | 16, 17, 18 | Caching & performance · Security audit & pen-test remediation · Full test/accessibility coverage |
| **E12 — Launch Readiness** | 19, 20 | Beta cohort operations · Launch operations & on-call |

**Version 2.0 Epics** (Section 7): E13 Full Curriculum Ladder (B2/C1) & Adaptive Placement · E14 Pronunciation Phase 2 · E15 AI Conversation Partner · E16 Institutional Billing Depth.
**Version 3.0 Epics** (Section 8): E17 Curriculum Studio Maturity (Study Plans, Question Generator) · E18 Accredited Certification Partnerships · E19 Kids/Teens Track.

---

## 2. Sprint 1 — Project Setup

**Sprint Goal:** a commit reaches a live preview URL through a working CI/CD pipeline; empty schema-per-context database exists; the Clean Architecture skeleton is provable with one placeholder module.
**Epic/Feature:** E1 / Repo & infra scaffolding. **Capacity:** ~20 pts (single team of 6).

**Technical Tasks**
| Task | Priority | Deps | Pts | Duration | Acceptance Criteria | Risk | Definition of Done |
|---|---|---|---|---|---|---|---|
| Repo scaffold (Next.js App Router, TypeScript, Tailwind/shadcn) | Must | none | 3 | 1d | `npm run dev` serves a themed placeholder page | Low | Merged, README documents local setup |
| Clean Architecture folder skeleton (`modules/{context}/{domain,application,infrastructure,interface}`) | Must | scaffold | 5 | 2d | `identity` module's four layers exist with a trivial pass-through use case, wired via a composition root | Medium — getting this wrong is expensive later (SAD §6.1) | A dependency-cruiser rule blocks a cross-layer import violation in CI |
| Design tokens as CSS custom properties + light/dark/theme-toggle proof | Should | scaffold | 3 | 1d | Toggling `data-theme` swaps every token correctly (doc 07/09 contract) | Low | Verified in both OS-preference and manual-toggle modes |

**Database Tasks**
| Task | Priority | Deps | Pts | Duration | Acceptance Criteria | Risk | DoD |
|---|---|---|---|---|---|---|---|
| Provision Supabase projects (dev/staging/prod) | Must | none | 2 | 0.5d | Three isolated projects exist, credentials in env secrets, never committed | Low | Verified no secret appears in git history |
| Create 11 empty schemas (DDD §1) | Must | Supabase provisioned | 2 | 0.5d | `\dn` lists all 11 schemas in each environment | Low | Migration is idempotent/re-runnable |
| Drizzle migration tooling wired | Must | schemas exist | 3 | 1d | A trivial migration applies cleanly in CI against a throwaway DB | Low | CI step fails the build on a migration error |

**DevOps Tasks**
| Task | Priority | Deps | Pts | Duration | Acceptance Criteria | Risk | DoD |
|---|---|---|---|---|---|---|---|
| GitHub Actions: lint/typecheck/test/build gate | Must | repo scaffold | 3 | 1d | A PR with a lint error is blocked from merge | Low | Branch protection requires the check |
| Vercel preview deploys per PR | Must | repo scaffold | 2 | 0.5d | Every PR gets a working preview URL in its checks | Low | Confirmed on a real test PR |
| Sentry + structured logging skeleton | Should | scaffold | 2 | 0.5d | A thrown error in a test route appears in Sentry with a correlation ID | Low | Alert channel configured (even if unmonitored pre-launch) |
| Dependency/secret scanning enabled in CI | Should | scaffold | 1 | 0.5d | A known-vulnerable test dependency is flagged | Low | Scan runs on every PR, not just `main` |

**QA Tasks**
| Task | Priority | Deps | Pts | Duration | Acceptance Criteria | Risk | DoD |
|---|---|---|---|---|---|---|---|
| CI pipeline self-test | Must | all above | 1 | 0.5d | A deliberately failing test blocks merge; a passing suite doesn't | Low | Documented in the QA runbook stub |

**Documentation Tasks**
| Task | Priority | Deps | Pts | DoD |
|---|---|---|---|---|
| `CONTRIBUTING.md` / local setup guide | Should | scaffold | 1 | A new hire could get `npm run dev` working from this doc alone, untested-but-plausible at this stage |
| ADR-001: Clean Architecture folder convention | Should | skeleton | 1 | Recorded per doc 10 §11's ADR requirement |

*(No Frontend/Backend-feature/AI/API tasks this sprint beyond what's captured above — there is no learner-facing feature yet, by design.)*

**Sprint 1 total: ~28 pts** (slightly over the 20-pt baseline velocity, appropriate for a first sprint where the team is also establishing working agreements — a real, stated first-sprint risk, not an estimating error).

---

## Sprint 1.5 — i18n Architecture Retrofit — *Inserted 2026-08-03, between Sprint 1 and Sprint 2*

**Why this exists as an inserted, unnumbered sprint rather than folded into Sprint 2:** the request to bring i18n infrastructure forward (Blueprint §12's revision) arrived after Sprint 1 was already complete and reviewed. Some of this work is a genuine **retrofit of already-shipped Sprint 1 code** (the app shell's route structure), not new Sprint 2 scope — conflating the two would misrepresent what Sprint 2's own velocity/capacity actually covers. This sprint is deliberately small and infrastructure-only; no new user-facing feature ships here.

**Sprint Goal:** the app shell is locale-routed and RTL-capable, with a working locale switcher, before any further feature work lands on top of it.
**Epic/Feature:** E1 (Platform Foundation) gets a new Feature: Localization Infrastructure. **Capacity:** ~10 pts (small, focused).

**Technical Tasks**
| Task | Priority | Deps | Pts | Duration | Acceptance Criteria | Risk | DoD |
|---|---|---|---|---|---|---|---|
| Install/configure `next-intl`; retrofit `app/` → `app/[locale]/` | Must | Sprint 1 | 5 | 2d | Existing homepage and health-check route both still work; API routes remain outside the locale segment (SAD §5 addendum) | Medium — touches already-shipped, already-reviewed Sprint 1 files | Existing Sprint 1 tests (all 12) still pass unmodified in behavior, updated only where the route path itself changed |
| `proxy.ts` for locale detection (Accept-Language) + explicit override | Must | next-intl installed | 3 | 1d | DDD §3.12's resolution order (explicit pref → header → default) implemented exactly | Low | Unit-tested with faked Accept-Language headers |
| Locale switcher component | Must | tokens (Sprint 1) | 2 | 0.5d | Persists an explicit choice to `user_profiles.preferred_locale` once authenticated, to a cookie pre-auth | Low | Keyboard-accessible, matches doc 07 §5.7 Navigation patterns |

**Database Tasks**
| Task | Priority | Deps | Pts | Duration | AC | Risk | DoD |
|---|---|---|---|---|---|---|---|
| `shared.supported_locales`, `shared.certificate_templates`, `notifications.templates`; `preferred_locale` on `user_profiles` (DDD §3.12) | Must | Sprint 1 schemas | 3 | 1d | Seeded with exactly one row in `supported_locales` (English, `is_default=true`) | Low | RLS policies present (CI-enforced) |

**QA Tasks**
| Task | Priority | Deps | Pts | AC | DoD |
|---|---|---|---|---|---|
| RTL smoke test | Should | switcher | 1 | Force `dir="rtl"` in a test build and confirm no layout breaks under logical-property CSS, even with zero real RTL locale registered | Documented as a repeatable manual check until a real RTL locale exists to test against properly |

**Sprint 1.5 total: ~14 pts.**

**Sprint 2's tasks below are updated in place** (not restated separately) to reflect this: the Login/Register/Forgot Password screens are now built against `next-intl` message keys from the start, never hardcoded English strings — a Should-Have-turned-Must-Have change to Sprint 2's own Frontend Tasks, absorbed into the existing point estimates below rather than inflating them, since translating three short auth screens' strings is genuinely small work once the infrastructure above exists.

---

## 3. Sprint 2 — Authentication

**Sprint Goal:** a user can register, log in (incl. MFA for elevated roles), refresh a session, and RLS provably blocks cross-user access at the database level.
**Epic/Feature:** E1 / Authentication & sessions, RBAC data model. **Capacity:** ~20 pts.

**User Stories**
| ID | Story | Priority | Pts | Acceptance Criteria | DoD |
|---|---|---|---|---|---|
| US-2.1 | As a new user, I want to register with email/password so that I can create an account | Must | 3 | Given valid input, when submitted, an account exists and a session is issued (SRS FR-01) | Passes integration test incl. RLS check |
| US-2.2 | As a returning user, I want to log in and stay logged in across a session refresh so that I don't re-authenticate constantly | Must | 5 | Refresh token rotates on use; a stale, reused refresh token is rejected (SRS §12.8) | Verified via a replay-attack test |
| US-2.3 | As an Instructor, I want to be required to set up MFA so that my elevated account is protected | Must | 3 | MFA challenge blocks session issuance until a valid TOTP code is provided | Manually verified with a real authenticator app |

**Backend Tasks**
| Task | Priority | Deps | Pts | Duration | Acceptance Criteria | Risk | DoD |
|---|---|---|---|---|---|---|---|
| `AuthService` + Supabase Auth integration | Must | Sprint 1 skeleton | 5 | 2d | Login/register/refresh/logout all functional | Medium — first real external-service integration | Unit + integration tests pass |
| `RoleResolver` + roles/permissions/user_roles seed data | Must | AuthService | 3 | 1d | A seeded Student/Instructor/Admin role resolves the correct permission set | Low | Matches SRS §4's matrix exactly |
| Two partial unique indexes on `user_roles` (DDD §3.1's corrected constraint) | Must | schema | 2 | 0.5d | A duplicate platform-wide role grant attempt is rejected by the DB, not just the app | Low — but a real, previously-identified bug class | Verified with a direct-DB test bypassing the app layer |

**Database Tasks**
| Task | Priority | Deps | Pts | Duration | AC | Risk | DoD |
|---|---|---|---|---|---|---|---|
| `identity` schema tables (`user_profiles`, `roles`, `permissions`, `role_permissions`, `user_roles`, `refresh_token_registry`) | Must | Sprint 1 | 5 | 2d | All DDD §3.1 fields/constraints present | Low | RLS policy exists for every table (CI-enforced, SRS §12.2) |

**Frontend Tasks**
| Task | Priority | Deps | Pts | Duration | AC | Risk | DoD |
|---|---|---|---|---|---|---|---|
| Login/Register/Forgot Password screens | Must | design tokens, Sprint 1.5 | 5 | 2d | Matches hi-fi spec §5.2 exactly incl. error/loading/disabled states; every string sourced from a `next-intl` message key, zero hardcoded English text | Low | Passes the axe-core accessibility scan (SRS §14.4) |
| MFA challenge screen | Must | AuthService | 3 | 1d | A wrong code shows an inline error, not a redirect-and-lose-context | Low | Keyboard-only flow tested |

**API Tasks**
| Task | Priority | Deps | Pts | Duration | AC | Risk | DoD |
|---|---|---|---|---|---|---|---|
| `/auth/*` endpoints (API Spec §6.1/§7.1–7.2) | Must | AuthService | 3 | 1d | Matches the OpenAPI contract exactly, incl. the no-enumeration error rule | Low | Contract-tested against the published spec |

**Security Tasks**
| Task | Priority | Deps | Pts | Duration | AC | Risk | DoD |
|---|---|---|---|---|---|---|---|
| Rate limiting on `/auth/login` | Must | API | 2 | 0.5d | 5 failed attempts in 10 min locks temporarily (SRS FR-01) | Low | Verified with an automated brute-force simulation |

**QA Tasks**
| Task | Priority | Deps | Pts | AC | DoD |
|---|---|---|---|---|---|
| RLS cross-user access test suite | Must | schema+RLS | 2 | A direct DB query as User A cannot read User B's `user_profiles` row, even bypassing the API | The single most important test this sprint produces — proves the two-layer model (SAD §15) for real |

**Sprint 2 total: ~28 pts.**

---

## 4. Sprint 3 — User & Academy Management

**Sprint Goal:** profile/settings are usable; GDPR export/delete works end-to-end with referential integrity intact; academy-scoped RLS is proven with a second test academy.
**Epic/Feature:** E1 / User profiles & GDPR rights, Academy/tenant scoping. **Capacity:** ~20 pts.

**User Stories**
| ID | Story | Priority | Pts | AC | DoD |
|---|---|---|---|---|---|
| US-3.1 | As a user, I want to edit my profile and preferences so the app reflects who I am | Must | 3 | Changes persist and apply immediately (Design System §8's Settings screen) | Accessibility prefs verified to actually re-theme the app |
| US-3.2 | As a user, I want to request my data or delete my account so I control my data (GDPR) | Must | 5 | Deletion anonymizes PII without breaking any FK reference (DDD §3.11) | A test certificate/audit row remains valid post-anonymization |
| US-3.3 | As a Super Admin, I want academies to exist as a real, isolated data boundary so the platform is ready for future verticals | Should | 3 | A second, throwaway test academy's data is provably isolated via RLS | Verified with a direct cross-academy query attempt |

**Backend/DB/API Tasks (combined — a lighter sprint by design, catching up any Sprint 1–2 spillover)**
| Task | Priority | Deps | Pts | Duration | AC | Risk | DoD |
|---|---|---|---|---|---|---|---|
| `/users/*` service + endpoints | Must | Sprint 2 | 3 | 1d | Matches API Spec §6.2 | Low | — |
| Anonymization mechanism | Must | user_profiles | 5 | 2d | `deleted_at`/tombstone fields correctly overwrite PII, FK targets survive | Medium — first real test of a genuinely tricky data-integrity requirement | Tested against a user with an existing certificate reference (simulated) |
| `academy.academies` table + seed "English Academy" | Must | Sprint 1 schema | 2 | 0.5d | Present in all environments | Low | — |
| `/academies` (list-only) endpoint | Should | academies table | 1 | 0.5d | Super-Admin-only, per authorization matrix | Low | — |

**Frontend Tasks**
| Task | Priority | Deps | Pts | AC | DoD |
|---|---|---|---|---|---|
| Profile + Settings screens | Must | tokens, `/users/*` | 5 | Matches wireframe §4.19–4.20, hi-fi §6 | Every accessibility control (font size, contrast, motion, dyslexia font) is present and functional, not stubbed |

**QA Tasks**
| Task | Priority | Deps | Pts | AC | DoD |
|---|---|---|---|---|---|
| GDPR deletion end-to-end test | Must | anonymization | 2 | A test user's export + delete both complete within the stated SLA (SRS §3) | Documented as a repeatable manual+automated test for future audits |

**Sprint 3 total: ~19 pts** (a deliberately lighter sprint — good place for any Sprint 1–2 spillover or team-process retrospective time).

---

## 5. Sprint 4 — Curriculum Engine, Part 1

**Sprint Goal:** the Content Item governance envelope and its full lifecycle state machine exist and are provably correct, even before any authoring UI exists — engine before interface, per Blueprint §5's explicit sequencing call.
**Epic/Feature:** E2 / Content lifecycle FSM, Versioning & optimistic locking. **Capacity:** ~20 pts. *(Phase 5 spans two sprints; Part 2 is Sprint 5, covered at overview level in Section 6 since by Scrum's own rolling-wave principle, Sprint 5's exact task list is refined at the end of Sprint 4, not predicted now — its Epic/Feature scope is already fully known, which is what matters at this distance.)*

**User Stories**
| ID | Story | Priority | Pts | AC | DoD |
|---|---|---|---|---|---|
| US-4.1 | As a Curriculum Designer, I want to create a Draft content item via API so I can start authoring before the Studio UI exists | Must | 5 | A Draft is created with a valid `content_items` + first `content_versions` row | Matches DDD §3.3 exactly |
| US-4.2 | As a Content Reviewer, I want to approve or request changes on a Draft so quality is gated before publish | Must | 5 | A `changes_requested` decision requires ≥1 comment (SRS §2's validation rule) and returns the item to Draft | Reviewer cannot approve their own authored Draft (a real business rule worth stating even at API-only stage) |
| US-4.3 | As an Academy Admin, I want to publish an Approved item atomically so learners never see a half-updated state | Must | 8 | Publish is one transaction: pointer update + audit write + (stubbed) invalidation event — all-or-nothing | A forced mid-transaction failure test proves no partial state results |

**Backend Tasks**
| Task | Priority | Deps | Pts | Duration | AC | Risk | DoD |
|---|---|---|---|---|---|---|---|
| `ContentGovernanceService` — the lifecycle FSM | Must | Sprint 1 skeleton | 8 | 3d | Every transition in SAD §16's diagram is implemented and guarded by role permission | High — the most structurally important service in the whole system | Every illegal transition attempt is rejected with a specific, tested error |
| Optimistic-locking mechanism (`base_version_id` check) | Must | content_versions | 5 | 2d | A stale-based save is rejected with a diff-capable conflict response | Medium | Tested with two genuinely concurrent simulated edits |

**Database Tasks**
| Task | Priority | Deps | Pts | Duration | AC | Risk | DoD |
|---|---|---|---|---|---|---|---|
| `content_items`, `content_versions`, `content_reviews` tables | Must | Sprint 1 schema | 5 | 2d | Matches DDD §3.3 incl. the cross-table media-gate note | Low | RLS policies present |

**API Tasks**
| Task | Priority | Deps | Pts | Duration | AC | Risk | DoD |
|---|---|---|---|---|---|---|---|
| `/cms/content-items/*` lifecycle endpoints | Must | ContentGovernanceService | 5 | 2d | Matches API Spec §6.15/§7.3's publish deep-dive, incl. required `Idempotency-Key` on publish | Medium | Contract-tested |

**QA Tasks**
| Task | Priority | Deps | Pts | AC | DoD |
|---|---|---|---|---|---|
| Lifecycle FSM exhaustive-transition test suite | Must | ContentGovernanceService | 3 | Every legal and illegal transition pair is tested | This is the sprint's highest-value test investment — a bug here corrupts the foundation every later phase builds on |

**Sprint 4 total: ~29 pts** (over baseline — justified given this is the roadmap's own "Very High complexity" phase, doc 10 §4; the team should expect this sprint to run hot and Sprint 5 to absorb any spillover).

---

## 6. V1 (MVP) Sprint Overview — Sprints 5–17

Per this document's opening scoping call: goal, squad, epics, point estimate, and the single most important risk — not fabricated task lists for sprints 8+ weeks away.

| Sprint | Squad | Roadmap phase(s) | Sprint Goal | Epics | Est. pts | Key risk |
|---|---|---|---|---|---|---|
| 5 | Single team | 5 (cont.) | Content Studio's *engine* is feature-complete; Curriculum team begins real pilot-content authoring against it | E2 | ~20 | Scope creep into UI (explicitly out of scope until Sprint 12+) |
| 6 | **Splits into Alpha/Beta** | Alpha: 6 begins · Beta: 10 begins | Alpha: first learner can open a real lesson. Beta: block editor MVP exists | E3 (Alpha), E6 (Beta) | ~16 each | Coordinating two squads for the first time — a real process risk, not just technical |
| 7 | Alpha/Beta | 6 (cont.) / 10 (cont.) | Alpha: exercises + retrieval scoring live. Beta: vocabulary bulk editor + media/accessibility gate live | E3, E6 | ~16 each | — |
| 8 | Alpha/Beta | 6 (cont., finish) / 9 (Payments) | Alpha: spaced-repetition + vocabulary notebook complete — Phase 6 exit criteria met. Beta: Stripe checkout live (test mode) | E3, E9 | ~16 each | Content-team pilot unit must be ready for Alpha's real end-to-end validation (doc 10's flagged cross-functional risk) |
| 9 | Alpha/Beta | 7 begins / 10 (cont., finish) | Alpha: item bank + attempt/scoring engine live. Beta: CMS review-queue UI + version history complete — Phase 10 exit criteria met | E4, E6 | ~16 each | Adaptive-testing scope creep (Alpha) — MVP uses the simple diagnostic only |
| 10 | Alpha/Beta | 7 (cont., finish) / 8 begins | Alpha: mastery gating + placement flow complete. Beta: AI Gateway + first provider adapter live | E4, E5 | ~16 each | First external AI-vendor integration (Beta) |
| 11 | Alpha/Beta | 14 / 8 (cont., finish) | Alpha: certificate issuance + public verification live. Beta: AI Tutor fully live in Lesson View — Phase 8 exit criteria met | E4, E5 | ~14 each | Legal sign-off on disclaimer text (Alpha) — cross-functional, not engineering-controlled |
| 12 | Alpha joins Beta | 9 / 11 begins | Combined: Pronunciation Phase 1 live; Analytics event pipeline + background-job runner stood up | E5, E7 | ~16 (merged squad, or split differently — refined at Sprint 11's planning) | First real background-job infra (SAD §14) |
| 13 | Combined/split (refined later) | 11 (cont., finish) / 12 | Analytics dashboards live (Student/Teacher/Admin) — Phase 11 exit criteria met; Notifications dispatcher live | E7, E8 | ~16 | — |
| 14 | Combined/split | 15 | Admin Dashboard complete — publishing queue, user/role mgmt, academy KPIs, all through the UI | E10 | ~14 | Composing already-built pieces — lower novelty, lower risk |
| 15 | Full reunited team | 16 | Redis caching live; DB index audit against real Phase 5–15 usage; load-test results meet SRS §3 targets | E11 | ~18 | Premature-optimization scope creep beyond what Blueprint §16 actually calls for at this stage |
| 16 | Full team | 17 | Full OWASP audit re-verified; pen-test commissioned and findings triaged; secrets-rotation policy operationalized | E11 | ~16 + external pen-test lead time | Pen-test findings are unknown until found — this sprint's real duration has the widest uncertainty band in the whole plan |
| 17 | Full team | 18 | Full E2E suite; live-spec WCAG 2.2 AA audit (closing the gap flagged since the SRS); ≥80% coverage on learning-loop/scoring logic verified | E11 | ~18 | An accessibility finding expensive enough to require rework, not just a fix |

*(Phases 19–20, Beta and Launch, are operational rather than sprint-structured in the usual sense — Section 9 covers them as part of the critical-path narrative rather than forcing them into an artificial two-week-sprint shape a real beta program doesn't actually follow.)*

---

## 7. Version 2.0 Backlog

Epic/Feature granularity only — deliberately not sprint-planned yet (this is real release-planning distance, not near-term work):

- **E13 — Full Curriculum Ladder & Adaptive Placement:** B2/C1 content production (Curriculum team, parallel non-engineering track) · true multi-stage adaptive placement routing, now calibratable against V1's real attempt-volume data (Blueprint §6/§19's deferred item, its trigger finally met) · item-bank difficulty recalibration.
- **E14 — Pronunciation Phase 2:** professional phoneme-level scoring adapter (Azure or equivalent, evaluated at build time) registered in the existing `PronunciationEngine` port — an adapter swap, not a rebuild, precisely because of how Phase 9/Sprint-11-era work was architected · **this is also the natural point to finally resolve the long-carried-forward accessibility gap** (no path for a learner who cannot produce spoken audio) — flagged here as V2's most overdue open item, not newly discovered.
- **E15 — AI Conversation Partner:** new AI Gateway module, reusing the adapter/moderation/eval pattern established in V1 · highest AI-safety-review priority of any module (Blueprint §9), given its open-ended surface.
- **E16 — Institutional Billing Depth:** one-time-purchase and B2B/institutional plan types beyond V1's single subscription plan · the `Organizations` vs. `Academy` conceptual distinction flagged in the API Specification (§6.18) gets resolved here, with real product input, before it's built rather than guessed.

---

## 8. Version 3.0 Backlog

- **E17 — Curriculum Studio Maturity:** Personalized Study Plans and Question Generator AI modules (SRS §7's Should/Could-Have set) · both follow the established "AI output always lands as a Draft" hard rule, no exception.
- **E18 — Accredited Certification Partnerships:** activating the `issuer` field's pluggability (Blueprint §8/DDD §3.4, unused but present since V1) for a real third-party accredited partner.
- **E19 — Kids/Teens Track:** the largest V3 epic by far — new pedagogy (Blueprint §1), COPPA-driven data-model additions (guardian-linked accounts, building on the roles-as-data extension point kept open since the SAD), a new UI theme variant, new gamification intensity calibration. **Explicitly not estimated at any finer grain here** — this epic needs its own discovery/blueprint-style pass before it can even be broken into Features responsibly, consistent with the "architect for it, don't build it yet" discipline this entire document series has held since the very first Master Blueprint.

---

## 9. Critical Path & Optimal Implementation Order

**Critical path (unchanged from doc 10, now sprint-numbered):** Sprint 1 (Setup) → 2 (Auth) → 4–5 (Curriculum Engine) → 6–8 Alpha (Lesson Engine) → 9–10 Alpha (Assessment Engine) → 11 Alpha (Certificates) → 15 (Performance) → 16 (Security) → 17 (Testing) → Beta → Launch.

**Optimal implementation order, and why it minimizes both technical debt and lost time:**
1. **Engine before interface, every time** (Sprint 4's Curriculum Engine before Sprint 9's CMS UI; Sprint 4's governance API before any Studio polish) — building UI against an unstable data model is the single most common source of throwaway frontend work in a project shaped like this one; this order was set in doc 10 and this sprint plan holds the line at the task level too.
2. **Split the team only once there's genuinely parallel, low-coupling work** (Sprint 6, once Curriculum Engine is done) — splitting earlier would mean Squad Beta blocked and idle; splitting later wastes the parallelization the dependency graph (doc 10 §3) actually offers.
3. **Sequence Squad Beta's own backlog by *technical* readiness (CMS as soon as Phase 5 is done), not just phase-number order** — CMS (Phase 10) doesn't need Phase 6/7/8/9 at all; scheduling it right after the split (Sprint 6) rather than waiting until "its turn" in the roadmap's numbering is the one concrete deviation this sprint plan makes from doc 10's phase order, and it's a deliberate improvement, not an inconsistency — flagged explicitly rather than silently changed.
4. **Never let hardening (Sprints 15–17) start early** — Performance/Security/Testing all need the *whole* surface to be meaningful (doc 10 §2's stated dependency); starting early would mean re-doing that work as later features land, which is technical debt by definition, not just inefficiency.
5. **The technical-debt registry (doc 10 §10) governs V2/V3 sequencing directly** — E13's adaptive placement, E14's Pronunciation Phase 2, and E16's billing depth are ordered in Version 2.0 specifically because that's when their stated revisit triggers actually fire (real attempt-volume data, post-revenue, real B2B demand) — not an arbitrary "V2 comes after V1" default.

**Net assessment:** a complete, Scrum-legitimate backlog for the whole project, full task-level Sprint Planning detail for the four sprints a real team would actually need it for today, and an honest rolling-wave horizon for everything beyond that — rather than a false-precision task list for sprints that are, realistically, eight months and a great deal of learned context away. No implementation code was written. Ready for your review — awaiting approval before implementation tasks are generated.
