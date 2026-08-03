# Elrefaee English Academy — Software Requirements Specification (SRS)

**Status:** Draft for review · **Date:** 2026-08-03 · **Standard:** Structured per IEEE 29148 principles · **Builds on:** [00-master-blueprint.md](00-master-blueprint.md) (architecture & rationale), [01-educational-design-document.md](01-educational-design-document.md) (pedagogy), [02-product-requirements-document.md](02-product-requirements-document.md) (product/business requirements)

**How this document differs from its three predecessors:** the Blueprint, EDD, and PRD explain *why* and *what for*. This SRS specifies *exactly how the system must behave* — precisely enough that Software, AI, DevOps, Database, Frontend, Backend, QA, Security, Product, and UX engineers can all build against it without re-deriving a decision or guessing at an edge case. Where a decision's rationale matters, it is cited back to its source document rather than re-argued here — an SRS states requirements, it doesn't re-litigate them.

### Table of contents
1. System Overview
2. Functional Requirements (FR-01 – FR-20)
3. Non-Functional Requirements
4. User Roles & Permissions
5. Database Requirements
6. API Requirements
7. AI Architecture
8. CMS Architecture
9. Assessment Architecture
10. Learning Engine
11. Analytics Architecture
12. Security Architecture
13. DevOps Requirements
14. Quality Assurance
15. Future Extensibility
16. Engineering Cross-Functional Review

---

## 1. System Overview

### 1.1 Purpose
Elrefaee English Academy is a web-based (mobile-first responsive) platform delivering CEFR-mapped American English instruction (Pre-A1→C1 target, B1 at MVP per PRD §12), mastery-gated assessment, AI-augmented tutoring/feedback, and teacher/institutional management, built on a governed content pipeline that guarantees every published item has passed pedagogical review (EDD §19).

