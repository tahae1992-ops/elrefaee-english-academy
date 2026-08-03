# Elrefaee English Academy — Master Blueprint (Phase 0)

**Status:** Draft v2 for review · **Date:** 2026-08-03 · **Phase:** 0 of N — Foundation & Direction

This document is the foundation everything else gets built on. It does not contain UI mockups, database schemas, or code — those are later phases. Its job is to lock in *why* before we lock in *how*. **v2 expands v1** with production-grade architecture for content governance, analytics, accessibility, localization, AI, CMS, assessment, scalability, security, multi-academy expansion, and roles — per your request to treat this at the standard of a real EdTech company, not a course website.

**Companion document:** the pedagogical "constitution" — teaching philosophy, methodology-by-skill, error correction, AI tutor behavior, content quality standards — now lives in its own document, [01-educational-design-document.md](01-educational-design-document.md) (the **EDD**), because it governs *content creation* the way this document governs *platform architecture*, and conflating the two would make both harder to maintain. Every reference to "the EDD" below points there.

### Table of contents
1. Vision & Positioning
2. Pedagogical Methodology (summary — full depth in the EDD)
3. Curriculum Framework
4. Content Governance & Lifecycle
5. Curriculum Studio (CMS)
6. Assessment Engine
7. Learning Analytics
8. Gamification & Certification
9. AI Architecture
10. Pronunciation System
11. Accessibility (WCAG 2.2 AA)
12. Localization (i18n)
13. User Roles & Access Control
14. Platform Shape / Dashboards
15. Security Architecture
16. Scalability Roadmap
17. Technology Stack
18. Future Expansion — Multi-Academy Ecosystem
19. Risks & Open Questions
20. Proposed Phase Roadmap
21. Decisions Needed Now

---

## 1. Vision & Positioning

**Elrefaee English Academy** is a premium, production-grade platform teaching **American English** from absolute-beginner (Pre-A1) to advanced (C1), built to real EdTech-industry quality. Phase 1 targets **adult ESL learners**; a K-12 track is an intentional later phase, not a parallel track, because kids require different pedagogy, UI, gamification intensity, and legal handling (COPPA) that would dilute focus if built simultaneously.

The platform must be **monetization-agnostic by architecture** (freemium, subscription, one-time, B2B/institutional, or private-tutoring, without a rebuild) and, per this revision, **subject-agnostic at the data-model layer** — English is the first academy inside what could become a multi-academy ecosystem (Section 18), though we are deliberately *not* building the multi-academy product surface yet.

**What makes this defensible against Duolingo/Babbel/Cambridge-style incumbents:**
- Real **mastery-based certification** tied to a genuinely separate, independently-evolving **Assessment Engine** (Section 6) — not just streaks and gems.
- **American English specificity** end-to-end (GenAm IPA, AmE spelling rules, AmE-tagged vocabulary).
- A **teacher/institutional dashboard** and full **RBAC model** (Section 13) built in from day one, opening the B2B/tutoring channel pure-consumer apps don't serve well.
- A **provider-agnostic AI layer** (Section 9) so the product isn't hostage to one model vendor's pricing or capability ceiling.

---

## 2. Pedagogical Methodology — Summary

Full rationale, evidence, and per-skill methodology now live in the **EDD**. In brief: a hybrid of **CEFR** (skeleton) + **CLT, weak form with focus-on-form** (instructional core) + **TBLT** (practice engine) + **spaced repetition** (memory layer) + **active recall** (retrieval layer) + **mastery learning** (progression gate) + **PBL** (capstone layer). Every lesson traces to a CEFR can-do objective, teaches explicitly, culminates in a communicative task, feeds spaced repetition, favors retrieval over recognition, and gates progression on demonstrated competency.

---

## 3. Curriculum Framework

### 3.1 Level ladder
Pre-A1 → A1 → A2 → B1 → B2 → C1 (CEFR 2020 Companion Volume). C2 explicitly out of scope for now — small market, better addressed once the core ladder is proven. Levels break into **units** (thematic, communicative-goal-driven) and **lessons** (one teachable chunk).

### 3.2 Standards spine
- **Vocabulary:** Oxford 3000/5000, American English edition (~5,000 words, CEFR-tagged, A1→C1).
- **Grammar:** Cambridge English Grammar Profile (EGP) — corpus-driven, per-CEFR-level structures. *(Licensing for commercial use to be verified — see Section 19.)*
- **Cross-check:** Pearson Global Scale of English (GSE), 10–90 granular scale, with separate adult/professional/academic objective sets.
- **Pronunciation:** GenAm IPA per Wells's *Longman Pronunciation Dictionary* conventions.

All actual lesson prose (explanations, examples, dialogues) is original, authored against these spines, never copied — and reviewed/approved through the lifecycle in Section 4.

### 3.3 Vocabulary entry model (conceptual)
Headword, sense-specific meaning, GenAm IPA, CEFR level, part of speech, 2–3 collocations, synonym set, example sentence(s), phrasal-verb/idiom flags. Feeds the vocabulary notebook, flashcards, and spaced-repetition queue.