### 1.2 Scope
In scope for this SRS: the full system as scoped by PRD §5 (Must/Should/Could) for MVP through Version 2. Out of scope (per PRD §5 Won't Have, Blueprint §18): C2 content, kids/teens flows, multi-academy product surface, accredited third-party certification integration, translated UI locales. These remain **architected for, not built** — every section below that touches a boundary these items would cross states the extension point explicitly rather than silently precluding it.

### 1.3 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Client (Next.js App Router, React, TypeScript) — Vercel Edge    │
│  Student / Instructor / Reviewer / Designer / Admin / SuperAdmin │
│  surfaces, role-gated at the route layer                         │
└───────────────┬─────────────────────────────────┬───────────────┘
                │ REST /api/v1 (§6)                │ Realtime (Supabase)
┌───────────────▼─────────────────┐   ┌────────────▼───────────────┐
│  Application Service Layer       │   │  Background Jobs           │
│  (Next.js Route Handlers +       │   │  (Trigger.dev / Inngest)   │
│  service modules — thin API,     │   │  scheduled publish, async  │
│  logic lives in services, §6.1)  │   │  AI scoring, analytics agg  │
└───────────────┬──────────────────┘   └────────────┬───────────────┘
                │                                     │
┌───────────────▼─────────────────────────────────────▼───────────┐
│  Supabase: Postgres (RLS) + Auth + Storage + Realtime            │
│  Drizzle ORM · Redis (Upstash, from ~10k users, Blueprint §16)   │
└───────────────┬──────────────────┬────────────────┬─────────────┘
                │                  │                │
     ┌──────────▼───────┐ ┌────────▼────────┐ ┌─────▼─────────┐
     │  AI Gateway (§7)  │ │  PostHog          │ │  Stripe        │
     │  → provider        │ │  (product +       │ │  (Billing      │
     │  adapters          │ │  learning events) │ │  Provider)     │
     └────────────────────┘ └───────────────────┘ └────────────────┘
```

### 1.4 System Context
- **Learners, Instructors, Reviewers, Designers, Admins** interact exclusively through the web client — no separate native app in scope for this SRS.
- **The Curriculum Studio** (Blueprint §5) is a role-gated subset of the same client application, not a separate system.
- **Background jobs** handle anything that must not block a request/response cycle: scheduled publishing, AI-heavy scoring, nightly analytics aggregation (Blueprint §16 scaling trigger).

### 1.5 External Systems
| System | Purpose | Integration mode |
|---|---|---|
| Supabase (Postgres, Auth, Storage, Realtime) | Core data, identity, file storage | Direct SDK + Drizzle over Postgres connection |
| AI providers (behind the AI Gateway, §7) | Tutor, Writing Coach, Conversation Partner, Pronunciation Phase 2, etc. | Provider-specific adapters, never called directly from app code |
| Stripe | Billing | `BillingProvider` interface (Blueprint §17) |
| Resend | Transactional email | REST API |
| PostHog | Product + learning analytics ingestion | Client + server SDK |
| Sentry | Error tracking | SDK instrumentation |
| Trigger.dev / Inngest | Background job orchestration | SDK, decided at Phase 3 (Blueprint §19) |
| Upstash Redis | Caching (from ~10k users) | REST/SDK client |

### 1.6 Constraints
- Must satisfy WCAG 2.2 AA (PRD §8, Blueprint §11).
- Must satisfy the two-layer RBAC+RLS enforcement rule (Blueprint §15) — no exceptions, including for internal/admin tooling.
- All content-bearing entities are data, never hardcoded (Blueprint §17's standing rule) — this SRS's database and CMS sections are the concrete realization of that rule.
- No AI Gateway module may auto-publish content; all AI output enters as a Draft (Blueprint §9's hard rule, restated in FR-13/14/15 below).
- Single-region deployment at MVP (Blueprint §16); NFRs (§3) must not preclude later multi-region expansion.

### 1.7 Assumptions
- Supabase, Vercel, Stripe, and the chosen AI providers remain available and within their published SLAs; provider-specific outages are mitigated by the AI Gateway's fallback strategy (§7.6), not assumed away.
- Initial launch targets a single language interface (English) per PRD §5 — the i18n scaffolding (§1.6, Blueprint §12) exists but is not populated with a second locale at MVP.
- Content volume at MVP (Pre-A1→B1) is small enough that the Assessment Engine's item bank does not yet require true IRT calibration (Blueprint §6) — this SRS specifies the simpler multi-stage adaptive routing accordingly.

---

## 2. Functional Requirements

Each requirement follows: **ID · Description · Actors · Preconditions · Postconditions · Main Flow · Alternative Flow(s) · Exception Flow(s) · Validation Rules · Business Rules · Dependencies · Priority (MoSCoW, PRD §5) · Acceptance Criteria.**

---

### FR-01 Authentication
**Description:** Establishes and maintains a verified, role-resolved user session.
**Actors:** All roles; System (session management).
**Preconditions:** User has a valid email or OAuth identity.
**Postconditions:** An authenticated session exists with a resolved role/permission set (§4).

**Main Flow:**
1. User submits credentials (email/password, magic link request, or OAuth) or an MFA code where required.
2. System validates against Supabase Auth.
3. System issues a short-lived JWT + refresh token.
4. System resolves the user's role(s) from `user_roles` (§5) and attaches permission scope to the session.

**Alternative Flow:** Magic-link flow — system emails a one-time link (via Resend) in place of steps 1–2's password check; link expires after 15 minutes, single-use.

**Exception Flow:** Invalid credentials → generic "invalid email or password" (never reveal whether the email exists, to prevent enumeration) → failed-attempt counter incremented → account temporarily locked after 5 failures within 10 minutes, with a rate-limited unlock-via-email path. Expired session mid-action → client attempts silent refresh-token exchange before falling back to a re-auth prompt, preserving in-progress state (FR-05's exercise-resume requirement).

**Validation Rules:** Email format RFC 5322-compliant; password minimum 10 characters with at least one non-alphabetic character; MFA code is a 6-digit TOTP within a 30-second window ±1 step of drift tolerance.

**Business Rules:** MFA is mandatory for Instructor, Content Reviewer, Curriculum Designer, Academy Admin, Super Admin roles (Blueprint §15); optional but encouraged for Students. No cognitive-function-test-only authentication (WCAG 2.2 Accessible Authentication — Blueprint §11).

**Dependencies:** §4 (Roles), §12 (Security).
**Priority:** Must Have.

**Acceptance Criteria:**
- Given valid credentials and a role requiring MFA, when the user submits a correct MFA code, then a session is established with that role's permission set attached.
- Given 5 failed login attempts within 10 minutes, when a 6th attempt is made, then the account is temporarily locked and the user is offered an unlock-via-email path.
- Given an in-progress exercise and an expired session, when a silent refresh succeeds, then the exercise state is unaffected.

---

### FR-02 Profiles
**Description:** Represents user identity, role context, and preferences.
**Actors:** All roles.
**Preconditions:** Authenticated session (FR-01).
**Postconditions:** Profile data available to Dashboard (FR-03), Analytics (FR-16), AI Gateway (§7) as context.

**Main Flow:** 1. User completes/edits profile fields (name, current level, goals, notification prefs, accessibility prefs). 2. System persists to `users`/`user_profiles`. 3. Downstream systems read profile via the service layer (never direct client DB access, §6).

**Alternative Flow:** First-login onboarding pre-populates profile fields from placement-test results (FR-08 dependency) rather than requiring manual entry.

**Exception Flow:** A user attempts to hold conflicting simultaneous states (e.g., set current level below their certified level) → system allows it (a learner may legitimately want to review) but flags it distinctly from an actual re-placement in analytics.

**Validation Rules:** Display name 1–60 chars, no control characters; native-language field optional (Blueprint §12 — reserved for future glossing, not required at MVP).

**Business Rules:** A single user account may hold multiple roles (Blueprint §13.2) — profile is one record with a role-scoped view layer, never duplicate accounts per role.

**Dependencies:** FR-01, §4.
**Priority:** Must Have.

**Acceptance Criteria:**
- Given a user with both Instructor and Content Reviewer roles, when they log in, then they see a single account with both role-scoped dashboard entry points, not two separate logins.

---

### FR-03 Dashboard
**Description:** Role-specific primary landing surface (Student / Instructor / Admin — three distinct views per PRD §7.3).
**Actors:** Student, Instructor, Academy Admin, Super Admin.
**Preconditions:** Authenticated session; role resolved.
**Postconditions:** User sees exactly one primary recommended action plus supporting context, scoped to their role and (for Instructor/Admin) their academy/cohort.

**Main Flow:** 1. Client requests dashboard data. 2. Service layer aggregates from Learning Analytics (§11), Content Governance state (§8), Assessment Engine (§9), scoped by RLS to the requesting user's permissions. 3. Client renders role-specific view.

**Alternative Flow:** New user with zero history → explicit onboarding empty-state (placement CTA for Students, "no cohorts yet" guided setup for Instructors) — never a blank/broken render.

**Exception Flow:** Lapsed/overdue subscription → dashboard renders a clear billing-status banner and restricts access per the plan's actual entitlements, never a silent full-feature degrade that looks like a bug.

**Validation Rules:** N/A (read-heavy aggregation view).

**Business Rules:** A Student never sees another student's data; an Instructor sees only their assigned cohort(s); enforced redundantly at RLS + application layer (§12).

**Dependencies:** §11, §8, §9, §4.
**Priority:** Must Have.

**Acceptance Criteria:**
- Given a brand-new Student account, when they first log in, then they see a placement-test CTA, not an empty lesson list.
- Given an Instructor assigned to Cohort A only, when they view their dashboard, then no data from Cohort B is visible or fetchable via the API.

---

### FR-04 Courses (Academy/Level container)
**Description:** Top-level curriculum container mapping to one CEFR level within an academy (Blueprint §18's `Academy` entity).
**Actors:** Student (consumes), Curriculum Designer (structures), Academy Admin (publishes).
**Preconditions:** Academy exists (seeded: "English Academy"); at least one Published unit exists at the target level.
**Postconditions:** A navigable, prerequisite-gated course structure is exposed to placed learners.

**Main Flow:** 1. Learner's placement (FR-08) or current progress determines their entry course. 2. System resolves the ordered unit sequence for that course from Published content only.

**Alternative Flow:** A learner placed mid-course by the adaptive test enters directly at the appropriate unit, with prior units marked available-but-not-required rather than locked.

**Exception Flow:** A learner fails a level-end assessment (FR-09 dependency) → system routes to a remediation path (targeted review of the failed skill's units), not a full-level restart by default.

**Validation Rules:** A course cannot be entered without satisfying its prerequisite mastery gate (previous level's certification), except via explicit adaptive-placement override.

**Business Rules:** Only `Published` content is ever exposed to Students (Blueprint §4.1) — enforced at the query layer, not just UI filtering.

**Dependencies:** §8 (Content Governance), §9 (Assessment Engine).
**Priority:** Must Have.

**Acceptance Criteria:**
- Given a learner who has not certified A2, when they attempt to directly navigate to a B1 course URL, then access is denied server-side (not just hidden in the UI).

---

### FR-05 Lessons
**Description:** The atomic teaching unit following the canonical structure (EDD §5): warm-up → presentation → controlled practice → communicative task → wrap-up.
**Actors:** Student.
**Preconditions:** Lesson's Content Item is `Published`; learner has access to its parent unit (FR-06).
**Postconditions:** Completion event recorded; vocabulary/grammar items queued into spaced repetition (FR-11); XP awarded (FR-18).

**Main Flow:** 1. Learner opens lesson. 2. Client renders each structural block in sequence. 3. Learner completes controlled-practice and communicative-task exercises (FR-07). 4. On wrap-up, system queues target vocabulary/grammar into the review scheduler and marks lesson complete.

**Alternative Flow:** Learner exits mid-lesson → system persists exact block/exercise position → on return, resumes at that exact point (not lesson start).

**Exception Flow:** Network drop mid-exercise-submission → client retries with exponential backoff against a locally-queued submission; if unresolved after a bounded retry window, the exercise is marked "pending sync" visibly rather than silently lost (ties to NFR reliability, §3).

**Validation Rules:** A lesson cannot reach `Published` status (enforced upstream at §8, not here) without a CEFR-traceable objective and all five structural blocks present (EDD §19 checklist).

**Business Rules:** Lesson content is immutable once a learner is mid-lesson in a specific version — if a Curriculum Designer publishes a new version while a learner is active, the learner finishes on the version they started (resolved via the version-pointer model, §5.6).

**Dependencies:** FR-06, FR-07, FR-11, FR-18, §8.
**Priority:** Must Have.

**Acceptance Criteria:**
- Given a learner mid-lesson, when their session is interrupted and they return within 24 hours, then they resume at their exact last position.
- Given a lesson is republished mid-session, when the learner completes it, then their completion references the version they started, not the newer one.

---

### FR-06 Units
**Description:** Thematic lesson grouping ending in a mastery checkpoint.
**Actors:** Student, Curriculum Designer.
**Preconditions:** Unit's Content Item is `Published`.
**Postconditions:** Unit-completion status recorded; checkpoint result feeds the mastery gate.

**Main Flow:** 1. Learner completes constituent lessons. 2. Learner attempts the unit-end checkpoint quiz (FR-08/§9). 3. On pass, unit marked complete and next unit unlocked.

**Alternative Flow:** *(Open decision, PRD §15 item 1)* — if skip-ahead is approved, a learner may attempt the checkpoint before completing every lesson; this SRS specifies both code paths behind a feature flag pending that product decision, defaulting to **require-full-completion** until decided.

**Exception Flow:** Checkpoint failure → system surfaces exactly which skill(s) fell below threshold and recommends specific remediation lessons, not a generic "try again."

**Validation Rules:** Checkpoint pass threshold is defined per the unit's `test_blueprint` (§9), not hardcoded per unit.

**Business Rules:** A unit's lessons follow the EGP-informed spiral sequence (EDD §6) — the platform does not enforce spiral correctness at runtime (that's a content-authoring-time concern, §8), only sequencing and gating.

**Dependencies:** FR-05, §9.
**Priority:** Must Have.

**Acceptance Criteria:**
- Given the skip-ahead flag is off (default), when a learner has not completed every lesson in a unit, then the checkpoint is not accessible.

---

### FR-07 Exercises
**Description:** In-lesson retrieval-based practice items (EDD §16).
**Actors:** Student.
**Preconditions:** Parent lesson is active/open.
**Postconditions:** Correctness + latency event recorded; immediate formative feedback shown.

**Main Flow:** 1. System presents prompt (typed/spoken/drag-drop/selection). 2. Learner responds. 3. System evaluates. 4. System shows immediate feedback (not deferred).

**Alternative Flow:** Drag-and-drop exercise → system additionally exposes a fully keyboard-operable equivalent interaction (select-then-place via keyboard, WCAG 2.2 Dragging Movements — Blueprint §11), never drag-only.

**Exception Flow:** Free-text response with a near-miss typo → fuzzy-matching applied per the tolerance policy *(open decision, PRD §15 item 4 — this SRS specifies the mechanism: Levenshtein distance ≤ 1 for words ≤6 characters, ≤2 for longer, tunable per exercise via configuration, not hardcoded per instance)* rather than exact-string-only comparison.

**Validation Rules:** Response payload validated against the exercise's declared input type (text/audio/selection-index) before evaluation; malformed payloads rejected with a specific error, not silently scored as incorrect.

**Business Rules:** Multiple-choice format only where EDD §16 justifies it (Pre-A1 scaffolding or diagnostic isolation) — flagged at content-authoring time (§8), not runtime-enforced here.

**Dependencies:** FR-05, §11 (event emission).
**Priority:** Must Have.

**Acceptance Criteria:**
- Given a free-text answer with a single-character typo on a word under 6 characters, when submitted, then it is marked correct.
- Given a drag-and-drop matching exercise, when accessed via keyboard only, then every match can be completed without a pointer device.

---

### FR-08 Quizzes (Checkpoint/Placement delivery)
**Description:** Assembles and delivers Assessment Engine test instances (§9) within the learning flow.
**Actors:** Student.
**Preconditions:** A `test_blueprint` exists and is eligible for the learner (unit/level reached, or new-account placement flow).
**Postconditions:** Attempt + per-skill result recorded (§9); feeds mastery gating (FR-06) and, at level-end, certification (FR-09).

**Main Flow:** 1. System assembles items per the blueprint's rules from the item bank. 2. Learner attempts items within the blueprint's time limit (if any). 3. System scores per §9's scoring engine. 4. Result stored, gate/certification logic triggered.

**Alternative Flow:** Placement quiz specifically — precedes the self-assessment grid step (Blueprint §3.5); MVP uses a fixed diagnostic, not full adaptive routing (Blueprint §19).

**Exception Flow:** Learner abandons mid-attempt → attempt marked `incomplete`, does not count against attempt-limit policies (§9.6), resumable within a defined window (e.g., 24 hours) after which it expires and must restart.

**Validation Rules:** Item randomization must draw only from items at the blueprint's declared level/skill tags (§9.5) — a validation failure here (e.g., a B2 item leaking into an A2 blueprint) is a release-blocking bug class, not a soft warning.

**Business Rules:** Practice quizzes: unlimited attempts. Certification exams: rate-limited per §9.6's cooldown policy.

**Dependencies:** §9.
**Priority:** Must Have.

**Acceptance Criteria:**
- Given an abandoned quiz attempt within its resume window, when the learner returns, then they resume rather than restart.
- Given a certification exam already attempted and failed, when the learner tries again within the cooldown period, then the attempt is blocked with a clear message stating when they may retry.

---

### FR-09 Vocabulary (Notebook, Review Queue)
**Description:** Learner-facing vocabulary acquisition and spaced-repetition surface.
**Actors:** Student.
**Preconditions:** At least one lesson completed, or a word manually bookmarked.
**Postconditions:** Review queue reflects current due items per the FSRS-style scheduler (§10.2).

**Main Flow:** 1. Lesson completion auto-populates notebook entries. 2. Scheduler computes next `due_at` per entry after each review response. 3. Dashboard (FR-03) surfaces due-today count and queue.

**Alternative Flow:** Manual bookmark of a word encountered outside its "home" lesson (e.g., in a reading passage) → added to notebook flagged `stretch` if above current level, doesn't count toward level-mastery calculations (§11).

**Exception Flow:** A word taught with multiple senses → each sense reviewed as an independent scheduler entry (EDD §7) — a correct recall of one sense does not mark other senses of the same headword as reviewed.

**Validation Rules:** A review response must map to one of the scheduler's defined recall-quality buckets (e.g., again/hard/good/easy) — free-form recall confidence isn't accepted as scheduler input.

**Business Rules:** Review scheduling is strictly per-learner, per-item — no global/shared schedule (EDD §15).

**Dependencies:** §10.2, FR-05.
**Priority:** Must Have.

**Acceptance Criteria:**
- Given two learners who studied the same word on the same day but recalled it differently on review, when their next due dates are computed, then they differ according to each learner's own recall history.

---

### FR-10 Pronunciation
**Description:** Speaking-practice recording and feedback, phased (Blueprint §10).
**Actors:** Student.
**Preconditions:** Microphone permission granted; exercise specifies a target phrase/word.
**Postconditions:** Score/feedback object stored; feeds pronunciation-trend analytics (§11).

**Main Flow:** 1. Learner records audio. 2. Client uploads to Storage. 3. AI Gateway routes to the configured `PronunciationEngine` adapter (Phase 1: Web Speech API; Phase 2: dedicated engine). 4. Score/feedback returned and displayed; unlimited re-attempts.

**Alternative Flow:** Browser lacks Web Speech API support → system falls back to record/playback-only with explicit messaging that automated scoring is unavailable, not a silent failure.

**Exception Flow:** Poor audio quality (below a defined confidence threshold from the engine) → system prompts a retry in a quieter environment rather than returning a misleadingly low score.

**Validation Rules:** Audio file format/duration constraints enforced client-side before upload (e.g., max 60 seconds per attempt, standard codec) to bound storage/processing cost.

**Business Rules:** A learner who cannot produce spoken audio at all (accessibility case) must have an alternative assessment path — flagged as a genuine open design gap (§16 review) requiring a Phase 2/UX-phase decision, not silently unaddressed.

**Dependencies:** §7 (AI Gateway), Storage.
**Priority:** Must Have (Phase 1) / Should Have (Phase 2 engine).

**Acceptance Criteria:**
- Given a browser without Web Speech API support, when a learner attempts a pronunciation exercise, then they can still record/play back audio with clear messaging that scoring isn't available.

---

### FR-11 Certificates
**Description:** Credentialing artifact issued on passing a level's comprehensive assessment (Blueprint §8).
**Actors:** Student (recipient), System (issuer).
**Preconditions:** Passed the level-end certification exam (FR-08/§9).
**Postconditions:** Certificate record created, referencing the exact `assessment_result` by foreign key; verification record created.

**Main Flow:** 1. Passing result triggers certificate issuance. 2. System generates a certificate artifact with disclaimer language and a unique verification code. 3. Learner can view/download/share; a third party can check validity via the verification URL.

**Alternative Flow:** *(Open decision, PRD §15 item 2)* — re-certification policy. This SRS specifies the data model supports either outcome (a certificate references one specific `assessment_result`; a new passing attempt can either supersede or coexist) without prescribing which, pending the product decision.

**Exception Flow:** A disputed certificate → support/admin flow traces the verification code to the exact `assessment_result` row and its per-skill scores (never just a pass/fail flag), per Blueprint §8's auditability requirement.

**Validation Rules:** `issuer` field defaults to "Elrefaee English Academy" but is not hardcoded — schema supports future accredited-partner issuers (Blueprint §8) without migration.

**Business Rules:** Certificate disclaimer text is mandatory, non-removable by any role, rendered on every certificate view/export.

**Dependencies:** §9 (Assessment Engine).
**Priority:** Must Have.

**Acceptance Criteria:**
- Given any published certificate, when its verification URL is visited, then the disclaimer and the certified level are shown without requiring the verifier to have an account.

---

### FR-12 AI Tutor
**Description:** In-context conversational help scoped to the current lesson (EDD §18).
**Actors:** Student.
**Preconditions:** Learner is within an active lesson or review session.
**Postconditions:** Response logged as an `ai_interaction` (§7); conversation state updated per the memory policy (§7.3).

**Main Flow:** 1. Learner submits a question. 2. AI Gateway resolves the Tutor module's configured provider adapter. 3. System applies the safety/moderation layer (§7.4) to both input and output. 4. Response returned, following EDD §18's scaffolding/error-correction behavior.

**Alternative Flow:** Learner disputes a correction → system offers an explicit "flag for instructor review" action rather than the AI re-arguing its position (EDD §18 escalation rule).

**Exception Flow:** AI provider timeout/failure → AI Gateway fallback strategy (§7.6) engages; if no fallback succeeds, learner sees an explicit "tutor unavailable, try again shortly" state — never an infinite spinner.

**Validation Rules:** Input length capped (e.g., 2,000 characters) to bound cost/abuse; output is validated against the moderation layer before display.

**Business Rules:** AI Tutor output is never treated as authoritative content — it is not eligible to enter the Content Governance pipeline (§8) even indirectly; it's ephemeral guidance, not curriculum.

**Dependencies:** §7, EDD §18.
**Priority:** Must Have.

**Acceptance Criteria:**
- Given an off-topic learner message, when submitted to the AI Tutor, then the response redirects to the lesson's scope rather than answering at length (EDD §18 scope discipline).

---

### FR-13 AI Writing Coach
**Description:** Categorized feedback on writing submissions (EDD §12: content/organization/grammar/vocabulary/mechanics).
**Actors:** Student, Instructor (for graded submissions).
**Preconditions:** A writing submission exists.
**Postconditions:** Categorized feedback + suggested score stored, attributed to the AI; instructor sign-off required before any grade affecting progression is finalized.

**Main Flow:** 1. Learner submits writing. 2. AI Gateway's Writing Feedback module scores each category. 3. For practice submissions, feedback is shown directly to the learner. 4. For instructor-graded (homework/assessment) submissions, feedback pre-fills the Instructor's grading UI (§8/FR-15) as a suggestion, not a final grade.

**Alternative Flow:** Off-topic/nonsensical submission → system returns an explicit "this doesn't address the task" response rather than forcing a category-by-category score onto ungradable text.

**Exception Flow:** AI service unavailable → practice submissions queue for later feedback (async, via background job) rather than blocking the learner; graded submissions fall back to instructor-only manual grading with a visible "AI suggestion unavailable" note.

**Validation Rules:** Submission length bounds enforced per the task's declared level (prevents trivially short/long submissions from breaking scoring assumptions).

**Business Rules:** AI-suggested scores never auto-finalize a grade for instructor-graded work (US-I2, PRD §6.2) — a hard rule, not a default-with-override.

**Dependencies:** §7, FR-15.
**Priority:** Must Have.

**Acceptance Criteria:**
- Given an instructor-graded writing submission, when AI feedback is generated, then it appears as an editable suggestion the instructor must explicitly accept or override before the grade is recorded.

---

### FR-14 AI Conversation Partner
**Description:** Open(er)-ended spoken/written conversational practice (EDD §18 behavior applies).
**Actors:** Student.
**Preconditions:** Learner selects a scenario/topic at an appropriate level.
**Postconditions:** Conversation session logged; post-session summary of notable errors/strengths generated.

**Main Flow:** 1. Learner selects scenario. 2. Turn-by-turn conversational exchange via the AI Gateway. 3. On session end, system generates a summary tied to the error-correction methodology (EDD §13).

**Alternative Flow:** N/A at MVP — this module is Should Have (PRD §5), specified here for architectural completeness ahead of its build.

**Exception Flow:** Learner attempts to derail the conversation off-topic or with inappropriate content → the strictest safety/moderation threshold of any AI module applies (§7.4); repeated violations flagged for human review, session may be terminated with a clear message.

**Validation Rules:** Session length/turn-count capped to bound cost.

**Business Rules:** Highest AI-safety-review priority of any module (Blueprint §9) — must pass a dedicated safety review (§14.7) before enabling, independent of the general AI evaluation framework's release gate.

**Dependencies:** §7, FR-10 (if spoken).
**Priority:** Should Have.

**Acceptance Criteria:**
- Given a session flagged by the moderation layer twice, when a third violation occurs, then the session terminates with a clear explanation, and the interaction is logged for human review.

---

### FR-15 Teacher CMS (Curriculum Studio, instructor/authoring surface)
**Description:** Non-developer content authoring/management (Blueprint §5), role-gated within the main app.
**Actors:** Curriculum Designer, Content Reviewer, Academy Admin, Instructor (grading subset only).
**Preconditions:** User holds a role with Studio access (§4).
**Postconditions:** Content Items move through the lifecycle (§8.1); revisions tracked; media enforced for accessibility.

**Main Flow:** 1. Curriculum Designer authors/edits via the structured block editor. 2. Submits for review → Content Reviewer sees diff + EDD §19 checklist inline. 3. Approve/Changes-Requested. 4. Academy Admin publishes (immediately or scheduled).

**Alternative Flow:** Instructor-only subset — grading queue (FR-13 dependency) and homework assignment (FR-17 dependency), no content-authoring permissions.

**Exception Flow:** Two Curriculum Designers editing the same Draft concurrently → **optimistic locking**: the second save attempt is rejected with a conflict notice and a diff view against the version that was saved first, requiring explicit merge — not silent last-write-wins (resolves the open question flagged in Blueprint §7.15/§19).

**Validation Rules:** Cannot submit for review with any required EDD §19 checklist field empty (enforced at the editor layer, not just at review time — fail fast).

**Business Rules:** Media upload cannot be marked ready without an attached transcript/captions reference (Blueprint §11's hard accessibility gate).

**Dependencies:** §8, §4.
**Priority:** Must Have (minimum viable version, per Blueprint §5's sequencing note).

**Acceptance Criteria:**
- Given two designers editing the same Draft, when both attempt to save after diverging, then the second save is blocked with a conflict view, not silently overwritten.
- Given a video lesson with no transcript, when a Reviewer attempts to approve it, then approval is blocked.

---

### FR-16 Analytics
**Description:** Learning Analytics system (Blueprint §7) surfaced through role-scoped dashboards.
**Actors:** Student, Instructor, Academy Admin, Super Admin (System as event producer).
**Preconditions:** Learning events exist.
**Postconditions:** Computed metrics available to Dashboard (FR-03) and exportable reports (Admin).

**Main Flow:** 1. Every learner-facing feature emits typed events. 2. Nightly (or near-real-time for XP/streak) aggregation jobs compute derived metrics (§11.2). 3. Dashboards query precomputed aggregates, not raw events, at scale.

**Alternative Flow:** Sparse-data learner (new account) → dashboards render an explicit "not enough data yet" state instead of a broken/empty chart.

**Exception Flow:** A GDPR deletion request → analytics history for that user is anonymized per §12.7's reconciliation policy, not silently orphaned or left identifiable.

**Validation Rules:** Every event schema is versioned; an event failing schema validation is dead-lettered (queued for inspection), never silently dropped or crashing the ingestion pipeline.

**Business Rules:** A teacher never sees another teacher's cohort data; enforced at the query layer (§12).

**Dependencies:** Every FR as an event source, §4, §12.
**Priority:** Must Have.

**Acceptance Criteria:**
- Given a new learner with one day of activity, when they view their dashboard, then trend charts show an explicit "building your data" state rather than an empty/broken chart.

---

### FR-17 Notifications
**Description:** Re-engagement and time-sensitive alerts.
**Actors:** Student, Instructor, Content Reviewer.
**Preconditions:** A triggering event occurs (streak-at-risk, review-due, homework-due, review-queue-item, certificate-earned).
**Postconditions:** Notification delivered via the user's configured channel(s) (in-app, email, optionally push).

**Main Flow:** 1. Triggering event fires. 2. System checks user's notification preferences (FR-20). 3. Notification queued and delivered via the appropriate channel.

**Alternative Flow:** User has disabled a notification category → event still logged internally (for analytics) but no notification sent.

**Exception Flow:** Email delivery failure (Resend bounce/error) → retried per a bounded backoff; persistent failure surfaces in-app only, doesn't silently vanish.

**Validation Rules:** Notification content templated (versioned, not hardcoded strings scattered through code — ties to i18n readiness, Blueprint §12).

**Business Rules:** Re-engagement cadence tapers for long-lapsed users rather than persisting indefinitely (PRD §7.17).

**Dependencies:** §11, FR-20, Resend.
**Priority:** Should Have (core streak/review notifications) / Could Have (push).

**Acceptance Criteria:**
- Given a user who disabled "review reminders," when a review becomes due, then no notification is sent, but the due item still appears on next login.

---

### FR-18 Gamification
**Description:** Motivational layer — XP, streaks, badges, optional leaderboards (Blueprint §8).
**Actors:** Student.
**Preconditions:** A completion/activity event occurs.
**Postconditions:** XP/streak/badge state updated and visible.

**Main Flow:** 1. Completion event fires (lesson, exercise, review). 2. XP awarded per a defined table (not ad hoc per feature). 3. Streak counter updated on any-day-active basis.

**Alternative Flow:** Vacation/streak-freeze — a user-invoked or auto-granted freeze prevents streak loss for a defined number of days, framed non-punitively.

**Exception Flow:** Simultaneous events from a burst of activity (e.g., catching up after a lapse) → XP/streak logic must be idempotent per event, not double-counted on retry/replay.

**Validation Rules:** XP values are configuration data, not hardcoded per call site (allows tuning without a deploy).

**Business Rules:** **Must never visually or navigationally blend with the Certification layer (FR-11)** — restated here for the fourth time across four documents deliberately (PRD §14 already explains why).

**Dependencies:** §11, FR-05/FR-07/FR-09.
**Priority:** Must Have (XP/streak) / Should Have (leaderboards).

**Acceptance Criteria:**
- Given a duplicate delivery of the same completion event (e.g., a retried request), when processed, then XP is awarded exactly once.

---

### FR-19 Search
**Description:** Role-scoped content discovery.
**Actors:** Student, Curriculum Designer, Content Reviewer.
**Preconditions:** Indexed content exists.
**Postconditions:** Results returned, scoped strictly to what the querying role may see.

**Main Flow:** 1. User submits a query. 2. System searches within the role's permitted content-lifecycle scope (Students: Published only; Designers/Reviewers: their permitted states). 3. Ranked results returned.

**Alternative Flow:** No results → explicit empty state with a suggestion to broaden the query, not a blank page.

**Exception Flow:** Search index lag (new content not yet indexed) → acceptable per a defined freshness SLA (e.g., ≤5 minutes); never surfaces stale-deleted/archived content as if current.

**Validation Rules:** Query sanitized before use in any indexing backend query to prevent injection.

**Business Rules:** **Hard rule:** Draft/In-Review content must never be returned to a Student searcher, under any ranking or caching condition — this is a content-governance leak class bug, treated with the same severity as an RLS bypass (§12).

**Dependencies:** §8, §4.
**Priority:** Could Have (MVP may ship with basic filtering/browse in place of full search — flagged as an acceptable MVP substitution, not a silent scope cut).

**Acceptance Criteria:**
- Given a Student search query that happens to match a Draft lesson's title, when results are returned, then that Draft lesson does not appear.

---

### FR-20 Settings
**Description:** User-controlled preferences (notifications, accessibility, billing, data rights).
**Actors:** All roles.
**Preconditions:** Authenticated session.
**Postconditions:** Preferences applied platform-wide; data export/deletion requests logged and actioned.

**Main Flow:** 1. User adjusts a setting (font size, contrast, theme, notification category, language *[reserved]*). 2. System persists and applies immediately, no reload required for most preferences.

**Alternative Flow:** Data export request → system generates a downloadable export of the user's own data (profile, progress, submissions, certificates) within a defined SLA (e.g., ≤72 hours).

**Exception Flow:** Data deletion request → reconciled against retention needs per §12.7's anonymization policy (certificate/audit records retained in anonymized form, not simply refused or naively cascaded).

**Validation Rules:** Accessibility preferences (font scale, contrast, dyslexia font) apply via CSS custom properties/tokens (Blueprint §17), never a hardcoded per-component override that could drift out of sync.

**Business Rules:** A deletion request is honored for personal data but does not invalidate a previously issued certificate's verifiability (§12.7).

**Dependencies:** §12.
**Priority:** Must Have (accessibility, notifications) / Should Have (self-serve data export/delete — Must Have for GDPR compliance timing, see §3).

**Acceptance Criteria:**
- Given a user requests account deletion, when it's processed, then their certificates remain independently verifiable (issuer + level + date) without exposing their personal profile data.

---

## 3. Non-Functional Requirements

| Category | Requirement | Measurable target |
|---|---|---|
| Performance | Per PRD §8 | p95 page load <2.5s (mid-tier mobile, 4G); p95 non-AI API <300ms; p95 AI-dependent response <5s with visible loading state |
| Availability | Learner-facing app | 99.9% monthly uptime target post-launch; documented status page |
| Reliability | No data loss on network/browser failure mid-lesson | Incremental state persistence (FR-05), not save-on-exit only |
| Scalability | Follows Blueprint §16's staged roadmap | No MVP decision precludes the next stage's addition (checked via the architecture-review gate, §16 of this doc) |
| Maintainability | Content/config as data, never hardcoded | ≥80% automated test coverage specifically on learning-loop and assessment-scoring logic (not a blanket repo-wide number) |
| Accessibility | WCAG 2.2 AA | Automated axe-core scan in CI (zero critical violations to merge) + manual screen-reader pass per release (§14.5) |
| Localization | UI i18n-ready | Zero hardcoded user-facing strings outside the resource-file layer, verified by a CI lint rule |
| Security | Per §12 | Two-layer RBAC+RLS, MFA for elevated roles, encrypted transit/at-rest |
| Privacy | GDPR-ready | Self-serve export ≤72h SLA; deletion request actioned ≤30 days (GDPR Art. 12(3) default) |
| Compliance | No COPPA obligation at MVP (no under-13 users); data model non-blocking for future COPPA | Verified via the architecture-review checklist (§16) before any kids/teens work begins |
| Logging | Structured, correlated | Every request carries a correlation ID through logs, API, and background jobs for traceability |
| Monitoring | Sentry + platform metrics | Error-rate and latency alerting thresholds defined before launch, not added reactively |
| Backup | Automated daily Postgres backups, point-in-time recovery | Restore procedure tested on a defined schedule (e.g., quarterly), not assumed working |
| Recovery | RPO/RTO targets (Blueprint §15) | RPO ≤24h, RTO ≤4h at launch, tightened as scale/revenue justify |
| Observability | Trace critical flows end-to-end (placement → certificate) | Distributed tracing across client → API → background jobs for the highest-value user journeys, minimum viable at MVP, expanded per Blueprint §16 stage |

---

## 4. User Roles & Permissions

Roles are stored as data (`roles`, `permissions`, `role_permissions`, `user_roles` — §5), never hardcoded conditionals, per Blueprint §13's standing rule. The matrix below is the seed data for `role_permissions`, not just documentation.

| Permission | Student | Instructor | Content Reviewer | Curriculum Designer | Academy Admin | Super Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| View own progress/notebook/certificates | ✅ | — | — | — | — | — |
| Attempt lessons/exercises/assessments | ✅ | — | — | — | — | — |
| View assigned cohort roster & analytics | — | ✅ (own cohorts only) | — | — | ✅ (academy-wide) | ✅ (all academies) |
| Assign/track homework | — | ✅ | — | — | — | — |
| Grade submissions (with AI-suggested pre-fill) | — | ✅ | — | — | — | — |
| Create/edit Draft content | — | — | — | ✅ | — | — |
| Review content, request changes / advance to Approved | — | — | ✅ | — | — | — |
| Publish / schedule content | — | — | — | — | ✅ | ✅ |
| Restore prior content versions | — | — | — | ✅ (own drafts) | ✅ | ✅ |
| Manage user accounts within academy | — | — | — | — | ✅ | ✅ |
| Manage roles/permissions | — | — | — | — | — | ✅ |
| Configure AI providers/modules | — | — | — | — | — | ✅ |
| View academy-wide business KPIs | — | — | — | — | ✅ | ✅ |
| View cross-academy platform KPIs | — | — | — | — | — | ✅ |
| Manage billing/subscription plans | — | — | — | — | ✅ (own academy) | ✅ |
| Access audit log | — | — | — | — | ✅ (own academy scope) | ✅ (full) |

**Forward-compatible, not built:** Guardian/Parent and Billing/Support Admin rows are reserved in the `roles` table schema (empty permission sets) so their eventual addition is a data insert (Blueprint §13.3), never a schema migration.

**Enforcement:** every permission above is checked at both the application-service layer and via Postgres RLS policy (§12.2) — a permission that exists only in this table without a corresponding RLS policy is considered an incomplete implementation, not a deferred nice-to-have.

---

## 5. Database Requirements

### 5.1 Core entities (representative, not exhaustive — full schema is a Phase 3 deliverable)

| Entity | Purpose | Key fields |
|---|---|---|
| `users` | Identity | id, email, auth_provider_ref, created_at, deleted_at (soft-delete/anonymization flag) |
| `roles`, `permissions`, `role_permissions`, `user_roles` | RBAC (§4) | user_roles scoped by nullable `academy_id` (null = platform-wide, e.g. Super Admin) |
| `academies` | Tenant/subject-vertical container (Blueprint §18) | id, name, slug, vertical |
| `content_items` | Shared governance envelope for all content types (Blueprint §4) | id, type, academy_id, cefr_level, status, current_published_version_id, created_by |
| `content_versions` | Immutable, append-only version history | id, content_item_id, version_number, payload (jsonb, type-specific), created_by, created_at |
| `content_reviews` | Review decisions | id, content_item_id, version_id, reviewer_id, decision, comments, created_at |
| `units`, `lessons` | Curriculum structure | reference `content_items` for their authored payload; carry their own indexed `order_index`, `academy_id`, `cefr_level` |
| `vocabulary_entries` | Vocabulary spine (EDD §7) | headword, sense_id, ipa, cefr_level, part_of_speech, tier (active/receptive) — indexed columns, not buried in jsonb |
| `item_bank` | Assessment item pool | skill, cefr_level, difficulty, item_type — indexed for blueprint assembly queries |
| `test_blueprints` | Test-type definitions (§9) | type, rules (jsonb: item count, skill weights, time limit, pass threshold) |
| `assessment_attempts` / `assessment_results` | Immutable per-attempt records | results reference the exact item set served, never recomputed retroactively |
| `certificates` | Credentialing (FR-11) | user_id, academy_id, cefr_level, assessment_result_id (FK), issuer, verification_code (unique), disclaimer_text |
| `enrollments`, `progress_records` | Placement + per-lesson progress | |
| `vocabulary_reviews` | Spaced-repetition state per learner×item | stability, difficulty, due_at (indexed), review_history |
| `learning_events` | High-volume analytics source | partitioned by time (§11.3) |
| `ai_interactions` | AI Gateway call log (§7) | module, provider, cost, latency_ms, flagged |
| `audit_log` | Shared, append-only, immutable | actor_id, action, entity_type, entity_id, before/after diff, created_at |
| `cohorts`, `cohort_enrollments`, `homework_assignments`, `submissions` | Instructor-facing structures | |
| `subscriptions` | Billing state, behind `BillingProvider` (Blueprint §17) | |

### 5.2 Relationships (representative)
- `content_items` 1:N `content_versions`, 1:N `content_reviews`; `current_published_version_id` FK points into `content_versions` (nullable until first publish).
- `assessment_results` 1:1 `assessment_attempts`; `certificates` N:1 `assessment_results`.
- `vocabulary_reviews` N:1 `users`, N:1 `vocabulary_entries` — composite unique constraint on (user_id, vocabulary_entry_id).
- `user_roles` N:M between `users` and `roles`, with a nullable `academy_id` scoping column.

### 5.3 Constraints
- `certificates.verification_code` — unique, indexed.
- `users.email` — unique, case-insensitive.
- `content_items.current_published_version_id` — foreign key must reference a version belonging to the same `content_item_id` (application-enforced if not expressible as a native FK given the versioning shape).
- `assessment_results` — immutable after creation (no UPDATE permitted at the RLS/policy level; corrections happen via a new attempt, never an edit).

### 5.4 Indexes (representative, performance-critical)
- `content_items(status, academy_id, cefr_level)` — composite, for course/search queries.
- `vocabulary_reviews(user_id, due_at)` — the review-queue hot path (FR-09).
- `learning_events(user_id, created_at)` — partitioned by month at the ~100k-user stage (Blueprint §16).
- `audit_log(entity_type, entity_id, created_at)`.
- `assessment_attempts(user_id, blueprint_id, started_at)`.

### 5.5 Versioning
Two distinct versioning concerns, not to be conflated: **(a) content versioning** — `content_versions`, append-only, business-domain versioning per Blueprint §4.2; **(b) database schema versioning** — standard Drizzle migration files, version-controlled in the repo, applied via CI/CD (§13), entirely separate from (a).

### 5.6 Audit history
Single shared `audit_log` table (Blueprint §4.3/§15) — covers content lifecycle transitions, security-relevant events (auth, permission changes), and data-rights actions (export/deletion requests). Immutable: application-layer and RLS both deny UPDATE/DELETE on this table; corrections are new rows, never edits.

### 5.7 Soft-delete / data-lifecycle strategy
**Content** (units, lessons, etc.): never hard-deleted while referenced by any learner's history or a certificate — moves to `Archived` status (Blueprint §4.1), remains queryable for audit, excluded from active-curriculum queries by the `status` filter.
**User accounts (GDPR deletion, §3/§12.7):** a genuine tension, resolved explicitly — personal data (name, email, profile fields) is anonymized in place (`deleted_at` set, PII fields overwritten with a tombstone value) rather than the row being hard-deleted, because `certificates`, `assessment_results`, and `audit_log` hold foreign keys into `users` that must remain resolvable for certificate verification and audit integrity. Hard deletion of a user row is **not** used as the GDPR-deletion mechanism; anonymization is. This is stated explicitly here because it's the kind of decision that's easy to get wrong under deadline pressure (a naive `DELETE FROM users WHERE id = ?` would cascade-break certificate verification).

---

## 6. API Requirements

### 6.1 Architectural pattern
Next.js Route Handlers as a **thin transport layer** — request parsing, auth/permission checks, response shaping only. All business logic lives in a separate service-module layer, called by the route handlers. This is what makes §6.9's future-GraphQL-compatibility claim real rather than aspirational: a GraphQL resolver layer could call the same service modules directly, without re-implementing business logic.

### 6.2 Authentication & Authorization
Bearer JWT (Supabase-issued, FR-01) on every request except public verification endpoints (e.g., certificate verification, FR-11). Authorization is checked twice: route-handler-level permission check (§4) *and* RLS at the database layer (§12.2) — a route handler must never rely on RLS alone to prevent unauthorized access, since that would leave a class of bugs (e.g., data merged into an over-broad response) undetected until an RLS audit.

### 6.3 Conventions
REST, resource-oriented (`/api/v1/lessons/{id}`, `/api/v1/cohorts/{id}/roster`), nouns not verbs, standard HTTP methods/status codes. Versioned via URL prefix (`/api/v1/`) — a breaking change ships as `/api/v2/` alongside the still-supported `v1`, with a documented deprecation window, never an in-place breaking change to `v1`.

### 6.4 Rate limiting
Two distinct layers, not one generic mechanism (a deliberate correction — see §16.8): **(a) general API abuse-prevention** rate limiting per user/IP (token bucket via Upstash), tuned for normal usage patterns; **(b) AI Gateway-specific** rate/cost limiting per user per module (§7.7), independently configurable, because a user operating within normal general-API limits could otherwise exhaust AI provider budget through legitimate-looking but excessive AI-module calls.

### 6.5 Error handling
Standard envelope: `{ "error": { "code": "string", "message": "human-readable", "details": {} } }`. Error codes are a stable, documented enum (not free-text strings that drift) — client code branches on `code`, never on `message` text.

### 6.6 Pagination
Cursor-based by default (required for high-volume resources: `learning_events`, `audit_log`, item bank); offset-based supported for small, bounded admin lists (e.g., role list) where cursor overhead isn't justified.

### 6.7 Filtering & Sorting
Query-param based (`?status=published&sort=cefr_level:asc`), against an **explicit per-resource allowlist** of filterable/sortable fields — never arbitrary field-name pass-through, which would both leak schema details and open an injection surface.

### 6.8 Webhooks
MVP: inbound only (Stripe billing events, §5's `subscriptions`). Outbound webhooks (for future B2B/institutional integrations) are explicitly **Could Have** (PRD §5) — the event-emission pattern already used for analytics (§11) is designed so an outbound-webhook dispatcher could subscribe to the same event stream later without re-instrumenting every feature.

### 6.9 Future GraphQL compatibility
Not built at MVP. Compatibility is preserved by keeping the service-module layer (§6.1) as the single source of business logic — a future GraphQL layer is a second thin transport on top of the same services, not a rewrite.

---

## 7. AI Architecture

### 7.1 AI Gateway
A single internal service (`aiGateway.invoke(module, input, context)`) fronting all AI-touching functionality (Blueprint §9). Application code never imports a provider SDK directly outside a module's own adapter — enforced by a lint rule restricting provider-SDK imports to the `/ai-gateway/adapters/*` directory.

### 7.2 Provider abstraction
Each module (Tutor, Pronunciation Coach, Writing Feedback, Conversation Partner, Placement, Study Plans, Question Generator, Content Assistant) defines its own typed input/output contract. A provider adapter implements that contract for a specific vendor. Swapping providers = writing a new adapter + updating the module's active-adapter configuration (data, not code) — including a **canary rollout mechanism** (route a small % of traffic to the new adapter, compare quality/cost/latency, then ramp) rather than an instantaneous full cutover, addressing the rollback-safety gap surfaced in the engineering review (§16.1).

### 7.3 Prompt management
Prompt templates are versioned data (a `prompt_templates` table, not hardcoded strings in application code) — enables updating a prompt without a deploy and A/B testing template variants. Every AI Gateway call records which prompt-template version was used (traceability for the evaluation framework, §7.9).

### 7.4 Conversation memory
Session-scoped conversation history stored server-side (never client-only, to support the safety/audit requirements below). Retention: a rolling window of the last N turns kept verbatim, older turns summarized, full session history retained for 30 days then purged/anonymized per the same reconciliation policy as §5.7 — this concrete duration was an explicit gap the engineering review (§16.5) flagged and closes here.

### 7.5 Safety layer & moderation
Every AI Gateway call passes input *and* output through a moderation check before reaching the user, with per-module severity thresholds (Conversation Partner and AI Tutor set strictest, per Blueprint §9). A flagged interaction is logged to `ai_interactions.flagged = true` and surfaced to a human-review queue — never silently blocked with no record, and never silently allowed through.

### 7.6 Fallback strategy
Primary provider timeout/failure → Gateway attempts a configured secondary adapter for that module (where one exists) → if none succeeds, returns an explicit "unavailable, try again" state to the caller (never a silent hang, per NFR §3). Fallback attempts are logged distinctly from primary-success calls for cost/reliability analysis.

### 7.7 Caching
Semantic/exact-prompt-hash caching for low-variance, high-repeat queries (e.g., a common grammar explanation) — reduces both cost and p95 latency. Cache invalidated when the underlying prompt-template version changes.

### 7.8 Cost optimization
Per-module cost tracked in `ai_interactions.cost` (Blueprint §9); per-user, per-module rate/cost limits (§6.4b) prevent runaway spend; cheaper-model routing available per module for low-stakes calls (e.g., simple vocabulary lookups) versus a higher-capability model for nuanced tutoring — a routing decision made in adapter configuration, not scattered call-site logic.

### 7.9 Evaluation framework
**Offline:** a golden test set (prompts + EDD §18-derived expected-behavior assertions) run in CI before any prompt-template or provider-adapter change ships — this is the primary release gate for AI quality, and is explicitly the mechanism that substitutes for deterministic acceptance criteria on AI-touching features (§14.7 clarifies this exception). **Online:** a defined percentage of live interactions sampled for human quality review, feeding back into prompt/content improvements — not a one-time pre-launch check.

---

## 8. CMS Architecture

### 8.1 Content lifecycle
State machine exactly as Blueprint §4.1: `Draft → In Pedagogical Review → (Changes Requested ⟲ Draft) → Approved → Scheduled → Published → Deprecated → Archived`. Implemented as a guarded finite-state machine — every transition checks the actor's role permission (§4) before executing, and writes to `audit_log` (§5.6) atomically with the state change (never a state change without a corresponding audit row).

### 8.2 Workflow & approval
`content_reviews` records the decision; "Changes Requested" requires ≥1 comment tied to a specific EDD §19 checklist item (FR-15/§2's validation rule) before the transition is permitted.

### 8.3 Publishing
Publish = an atomic transaction that (a) sets `content_items.current_published_version_id` to the approved version's id, (b) writes an audit entry, (c) invalidates any cache/CDN entry for that content item. Never a partial-success state where the pointer updates but the audit/cache steps don't.

### 8.4 Rollback
Setting `current_published_version_id` back to a prior version id — a pointer change plus an audit entry, not a data-destructive operation (Blueprint §4.2). Available to Academy Admin/Super Admin, one action.

### 8.5 Scheduling
`content_items` (or a dedicated `publish_schedule` table) carries a `publish_at` timestamp; a background job (Trigger.dev/Inngest, §13) polls/triggers at that time and executes the same atomic publish transaction as §8.3 — scheduling is not a separate code path from manual publishing, just a deferred trigger.

### 8.6 Media management
Upload → Supabase Storage → mandatory transcript/caption metadata attachment before the parent content item's review can advance past Draft (Blueprint §11's accessibility gate, enforced here as a hard validation, §2 FR-15).

### 8.7 Localization
UI-string translation resources live entirely separately from curriculum content (Blueprint §12) — the CMS has no "translate this lesson" feature, by design; curriculum content stays English regardless of interface locale.

### 8.8 Version control
Per §5.5 — `content_versions`, append-only, diffable, restorable.

---

## 9. Assessment Architecture

### 9.1 Test types
Placement, Diagnostic, Adaptive Practice, Practice Quiz, Mock Exam, Mid-Level Exam, Final Exam, Speaking Exam, Certification Exam — each a `test_blueprints` row (§5.1), never a bespoke code path per type.

### 9.2 Scoring engine
Per-item-type scoring strategy: auto-graded (MCQ/fill-in, exact + fuzzy matching per FR-07's tolerance policy) for objective items; AI-assisted categorized scoring (EDD §12's five buckets) for writing; AI-assisted phoneme/fluency scoring (§10 Pronunciation) for speaking, **with mandatory human-instructor override for certification-exam-level speaking/writing items specifically** — a deliberate hybrid AI+human model for the highest-stakes assessments, distinct from lower-stakes practice scoring which can be AI-only.

### 9.3 Rubrics
Stored as structured data (criteria + weight + per-score-band descriptor), never embedded in prompt text or hardcoded per exercise — one rubric definition can be reused across every writing task at a given level.

### 9.4 Question bank
`item_bank` (§5.1), tagged skill/level/difficulty, reusable across blueprints (Blueprint §6's core rationale — one B1 grammar item can serve a diagnostic, a practice quiz, and a certification exam in different assembled forms).

### 9.5 Randomization
Item selection within a blueprint's eligible pool is randomized per attempt (bounded by the blueprint's skill/level/difficulty constraints) — reduces answer-sharing risk on certification exams specifically.

### 9.6 Attempt policies
Practice quizzes: unlimited attempts. Certification exams: rate-limited with a defined cooldown (e.g., 14 days) between attempts after a failure, attempt count visible to the learner, escalation to a human Instructor after repeated failures on the same certification exam (ties to FR-08/US-I1-style at-risk visibility).

---

## 10. Learning Engine

### 10.1 Progress tracking
`progress_records` per learner×lesson; aggregated into unit/course/level progress views consumed by Dashboard (FR-03) and Analytics (§11).

### 10.2 Review engine (spaced repetition)
FSRS-style scheduler service: after each `vocabulary_reviews` response, recomputes `stability`/`difficulty`/`due_at` for that specific learner×item pair (EDD §15) — implemented as a pure, testable scoring function (critical for §14.1's unit-test coverage target) independent of the API/UI layer.

### 10.3 Vocabulary engine
`vocabulary_entries` + per-learner notebook aggregation; sense-specific entries (EDD §7) tracked independently in the scheduler.

### 10.4 Flashcards
A UI/service layer over the review-engine's due queue (§10.2) — not a separate data model; a flashcard *is* a due `vocabulary_reviews` row rendered in a specific interaction mode.

### 10.5 Bookmarks
Simple user↔content-item saved-item join table, available on any Published content, not just vocabulary.

### 10.6 Notes
`learner_notes` — free-text, attached to a specific lesson or vocabulary entry, private to the learner (never visible to an Instructor without explicit sharing — a privacy default worth stating since it's easy to build the opposite by accident).

### 10.7 Recommendations
A recommendation service combining: mastery gaps (from Analytics, §11), spaced-repetition due items (§10.2), and curriculum sequence — produces the single "next best action" Dashboard (FR-03) surfaces. Deterministic, rules-based at MVP; the Should/Could-Have "Personalized Study Plans" AI module (§7) is a future enhancement layered on top of this same service, not a replacement for it.

### 10.8 Study plans
AI-assisted (Should/Could Have, per PRD §5) — generates a suggested weekly plan from the recommendation service's outputs; always editable/dismissible by the learner, never a rigid mandate.

### 10.9 Learning paths
Modeled as a directed graph (not a strictly linear list) over units/lessons per course, to support the open skip-ahead decision (FR-06) and any future non-linear paths, without a schema change when that policy is decided.

---

## 11. Analytics Architecture

### 11.1 Event tracking
Typed, versioned events (§3 Logging/schema-validation NFR) emitted from every learner-facing feature (§2). Two parallel consumers: PostHog (generic product analytics, Blueprint §7) and our own domain aggregation jobs (education-specific metrics).

### 11.2 Computed metrics
Nightly batch jobs (background jobs, §13) compute: mastery-per-skill, CEFR-progress composite, vocabulary retention curves, bottleneck/drop-off funnels. Near-real-time (synchronous, not batched) for XP/streak, since those need immediate UI feedback.

### 11.3 Dashboards
Query **precomputed aggregate tables**, not raw `learning_events`, once past the pilot stage — a materialized-view-or-equivalent pattern introduced no later than the ~10,000-user stage (Blueprint §16), flagged here so it isn't accidentally deferred until a dashboard is already slow in production.

### 11.4 Student / Teacher / Business / Learning / AI analytics
Role-scoped views over the same underlying computed-metrics tables, filtered per §4's permission matrix — one metrics layer, multiple authorized views, not four parallel systems.

### 11.5 KPIs
Full KPI definitions per PRD §10; this SRS's obligation is that every KPI named there has a corresponding, named event and computed-metric definition here — a KPI without a traceable event source is treated as a spec gap, not aspirational.

---

## 12. Security Architecture

### 12.1 Authentication
Per FR-01/Blueprint §15.

### 12.2 Authorization & RBAC
Two-layer, redundant: application-service permission check (§4 matrix) **and** Postgres RLS policy per table, keyed off `auth.uid()` and the resolved role/academy scope. Every new table added to the schema requires an RLS policy before merge — enforced as a CI check (a migration adding a table without a corresponding policy fails review), not a manual reminder.

### 12.3 Encryption
TLS 1.2+ everywhere in transit; encryption at rest (Supabase/Postgres default); no raw payment-card data ever stored (Stripe-hosted fields only, §6/Blueprint §17).

### 12.4 Secrets management
All secrets (API keys, service-role keys, provider credentials) in environment-scoped secret stores (Vercel/Supabase), never committed to the repository (CI secret-scanning gate); service-role keys are least-privilege and never shipped client-side; rotation cadence: quarterly as a default policy, immediate on any suspected compromise — a concrete cadence, addressing the gap flagged in the engineering review (§16.6).

### 12.5 Audit logs
§5.6 — shared, immutable `audit_log`.

### 12.6 OWASP Top 10 mapping
| OWASP category | Mitigation |
|---|---|
| Broken Access Control | RLS + RBAC (§12.2) |
| Cryptographic Failures | §12.3 |
| Injection | Parameterized queries via Drizzle; Zod validation at every API boundary (§6) |
| Insecure Design | Threat modeling during Phase 3 technical foundation |
| Security Misconfiguration | Infra-as-code, hardened defaults, no manual prod console changes |
| Vulnerable/Outdated Components | Automated dependency scanning in CI (Dependabot or equivalent) |
| Identification/Auth Failures | Supabase Auth + mandatory MFA for elevated roles (§12.1) |
| Software/Data Integrity Failures | Immutable content versions (§5.5), CI supply-chain checks on dependencies |
| Logging/Monitoring Failures | Shared audit log + Sentry + structured correlated logging (§3) |
| Server-Side Request Forgery | Allowlisted outbound destinations, especially for AI provider calls and future outbound webhooks (§6.8) |

### 12.7 GDPR readiness & the deletion/certificate tension
Self-serve export/delete (FR-20); the deletion mechanism is **anonymization, not hard delete**, for exactly the referential-integrity reason stated in §5.7 — documented once there in full, referenced here as the security/privacy policy source of truth.

### 12.8 Session management
Short-lived JWT (target: 1 hour) + refresh-token rotation; a compromised session can be revoked server-side (refresh-token blocklist), forcing re-authentication without waiting for natural JWT expiry.

### 12.9 API security
§6.2/§6.4 — dual-layer auth/authz, dual-layer rate limiting (general + AI-specific).

---

## 13. DevOps Requirements

### 13.1 Environment strategy
Three environments minimum: local/dev, staging, production — each its own Supabase project (Blueprint §17 pattern), preventing any possibility of a dev/staging action touching production data.

### 13.2 CI/CD
GitHub Actions: lint + typecheck + unit/integration tests + accessibility scan (§3) gate every PR; Vercel preview deploy per PR (supports the phase-gated human-review workflow already established across this project); merge to `main` auto-deploys to staging; production deploy is an explicit promotion step, not automatic on merge.

### 13.3 Testing pipeline
§14 in full — this section is the CI wiring for those test suites, not a duplicate definition of them.

### 13.4 Infrastructure
Vercel (frontend/edge) + Supabase (Postgres/Auth/Storage/Realtime) + Upstash Redis (from ~10k users) + Trigger.dev/Inngest (background jobs) — all configuration version-controlled (infra-as-code where the provider supports it), no manual dashboard-only configuration for anything production-critical.

### 13.5 Deployment
Vercel's atomic deploys for the frontend; database migrations run as a distinct, ordered step before traffic cutover to a new version — a migration that would break the currently-live version is not permitted to ship in the same deploy as the code depending on it (expand/contract migration pattern for any breaking schema change).

### 13.6 Monitoring & Logging
Sentry (errors), Vercel/Supabase built-in metrics (latency/throughput), PostHog (product/learning events, §11) — alerting thresholds defined and tested (a fired alert that nobody is on-call to see is not monitoring) before launch.

### 13.7 Disaster Recovery
Per §3/Blueprint §15's RPO/RTO targets; restore procedure tested on a defined cadence, with the test itself logged (a DR plan that's never been rehearsed is unverified, restated here as a DevOps-owned recurring task, not a one-time document).

---

## 14. Quality Assurance

### 14.1 Unit tests
Business logic with no I/O dependency — the FSRS scheduler (§10.2), RBAC permission resolution (§4), scoring engines (§9.2), fuzzy-match tolerance (FR-07) — targeted at the ≥80% coverage NFR (§3), specifically on this class of logic rather than the whole codebase uniformly.

### 14.2 Integration tests
API endpoint ↔ database interaction, including RLS policy verification — a test suite that asserts a Student-scoped request genuinely cannot retrieve another student's data at the database level, not just that the API layer declines to ask for it.

### 14.3 E2E tests
Playwright, covering the critical journeys from PRD §9: placement → first lesson → certificate; instructor grading flow; content-authoring → review → publish flow.

### 14.4 Accessibility tests
Automated axe-core scans in CI (zero critical/serious violations to merge) + a manual screen-reader pass (VoiceOver/NVDA) each release, per the NFR (§3) — automated scanning alone is explicitly insufficient and does not satisfy this requirement alone.

### 14.5 Performance tests
Load testing before major launches/marketing pushes (Blueprint §16), targeting the p95 figures in §3; run against a staging environment sized to approximate the relevant scale stage, not production.

### 14.6 Security tests
Automated dependency scanning in CI (continuous); a periodic (e.g., pre-major-B2B-deal) third-party penetration test — not purely automated, given the RBAC/RLS surface's real-world attack relevance.

### 14.7 AI evaluation
The offline golden-set suite (§7.9) is the primary automated gate for AI-touching features — **explicitly not** deterministic pass/fail acceptance criteria the way FR-01–FR-11 use; this is a stated, deliberate exception (raised in the engineering review, §16.7) rather than an inconsistency: conversational/generative behavior is evaluated against the EDD's behavioral spec via the eval framework and human-sampled review, not exact-match assertions.

---

## 15. Future Extensibility

Every module in this SRS is required to satisfy the following checklist before merge — the concrete, enforceable form of Blueprint §17's "modular, swappable" principle:
1. **No direct vendor SDK imports outside a module's own adapter** (§7.1's lint-enforced rule, generalized to Billing (`BillingProvider`), Pronunciation (`PronunciationEngine`), and any future integration).
2. **Every cross-module dependency goes through a defined service interface**, never a shared mutable global or direct cross-module database write.
3. **Every "one of several possible X" concept is modeled as swappable configuration/data**, never a hardcoded assumption — AI provider (§7.2), pronunciation engine (§7.2), billing provider (§6.9/Blueprint §17), certificate issuer (FR-11), academy/tenant (§5.1).
4. **A new role is a data insert** (§4), never a code change.
5. **A new academy/subject vertical (Blueprint §18's future ecosystem) requires no schema migration** — only new `academies`, `content_items`, and `test_blueprints` rows scoped to it — verified by the fact that "English Academy" itself is not special-cased anywhere in this schema, only seeded as the first row.

---

## 16. Engineering Cross-Functional Review

Reviewed from the CTO, Software Architect, Lead Backend, Lead Frontend, AI Architect, DevOps Lead, QA Lead, and Security Engineer perspectives. Issues found were resolved directly in the sections above rather than listed as unaddressed — each item below states what was found and exactly where the fix now lives, so the review is verifiable, not asserted.

1. **(CTO/AI Architect) AI provider swap had no rollback safety mechanism.** Fixed: canary rollout added to §7.2.
2. **(Software Architect) Tension between polymorphic jsonb content payloads and the need for indexed, queryable fields** (e.g., "all Approved B1 vocabulary"). Resolved: type-agnostic, frequently-queried fields (`status`, `academy_id`, `cefr_level`) live as first-class indexed columns on `content_items` itself; only type-specific authored content lives in the versioned jsonb payload (§5.1, §5.4).
3. **(Lead Backend) Assessment result mutability was implicit.** Made explicit: `assessment_results` are immutable after creation, enforced at the RLS/policy level, not just a convention (§5.3).
4. **(Lead Frontend) No requirement addressed the target persona's (PRD §3.1, mobile/intermittent-connectivity) offline/flaky-network reality.** Added: incremental state persistence and bounded-retry submission queuing (FR-05's Exception Flow, restated as a general NFR-reliability requirement in §3).
5. **(AI Architect) Conversation memory had no stated retention duration.** Fixed: concrete 30-day rolling retention with summarization/purge specified in §7.4.
6. **(DevOps Lead) Secret rotation had no defined cadence.** Fixed: quarterly default + immediate-on-compromise policy specified in §12.4.
7. **(QA Lead) AI-touching features' acceptance criteria implied deterministic testability inconsistent with generative behavior.** Resolved by explicitly naming the evaluation-framework exception in §14.7, rather than leaving FR-12–14's acceptance criteria to imply a false precision.
8. **(Security Engineer) A single generic rate-limit concept would let a user exhaust AI budget while staying within "normal" general-API limits.** Fixed: two independently-configured rate-limit layers specified in §6.4.

**Remaining genuinely open items (not resolved here — correctly deferred, not overlooked):**
- Accessibility path for learners who cannot produce spoken audio at all (FR-10) — needs a UX-phase decision, not an engineering-only fix.
- The four PRD §15 open product-policy decisions (unit skip-ahead, certificate re-attempt, concurrent-edit conflict UI polish beyond the optimistic-locking mechanism now specified, fuzzy-match tolerance's exact final thresholds) — this SRS specifies the *mechanisms* to support either outcome where the product decision is still pending, rather than blocking on it.
- Pricing/plan structure (PRD §15 item 5) — has no engineering dependency addressed by this document and remains a business-workstream item.

**Net assessment:** enterprise-grade and internally consistent with the Blueprint, EDD, and PRD — cross-checked explicitly, no contradictions found. Ready for implementation pending your approval and resolution (or explicit deferral) of the open items above.