### 3.4 Skill coverage
Every unit touches **Listening, Reading, Spoken Interaction, Spoken Production, Writing**, plus **Grammar** and **Vocabulary** as cross-cutting threads — matching how both Cambridge/Pearson report proficiency and how the Assessment Engine (Section 6) scores it.

### 3.5 Placement testing
Two-stage: (1) CEFR self-assessment grid for fast, low-friction onboarding, (2) short multi-stage adaptive test against our own item bank, cross-mapped to CEFR. Lives in the Assessment Engine, not the lesson engine (Section 6). Needs a real item bank first — a Phase 4+ build item.

---

## 4. Content Governance & Lifecycle

Every content type you listed — lesson, exercise, dialogue, assessment item, quiz, reading passage, listening script, pronunciation activity, vocabulary entry, grammar explanation, teacher note — is modeled as one shared abstraction, a **Content Item**, rather than bespoke governance per type. This is the first major architectural call in this revision, so the reasoning is worth stating: bespoke per-type workflows would mean 10+ parallel review/versioning systems that drift out of sync over time (one type gets a rollback feature, another doesn't); a shared envelope means governance is built once and every content type inherits it for free.

**Shared envelope (conceptual fields):** `id`, `type`, `status`, `version`, `locale`, `cefr_level`, `unit_id`/`lesson_id` linkage, `created_by`, `reviewed_by`, `approved_by`, `published_at`, `changelog`.

### 4.1 Lifecycle (state machine)

```
Draft → In Pedagogical Review → (Changes Requested → Draft) → Approved → Scheduled → Published → Deprecated → Archived
```

- **Draft** — being authored by a Curriculum Designer in the Curriculum Studio (Section 5).
- **In Pedagogical Review** — a Content Reviewer checks it against the EDD's Content Quality Standards checklist (EDD §19). Can bounce back to Draft with comments (**Changes Requested**), looping until it passes.
- **Approved** — passed review; awaiting publish. Not yet visible to learners.
- **Scheduled** — an Academy Admin has set a future `publish_at`.
- **Published** — live and visible; this is the *only* state learners ever see.
- **Deprecated** — superseded by a newer version but kept resolvable (e.g., a learner mid-course shouldn't have the ground shift under them mid-unit).
- **Archived** — fully retired from active curriculum but retained, immutably, for audit and certificate-validity purposes (a learner certified two years ago must still have their original content referenceable).

Role-to-stage mapping is defined once, in Section 13, and referenced here rather than duplicated.

### 4.2 Version control

Every edit to a Content Item creates a new **immutable version row** linked to its predecessor (append-only, never overwritten in place) — the same pattern used by real CMS/document systems (think "every save is a commit"). "Published" is a **pointer** to a specific version id, not a mutable field on the content row itself. This means:
- A Curriculum Designer can keep editing a published lesson's *next* draft without touching what learners currently see.
- Any version can be diffed against any other, and any prior version can be restored with one action (this is what "restore previous versions" in Section 5 is built on).
- Rollback is a pointer change, not a data-loss risk.

**Trade-off:** this costs more storage than in-place editing and requires slightly more query complexity (always resolve "current published version" rather than reading the row directly) — worth it given the review/approval requirement you set; in-place editing is fundamentally incompatible with "no lesson should ever silently change under a reviewer or a learner."

### 4.3 Audit

Every lifecycle transition and field-level edit is written to a single, shared, **append-only `audit_log`** table (actor, action, entity type + id, before/after diff, timestamp, IP/session where relevant). This table is deliberately shared with the security audit trail in Section 15 rather than built twice — a content-approval event and a login event are both "who did what, when," and unifying them means one system to secure, back up, and query for compliance, instead of two.

---

## 5. Curriculum Studio (CMS)

**Requirement restated:** no developer required for normal content management. Curriculum Designers and Content Reviewers need a real authoring tool, not database access.

**Design call:** build the Curriculum Studio as **role-gated routes inside the same Next.js application** (e.g. `/studio/*`), not a separate product, at least initially.
- **Benefit:** one codebase, one design system, one deploy pipeline, one auth system — the studio *is* the content layer's front door, reusing the exact data model from Section 4.
- **Trade-off:** as the studio's feature surface grows (rich block editors, media pipelines), it will eventually want its own release cadence separate from the learner-facing app.
- **Risk if ignored:** premature separation now means duplicating auth, RBAC, and design-system work before we know how large the studio actually needs to be.
- **Recommendation:** build inside the main app now; revisit separation only if/when studio release cadence genuinely conflicts with learner-app release cadence (a concrete, observable trigger, not a guess).

**Core studio capabilities** (mapped to your list):
| Capability | How it works |
|---|---|
| Create / edit lessons | Structured block editor (explanation block, example block, exercise block, audio/video embed, task block) — not raw text or JSON, so non-developers can't break the data shape |
| Review content | Reviewer sees a diff view (this version vs. last published) plus the EDD checklist as an inline gate — cannot mark "Approved" until every checklist item is checked |
| Schedule publication | Sets `publish_at`; a scheduled job flips status at that time (ties into the background-job infrastructure in Section 16) |
| Manage vocabulary | Bulk table editor for vocabulary entries (Section 3.3 fields), with CEFR-level and CEFR-band-appropriate-word validation (flags if a Draft lesson uses vocabulary above its stated level, unless explicitly marked a "stretch word") |
| Upload media | Enforces the Accessibility requirement (Section 11) at upload time — a listening script or video cannot reach "Approved" without an attached transcript/captions; this is a hard gate, not a style guideline |
| Build quizzes | Pulls from the Assessment Engine's item bank (Section 6), doesn't create ad hoc untracked quiz questions |
| Track revisions / restore versions | Direct UI on top of the version model in Section 4.2 |

**Sequencing note:** the Curriculum Studio is a genuinely large build item. Recommend it comes *after* the learner-facing MVP and data model are proven with a hand-authored pilot unit (Phase 4 in the roadmap), not before — building an elaborate authoring tool for a curriculum shape that hasn't been validated yet risks building the wrong tool.

---

## 6. Assessment Engine

**Core architectural decision, as requested:** the Assessment Engine is a **separate domain from the Lesson Engine**, both conceptually and in the data model, so each can evolve independently.

| | Lesson Engine | Assessment Engine |
|---|---|---|
| Purpose | Deliver instruction; in-lesson practice tied 1:1 to what was just taught | Measure proficiency independent of any single lesson |
| Content unit | Lesson, low-stakes practice item | Item bank entry — reusable, tagged by CEFR level/skill/difficulty, not owned by one lesson |
| Assembly | Fixed, authored sequence | **Test blueprints** define how items assemble into a specific test type (item count, skill coverage, difficulty/adaptive logic, time limit, passing threshold) |
| Evolves via | Curriculum Studio (Section 5) | Its own admin surface + (later) real IRT-based adaptive calibration |

**Supported test types**, all as blueprints over the same shared item bank: Placement, Diagnostic, Adaptive Practice, Practice Quiz, Mock Exam, Mid-Level Exam, Final Exam, Speaking Exam, Certification Exam.

**Why this separation matters concretely:** a single B1 grammar item can appear in a low-stakes practice quiz, a diagnostic test, *and* (in a higher-stakes, more tightly proctored form) a certification exam — authored once, reused everywhere, scored differently per context. Attempts and scores are stored against the Assessment Engine's own `attempts`/`results` tables, referenced *by* certificates (Section 8), not embedded inside lesson-progress records — this is what keeps a certificate auditable and defensible on its own, independent of whatever the lesson content looked like at the time.

**Risk:** building a fully general adaptive/IRT engine now, before there's a real item bank or attempt volume to calibrate against, would be over-engineering. **Recommendation:** launch with simpler difficulty-tagged, multi-stage adaptive routing (the EF SET/Cambridge Linguaskill pattern from Section 3.5) and treat true IRT calibration as a data-driven upgrade once enough attempts exist to calibrate against — the blueprint-based architecture supports that upgrade later without a redesign, because the *routing algorithm* is intentionally decoupled from the *item bank* and *blueprint* concepts.

---

## 7. Learning Analytics

**Architecture:** event-driven. The client emits granular, typed events — `lesson_started`, `lesson_completed`, `exercise_attempt` (correct/incorrect + latency), `quiz_submitted`, `pronunciation_attempt` (score), `vocabulary_reviewed` (recall success/failure), `session_start`/`session_end`, `media_played`. Two things are computed from these events, and they are architecturally distinct:

1. **Product analytics** (funnels, retention, feature usage, A/B experiment results) — routed through **PostHog**, already in the stack (Section 17). Deliberately *not* building a second bespoke event pipeline for this — PostHog already does cohorts, funnels, and dashboards well, and duplicating that would be pure waste.
2. **Education-specific computed metrics** (mastery-per-skill, CEFR-progress estimate, vocabulary retention curves feeding the spaced-repetition scheduler, pronunciation-trend-over-time, bottleneck/drop-off detection by lesson/unit) — these are **domain data, not generic product-analytics data**, so they live in our own Postgres tables, computed by scheduled aggregation jobs from the same raw event stream. PostHog can't compute "this learner's B1 grammar mastery estimate" — that requires our CEFR/skill model, so it has to be our own logic, but it can still *ingest the same events* for the generic-analytics half.

**Metrics tracked** (mapped to your list): lesson completion, time spent, quiz accuracy, speaking improvement, pronunciation trends, vocabulary retention (feeds FSRS parameters directly), grammar mastery, reading speed, listening comprehension, writing quality (score history from the AI Writing Feedback module, Section 9), CEFR progress (composite, weighted by skill against level requirements), review frequency, streaks, engagement, learning bottlenecks (funnel drop-off by lesson/unit), drop-off points.

**Dashboards:**
- **Student:** per-skill trend charts, streak/XP, "N words due for review today," recommended next lesson, certificate progress.
- **Teacher:** cohort heatmap (who's behind/at-risk), aggregated common errors across the class (which grammar point the whole cohort is stuck on — informs re-teaching), assignment completion, per-student drill-down.
- **Academy Admin:** academy-wide funnel/retention/conversion — the B2B-relevant view.

**Privacy constraint, stated now so it isn't forgotten later:** this data is sensitive, individually identifiable performance data. Access is gated by the RBAC model (Section 13) — a teacher sees only their own cohort, never another teacher's — and it is squarely in scope for the GDPR data-subject rights described in Section 15 (a learner can request export/deletion of their own analytics history).

---

## 8. Gamification & Certification

Two layers that must never be visually or conceptually conflated:

**Motivational layer** (cosmetic, low-stakes): XP, levels, streaks, badges, optional leaderboards, progress milestones. Engagement only — no proficiency claim.

**Credentialing layer** (high-stakes, mastery-gated): a certificate per completed CEFR level, awarded only after passing a comprehensive assessment — via the Assessment Engine (Section 6) — covering Listening, Reading, Writing, Speaking, Grammar, Vocabulary, and a real-life communication task. Every certificate carries an explicit disclaimer: it represents mastery of Elrefaee English Academy's CEFR-aligned curriculum, **not** government/university accreditation.

`issuer` is a field on the certificate entity, not an assumption baked into the schema — the same "don't hardcode ourselves as the only possible issuer" principle from v1, now reinforced by the Assessment Engine separation: a certificate references an Assessment Engine **result** (immutable, auditable) by foreign key, so a disputed certificate can always be traced back to the exact raw per-skill scores that earned it (Section 15's audit-log principle applies here too).

---

## 9. AI Architecture

**Core principle, non-negotiable per your requirement:** the platform never depends on a single AI provider. This is implemented as an internal **AI Gateway** — one internal service that all application code calls — sitting in front of pluggable **provider adapters**. Application code never calls an AI vendor's SDK directly; it calls the Gateway, which calls whichever adapter is configured for that capability.

**Why a Gateway and not just "use environment variables for the API key":** swapping a key still leaves you married to one vendor's request/response shape, safety filtering, and failure modes throughout the codebase. The Gateway abstracts the *shape* of each capability (defined inputs/outputs per module below), so a provider swap means writing one new adapter, not touching every call site — the same pattern already committed to for the Pronunciation Engine (Section 10) and Billing Provider (Section 17), generalized into a platform-wide rule rather than three one-off interfaces.

**Independent modules, each its own contract:**
| Module | Responsibility | Notes |
|---|---|---|
| AI Tutor | Conversational help tied to current lesson context | Behavior spec lives in the EDD (§18) — this module implements that spec, doesn't define it |
| Pronunciation Coach | Wraps the `PronunciationEngine` interface (Section 10) | Phase 1 = browser Web Speech API adapter; Phase 2 = Azure (or equivalent) adapter |
| Writing Feedback | Scores + comments on writing submissions by EDD-defined categories (content/organization/grammar/vocabulary/mechanics) | Feeds the writing-quality analytics metric (Section 7) |
| Conversation Partner | Open(er)-ended spoken/written practice dialogue | Highest safety-review priority — most open-ended surface, most important to guardrail before a future kids/teens rollout |
| Placement Testing | Assists adaptive routing / can generate calibrated items | Operates on the Assessment Engine's item bank, not a free-standing test |
| Personalized Study Plans | Recommends next lesson/review based on the analytics layer (Section 7) | Consumer of analytics data, not a data source itself |
| Question Generator | Drafts candidate quiz/exam items for Content Reviewer approval | Output always enters the Content Governance lifecycle (Section 4) as a Draft — AI never publishes directly |
| Content Assistant | Helps Curriculum Designers draft lesson prose faster inside the Studio | Same rule: output is a Draft, human authorship/approval is still required per your explicit content-governance requirement |

**Cross-cutting requirements on every module:** usage/cost logged per capability (so we know the real unit economics per learner — important for a real business, not just a demo), interaction logging for QA and abuse monitoring, and a documented safety-guardrail review per module before it ships (Conversation Partner and AI Tutor need the strictest review, since they're the most open-ended and the most likely to eventually face minors).

---

## 10. Pronunciation System

Now explicitly framed as **one AI Gateway module** (Section 9), not a standalone system — same phasing as v1:
- **Phase 1 (launch):** browser-native Web Speech API adapter — zero marginal cost, works immediately.
- **Phase 2 (post-revenue):** dedicated pronunciation-assessment adapter (Azure AI Speech Pronunciation Assessment or best-in-class equivalent at build time) for phoneme/stress/rhythm/intonation/fluency scoring.

The `PronunciationEngine` contract (`assess(audio, targetPhrase) → score/feedback`) is unchanged from v1 and is the model the rest of the AI Gateway's adapter pattern generalizes from.

---

## 11. Accessibility (WCAG 2.2 AA)

**Standard:** WCAG 2.2 at the **AA** conformance level, across Perceivable / Operable / Understandable / Robust. WCAG 2.2 (finalized Oct 2023) added several success criteria beyond 2.1 that are directly relevant to an app with drag-and-drop exercises, custom controls, and account authentication — most notably (AA-level): **Focus Not Obscured**, **Dragging Movements** (any drag interaction — e.g. drag-and-drop matching exercises — must have a non-drag alternative), **Target Size Minimum** (interactive targets ≥24×24px), and **Accessible Authentication** (no cognitive-function test like a puzzle CAPTCHA as the *only* way to log in). *Recommend a final conformance audit against the live W3C WCAG 2.2 spec before launch — these criteria should inform design/build now rather than being retrofitted.*

**Concrete build requirements, mapped to your list:**
- **Screen reader support:** semantic HTML, ARIA where semantic HTML isn't enough, tested with real screen readers (VoiceOver/NVDA), not just automated linting.
- **Keyboard navigation:** every interactive element (including drag-and-drop exercises, per WCAG 2.2's Dragging Movements criterion above) reachable and operable without a mouse.
- **High contrast mode / dark mode:** both are first-class themes in the design system (Section 17's Tailwind/shadcn choice supports token-based theming natively) — dark mode is also a stated requirement independent of accessibility, so it's built once and serves both.
- **Adjustable font size:** UI respects browser/OS zoom and offers an in-app text-size control that doesn't break layout (relative units throughout, never fixed pixel text).
- **Dyslexia-friendly fonts:** an optional font toggle (e.g., Atkinson Hyperlegible or OpenDyslexic as an alternate body typeface) — a genuinely low-cost, high-value addition to the design system's type tokens.
- **Captions / transcripts:** enforced at the *content governance* layer (Section 5), not left as a style guideline — a listening/video item cannot reach "Approved" status without an attached transcript/captions. Note a deliberate methodology/accessibility tension, resolved explicitly in the EDD (§10): transcripts are always *available on request* (accessibility requirement, non-negotiable), but the default UI hides them until after a listening exercise is attempted (pedagogical requirement — don't let learners read instead of listen). Both requirements are satisfiable simultaneously; flagging the tension here so it's resolved by design, not by accident.
- **Responsive / mobile-first:** the design system is built mobile-first (Section 17), not desktop-first-then-adapted — most language-learning usage happens in short mobile sessions, so this is a product decision as much as an accessibility one.

---

## 12. Localization (i18n)

**Requirement:** the *interface* (navigation, buttons, dashboards, marketing site) must be able to support multiple languages later without a backend rebuild — while the *curriculum content* (the actual English being taught) correctly stays in English regardless of interface language, since that's the product itself.

**Architectural separation this implies (important, easy to get wrong):**
- **UI strings** — navigation labels, button text, error messages, marketing copy — live as translation resources keyed by locale (e.g., via `next-intl` or equivalent Next.js i18n routing), swappable per user preference, English-only content at launch but structurally locale-aware from day one.
- **Curriculum content** — lessons, vocabulary, exercises — is **not** translated; it's the subject matter. The only place a learner's L1 might ever enter the content layer is optional, clearly-scoped glossing (e.g., an optional L1 hint on a vocabulary card) — explicitly **out of scope for now**, not decided against, just not built until we know target L1 markets.

**Why decide this now instead of later:** the cost of building locale-aware routing/string-resource infrastructure into the initial Next.js scaffold (Phase 3) is small; the cost of retrofitting it after hundreds of hardcoded English strings exist across the dashboards is not. This is a "cheap now, expensive later" call, the same category as the Academy-entity modeling decision in Section 18.

---

## 13. User Roles & Access Control

Roles are stored as **data (a `roles` table + a `role_permissions` mapping table), not hardcoded enums or scattered `if (user.role === 'admin')` checks in code.** This is the specific mechanism that satisfies your requirement to "support adding more roles later without major architectural changes" — a new role (e.g., a future Guardian/Parent role for the kids/teens track, or a Billing Admin, or a Support Agent) is a data insert, not a code change or redeploy.

### 13.1 Role definitions

| Role | Responsibilities | Content ownership | Typical dashboard |
|---|---|---|---|
| **Student** | Learn; track own progress | None — consumes Published content only | Student dashboard (Section 14) |
| **Instructor** | Manage assigned cohorts, assign/grade homework, view class analytics | Can *propose* edits, cannot approve/publish | Teacher dashboard (Section 14) |
| **Content Reviewer** | Pedagogical/QA review of Draft content against the EDD checklist | Can request changes or advance to Approved; cannot Draft new content or Publish | Review queue in Curriculum Studio |
| **Curriculum Designer** | Authors/edits lessons, vocabulary, grammar explanations, assessment items | Owns Draft creation and curriculum structure (units/levels) | Authoring view in Curriculum Studio |
| **Academy Admin** | Administers one academy (initially English): manages its instructors/students, publishes Approved content, configures academy settings, views academy-wide analytics | Publish/Schedule authority (final gate in Section 4.1) | Academy admin dashboard |
| **Super Admin** | Platform-level: manages academies themselves (Section 18), global user/role management, security & billing configuration, cross-academy analytics, AI provider configuration (Section 9) | Full, cross-academy | Platform admin console |

### 13.2 Approval chain (content, ties Sections 4–5–13 together)

`Curriculum Designer (Draft)` → `Content Reviewer (Pedagogical Review)` → `Academy Admin (Approve/Schedule/Publish)`. Every transition is attributed and logged (Section 4.3's audit log). An Academy Admin *can* also hold Content Reviewer or Curriculum Designer permissions in a small team — permissions are additive, a person isn't limited to exactly one role.

### 13.3 Forward compatibility (explicitly not built now)

The role table already anticipates, without building: a **Guardian/Parent** role (kids/teens track), a **Billing/Support Admin** role (as B2B grows), and academy-scoped variants of existing roles once Section 18's multi-academy model is real. Naming this now is cheap; it's the reason roles are data instead of code.

---

## 14. Platform Shape / Dashboards

Two learner-facing dashboards plus the admin/studio surfaces defined in Sections 5 and 13, all sharing one design system:

- **Student dashboard:** progress tracker (per-level, per-skill — powered by Section 7's analytics), vocabulary notebook (spaced-repetition-scheduled), saved lessons, flashcard review queue, XP/streak/achievements, certificates earned, recommended next lesson.
- **Instructor dashboard:** lesson plans with objectives/timing (per the EDD's lesson template), class/cohort rosters, homework assignment/tracking, rubric-based grading for writing/speaking submissions, per-student and per-cohort analytics (Section 7). Primary B2B/institutional sales surface — not an afterthought.
- **Academy Admin / Super Admin consoles:** per Section 13's role definitions — publishing control, user/role management, academy or platform-wide analytics.

A conceptual sitemap, detailed user flows, and wireframes remain a dedicated **UX phase** (Phase 2 in the roadmap) — now with a larger, clearer brief given Sections 4–13 above, but still deliberately not designed yet, since building screens before the data model is settled means redoing them.

---

## 15. Security Architecture

| Area | Approach | Rationale / notes |
|---|---|---|
| **Authentication** | Supabase Auth: email/password, magic link, OAuth; MFA (TOTP) required for Instructor/Admin/Super Admin roles, offered to all; short-lived JWTs + refresh tokens | Removes a large, security-sensitive build item from our own scope; MFA mandatory for elevated roles because they're the highest-value targets |
| **Authorization** | RBAC (Section 13) enforced at **two layers redundantly**: application-layer permission checks *and* Postgres Row-Level Security policies | Defense in depth — an app-layer bug alone can't let a Student query another student's data if RLS independently blocks it at the database. This double-enforcement is a deliberate, non-negotiable pattern, not redundant effort to trim |
| **Encryption** | TLS in transit everywhere; encryption at rest (Supabase/Postgres default); no raw payment-card data ever touches our database (Stripe-hosted fields only) | Standard practice; card-data avoidance also shrinks PCI-DSS scope dramatically |
| **Secure APIs** | Input validation (Zod) at every boundary; per-user/IP rate limiting; least-privilege service-role keys (never shipped client-side); CSRF protection; CSP headers; dependency scanning in CI | Prevents the common OWASP-class issues (injection, broken access control) at the framework level rather than per-endpoint discipline alone |
| **Audit logs** | Single shared, immutable `audit_log` (Section 4.3) also covering auth events (login/logout/failed attempts), permission changes, publish/unpublish actions, data export/deletion requests, admin actions | One system to secure and query for compliance instead of two parallel logs drifting apart |
| **Backups** | Automated daily Postgres backups with point-in-time recovery; restore procedure tested on a schedule, not assumed | A backup that has never been restored is unverified — this is a process commitment, not just a checkbox |
| **Disaster recovery** | Documented RPO/RTO targets (e.g., RPO ≤24h, RTO ≤4h at launch, tightening as revenue/scale justify investment); single-region acceptable at launch with a written reassessment trigger | Right-sized for a pre-revenue-to-early-revenue stage; over-building multi-region DR before there's a business to protect would be premature |
| **Privacy / GDPR readiness** | Self-serve data export and account/data deletion (honoring legitimate retention needs, e.g. certificate records); explicit signup consent capture; documented lawful basis; DPA-ready posture with subprocessors (Supabase, Vercel, Stripe, AI providers); data minimization — don't collect fields we don't use | GDPR-readiness habits built now directly de-risk the future kids/teens track's COPPA requirements later — privacy-by-design isn't wasted effort even though the current audience is adults |

---

## 16. Scalability Roadmap

| Stage | Primary bottleneck | What changes | What we explicitly don't do yet |
|---|---|---|---|
| **~100 users** (pilot/beta) | None — proving the product | Single Supabase project, Vercel Pro tier, synchronous AI calls, manual content publishing, basic error tracking (Sentry) | No caching layer, no queue, no read replicas — would be solving problems we don't have |
| **~1,000** | Occasional slow AI-heavy requests blocking the request/response cycle | Background job processing (durable job runner — e.g. Trigger.dev/Inngest, chosen for first-class Next.js/Vercel integration — see Section 17) for writing feedback / pronunciation scoring; DB index/query review; CDN caching already covered by Vercel's edge network | Still no dedicated analytics warehouse; still single DB instance |
| **~10,000** | Read/write contention; hot-path latency | Connection pooling (Supabase's built-in pooler); read replica for analytics/reporting queries so they stop competing with transactional load; caching layer (Redis via Upstash) for hot reads — vocabulary review queues, leaderboards, session state; analytics events routed to their own table(s), not bloating primary transactional tables; staging environment + CI gating on deploys; real rate limiting | Not yet sharding or partitioning by tenant |
| **~100,000** | Single-instance DB capacity; reporting-query cost; AI spend becomes material | Larger dedicated Postgres tier; partitioning of high-volume tables (events, attempts) by time; dedicated analytics/reporting store fed from the events stream rather than querying primary Postgres directly; AI Gateway's cost tracking (Section 9) actively informs provider choice per module; formal on-call/incident process; load testing before major launches | Still single-region unless a specific market demands otherwise |
| **1,000,000+** | Global latency; multi-tenant data isolation at scale (especially once Section 18's multi-academy is real); DB tuning ceiling of a single tuned instance | Partition/shard strategy by `academy_id`; horizontal scaling of stateless compute (already true given serverless/edge functions); dedicated DBA-level tuning; purpose-built infra for specific hot paths (e.g. real-time Conversation Partner sessions on a dedicated websocket service rather than the general app); globally distributed read replicas if user base demands it; formally *tested* (not just documented) disaster recovery; dedicated security/compliance function | — |

**Principle underlying this whole table:** every stage's infrastructure addition is triggered by an observed bottleneck at the *previous* stage, not pre-built speculatively. This mirrors the "architect for it, don't build it yet" discipline applied to the kids/teens track and the multi-academy ecosystem (Section 18) — the same judgment call, applied to infrastructure instead of product scope.

---

## 17. Technology Stack

Updated from v1 with the additions this revision's requirements introduce.

| Layer | Recommendation | Why |
|---|---|---|
| Frontend/full-stack framework | **Next.js (App Router) + React, TypeScript** | SSR/SSG for SEO, RSC for a content-heavy app, dominant choice for this app shape |
| Backend / database | **Supabase** (Postgres + Auth + RLS + Storage + Realtime + Edge Functions) | Relational integrity for curriculum/progress/certificate data; RLS maps directly onto the multi-tenant (academy-scoped) needs in Sections 13 and 18 |
| Type-safe DB access | **Drizzle ORM** | SQL-transparent, good edge-runtime fit, easier to reason about alongside RLS policies |
| Styling / component system | **Tailwind CSS + shadcn/ui**, token-based theming | Fast path to a premium UI bar; token theming is what makes dark mode / high-contrast mode (Section 11) a first-class, not bolted-on, feature |
| i18n | **next-intl** (or equivalent Next.js-native i18n routing) | Satisfies Section 12's locale-ready UI without committing to any specific target language yet |
| Payments | **Stripe**, behind an internal `BillingProvider` interface | Covers every monetization model; the interface, not Stripe itself, is what delivers "monetization-agnostic" |
| AI | **AI Gateway** (internal) fronting swappable provider adapters per module (Section 9) | Non-negotiable provider-independence requirement |
| Pronunciation (Phase 2) | Azure AI Speech Pronunciation Assessment (or equivalent at build time), behind the `PronunciationEngine` adapter | Purpose-built, swappable |
| Background jobs / queue | **Trigger.dev or Inngest** (evaluate both against Vercel-native fit at build time) | Needed starting at the ~1,000-user stage (Section 16) for AI-heavy async work, scheduled content publishing (Section 5), and analytics aggregation (Section 7) |
| Caching | **Redis (Upstash)**, introduced at ~10,000-user stage | Hot-path reads: review queues, leaderboards, session state |
| Transactional email | **Resend** | Clean DX, good deliverability |
| Product analytics | **PostHog** | Also carries the generic half of Learning Analytics (Section 7), avoiding a second bespoke pipeline |
| Error tracking | **Sentry** | Standard, needed from the pilot stage onward per Section 16 |
| Testing | **Vitest** (unit) + **Playwright** (e2e) | Standard, fast, good CI ergonomics |
| Hosting | **Vercel** (frontend) + **Supabase Cloud** (backend) | Zero-config Next.js deploys with per-PR preview environments — valuable given the phase-gated review workflow |
| CI/CD | **GitHub Actions** | Standard, generous free tier |

**Standing architectural rule carried over from v1, now generalized:** curriculum content and all governance-bearing entities (Section 4) live as **data**, not as hardcoded components or flat files — this is what makes review/approval, versioning, and audit possible at all. Every new module added in this revision (Assessment Engine, roles, audit log) follows the same rule: **modeled as data with explicit state, never as implicit code logic.**

---

## 18. Future Expansion — Multi-Academy Ecosystem

**Your framing:** English Academy should be the first academy inside a larger education ecosystem (future verticals: Business English, IELTS, TOEFL, Airline Ticket Sales, Customer Service, Sales, AI, Graphic Design, Programming).

**Where I'd push back, as you invited me to:** I'd draw a hard line between *modeling* for this future and *building* for it. Modeling `Academy` as a first-class entity now — every curriculum, course, role assignment (Section 13), and analytics record scoped by an `academy_id`, with "English Academy" as the one seeded academy — is genuinely cheap to do now and expensive to retrofit later (every table that should have been tenant-scoped from day one becomes a risky migration later). That part, I agree with and have built into Sections 4, 13, and 15 already (RLS policies scoped by academy, roles nameable per-academy).

But actually **building** the multi-academy product surface — an academy-creation flow, a cross-academy marketplace/discovery experience, academy-level billing plans, a Super Admin console for managing multiple live academies — would be solving a problem we don't have yet, at the direct cost of the problem we do have: shipping one excellent English academy. This is the exact same discipline you already agreed to for the kids/teens track ("adults first, kids later phase") — I'm applying it consistently here rather than making an exception because the request is framed as strategic vision. A platform that can theoretically hold ten academies but has zero excellent ones isn't actually closer to the ecosystem vision; a superb English Academy built on ecosystem-ready data modeling is.

**Recommendation:** adopt "architect for it, don't build it yet" as the explicit stance for multi-academy, exactly as already agreed for kids/teens — reflected in the phase roadmap below as a Phase 5+ item, not Phase 1.

---

## 19. Risks & Open Questions

| Risk / question | Why it matters | Recommendation |
|---|---|---|
| EGP licensing terms for commercial use | Used as structural guidance; need to confirm "free for non-commercial use" doesn't restrict a paid product's internal syllabus design | Verify directly with Cambridge/English Profile before Phase 1 content production |
| "2-sigma" mastery-learning claim is discredited | Real risk of an eager marketing draft citing it | Standing rule: cite ~0.3–0.8 SD only, never 2-sigma |
| Certificate legal exposure | Certificates claim CEFR-aligned mastery; must be defensible if disputed | Disclaimer language (Section 8) + raw per-skill Assessment Engine results stored and auditable, not just pass/fail |
| Kids/teens deferred, but data model decisions now could paint us into a corner (COPPA) | Even though kids is a later phase, account/role modeling shouldn't assume "one self-managing adult" is the only shape forever | Roles-as-data (Section 13) and academy-scoped modeling (Section 18) already keep this open; no schema rewrite anticipated |
| Content-quality bottleneck: every module needs your review | Right call for quality; real production-throughput constraint | Decide review batch size (per-lesson vs. per-unit) once we reach content production (Phase 4) |
| **New:** unified Content Item abstraction (Section 4) vs. per-type tables | Simpler governance, but a genuinely large upfront data-modeling decision | Validate the shared-envelope model against 2–3 concrete content types (e.g., a lesson and a listening script) during Phase 1's data-model design, before committing it across all ten+ types |
| **New:** WCAG 2.2 AA specifics cited in Section 11 are from general knowledge, not a freshly-fetched W3C spec | Getting an accessibility standard subtly wrong is a real compliance risk | Confirm against the live W3C WCAG 2.2 recommendation during Phase 2 (UX phase), before final sign-off on accessibility requirements |
| **New:** background-job provider (Trigger.dev vs. Inngest) left as "evaluate at build time" | Both are reasonable; a firm pick isn't needed yet | Decide during Phase 3 (Technical Foundation) when the first real async workload (Section 16) is being built, not speculatively now |

---

## 20. Proposed Phase Roadmap

1. **Phase 0 — Master Blueprint** *(this document + the EDD)* — methodology, curriculum framework, full platform architecture, tech stack direction. **You are here.**
2. **Phase 1 — Curriculum & Data Architecture** — the detailed Pre-A1→C1 unit/lesson map, the lesson template, and the full data model: Content Items (Section 4), Assessment Engine (Section 6), roles/RBAC (Section 13), academy-scoping (Section 18) — validated against the Section 19 open question on the shared Content Item abstraction.
3. **Phase 2 — UX/UI System** — sitemap, user flows, wireframes for student/instructor/admin dashboards, design system (Tailwind/shadcn tokens, dark mode, high-contrast, dyslexia-friendly type), accessibility plan confirmed against live WCAG 2.2 AA spec.
4. **Phase 3 — Technical Foundation** — repo scaffolding, Supabase schema + RLS policies (two-layer auth per Section 15), CI/CD, background-job provider decision, deployment pipeline — proving the platform end-to-end with placeholder content, no real lessons yet.
5. **Phase 4 — Pilot Content & Curriculum Studio v1** — one fully-built unit (Pre-A1 or A1) at full production quality through the real review/approval loop, plus the minimum Curriculum Studio needed to produce it without raw database access.
6. **Phase 5 onward** — scale content production, placement testing goes live, gamification/certification build-out, pronunciation Phase 2, AI Gateway modules beyond the pilot's needs, B2B dashboard depth, kids/teens track, multi-academy product surface.

Each phase still ends with a stop-and-review checkpoint in the format you specified (completed / decisions / alternatives / trade-offs / risks / recommendations / next) before continuing.

---

## 21. Decisions Needed Now

1. The Content Item shared-envelope model (Section 4) and its lifecycle/versioning approach — agree, or prefer per-content-type governance despite the duplication cost?
2. Curriculum Studio built inside the main app rather than as a separate product (Section 5) — agree with the stated trigger for revisiting?
3. Assessment Engine fully separated from the Lesson Engine (Section 6), launching with multi-stage adaptive routing rather than full IRT calibration — agree with deferring true IRT?
4. The AI Gateway pattern (Section 9) as the platform-wide rule for every AI-touching module — agree, and any objection to Draft-only AI output (never auto-published) as a hard rule?
5. Roles-as-data RBAC model and the six roles defined in Section 13 — agree with the responsibilities/approval chain as scoped?
6. The "architect for it, don't build it yet" stance applied to multi-academy expansion (Section 18) — agree with this pushback, or do you want actual multi-academy product surface prioritized sooner than Phase 5+?
7. Updated tech stack additions (Trigger.dev/Inngest, Redis/Upstash, next-intl, Sentry) — any objections before these are locked into Phase 3?
8. The phase roadmap in Section 20 — right order, or would you rather sequence differently given the expanded scope?
