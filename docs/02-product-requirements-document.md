# Elrefaee English Academy — Product Requirements Document (PRD)

**Status:** Draft for review · **Date:** 2026-08-03 · **Builds on:** [00-master-blueprint.md](00-master-blueprint.md) (architecture) and [01-educational-design-document.md](01-educational-design-document.md) (pedagogy)

**Note on competitive analysis:** Section 4 is grounded in live web research on the six named competitors rather than assumption, per the standard the rest of this document holds itself to — sourced facts, not guesses.

### Table of contents
1. Executive Summary
2. Problem Statement
3. Target Audience — Personas
4. Competitive Analysis
5. Product Scope (MoSCoW)
6. User Stories
7. Functional Requirements
8. Non-Functional Requirements
9. User Journey
10. Success Metrics (KPIs)
11. Risks
12. MVP Definition
13. Product Roadmap Summary
14. Executive Cross-Functional Review

---

## 1. Executive Summary

### 1.1 Product Vision
A learner anywhere in the world can go from zero English to genuine, certifiable professional fluency in American English — through a single platform that teaches like the best human tutor, remembers what a learner forgot before they do, and proves what they've learned in a way an employer or school can trust.

### 1.2 Product Mission
Combine evidence-based language pedagogy (CEFR, CLT, TBLT, spaced repetition, mastery learning — see [EDD](01-educational-design-document.md)) with AI-augmented, teacher-supported delivery to make real spoken and written fluency achievable, measurable, and credentialed — not just "gamified engagement" measured in streaks.

### 1.3 Success Metrics (headline — full detail in Section 10)
- **Educational:** % of enrolled learners who advance ≥1 CEFR sub-level within 90 days of active use.
- **Business:** Monthly Recurring Revenue (MRR) growth, learner-to-paid conversion rate, net revenue retention.
- **Engagement:** D30 retention, weekly active learners as a % of registered learners.
- **Trust:** certificate completion rate among learners who reach level-end assessment eligibility, and post-certificate learner-reported employer/school acceptance (surveyed).

### 1.4 Business Objectives
1. Prove a defensible, premium adult-ESL product (not a commodity gamified app) capable of sustaining a subscription/B2B business model.
2. Establish teacher/institutional dashboards as a real B2B wedge distinct from consumer-only competitors.
3. Build a data and content moat (proprietary CEFR-mapped item bank, learner performance data) that compounds with scale, per the Master Blueprint's architecture.
4. Keep the architecture ecosystem-ready (Master Blueprint §18) without committing capital to unproven verticals before English is proven.

### 1.5 Educational Objectives
1. Every certified learner can demonstrably perform the CEFR can-do statements for their certified level, across all five skill categories — not just pass a multiple-choice test.
2. Learners retain what they learn — measured directly via the spaced-repetition retention curve (EDD §15), not inferred from lesson-completion counts.
3. Learners actually speak — Speaking is a first-class, assessed skill from Pre-A1 onward, not an optional add-on many competitors treat it as (validated in Section 4).

---

## 2. Problem Statement

### 2.1 What learners struggle with
- **Fluency illusion:** many popular apps optimize for "feels like progress" (streaks, XP, green checkmarks) without producing learners who can hold a real spoken conversation — the mismatch between app engagement metrics and actual communicative ability is a well-documented criticism of the gamified-app category (validated with sourced evidence in Section 4).
- **No credible proof of ability:** a learner who studies independently for a year has no artifact to show a school or employer — informal-learning apps generally don't offer a real, assessed credential; formal-exam prep (IELTS/TOEFL-style) is expensive, high-stakes, and disconnected from day-to-day learning.
- **One-size-fits-all pacing:** fixed-sequence courses don't adapt to what a specific learner has actually forgotten or mastered; learners re-study things they already know and skate past things they don't.
- **Speaking practice is scarce or expensive:** self-study apps mostly avoid real speaking assessment (hard to build); live-tutor platforms (e.g., Cambly-style) solve this but at a real recurring cost and with tutor-quality variance instead of a consistent methodology.

### 2.2 What teachers struggle with
- Cobbling together lesson plans, homework tracking, and grading from disconnected tools (a document for lesson plans, a spreadsheet for grades, a separate app for assigning homework) because most consumer language apps have no teacher-facing surface at all.
- No visibility into *why* a class is struggling — which specific grammar point or vocabulary set is the actual bottleneck — versus just an aggregate score.
- Grading speaking/writing submissions manually at scale, with no rubric consistency across different instructors at the same institution.

### 2.3 What administrators struggle with
- No single system spanning curriculum quality control, teacher performance, and student outcomes — administrators either buy an LMS (generic, not language-pedagogy-aware) or a consumer app (no admin/institutional layer at all).
- Difficulty proving program ROI to stakeholders (parents, employers, funders) without a credible, standardized outcome measure.
- Content quality control at scale — ensuring every teacher/contributor's material meets a consistent pedagogical bar (the exact problem the Master Blueprint's Content Governance system, §4, is built to solve).

### 2.4 Why existing platforms don't fully solve this
Detailed per-competitor evidence is in Section 4; the structural pattern across the category: **consumer gamified apps** (Duolingo-class) optimize engagement over assessed outcomes and mostly lack real B2B/teacher tooling; **live-tutor marketplaces** (Cambly-class) solve speaking practice but at high recurring cost and inconsistent methodology across tutors; **generic MOOCs** (Coursera/Khan Academy-class) offer structured content but aren't purpose-built for language acquisition's specific needs (spaced repetition, pronunciation assessment, CEFR-mapped progression); none of the six researched competitors combine mastery-gated real certification, teacher/institutional dashboards, and AI-augmented practice in one coherent, pedagogically-grounded product.

---

## 3. Target Audience — Personas

### 3.1 Beginner Learner — "Mateo, Pre-A1/A1"
- **Profile:** 27, works in food service, moved to the U.S. 8 months ago, native Spanish speaker.
- **Goals:** hold basic conversations at work and with neighbors; stop relying on translation apps for everyday tasks.
- **Frustrations:** intimidated by apps that assume he already knows the Latin alphabet's English sound-mapping conventions; embarrassed to speak out loud around others.
- **Technical ability:** comfortable with a smartphone, minimal desktop/laptop use — **mobile-first is not optional for this persona.**
- **Learning behavior:** short sessions (5–10 min) squeezed between work shifts; inconsistent schedule.
- **Motivation:** extrinsic and urgent (needs English for his job and daily life) — engagement mechanics (streaks) matter less to him than *speed of visible, usable progress*.
- **Pain points:** existing apps' speaking exercises feel like performing for a stranger; no sense of whether he's "actually getting better" beyond a level-up animation.

### 3.2 Intermediate Learner — "Yuki, B1/B2"
- **Profile:** 24, international student planning to study or work in the U.S., native Japanese speaker, already studied English for years academically.
- **Goals:** move from "textbook English" to natural spoken fluency; prepare for a future academic/professional environment.
- **Frustrations:** strong reading/grammar knowledge but freezes in real spoken conversation ("I know the rule but can't produce it live") — the classic CLT-strong-immersion-vs-explicit-grammar gap the EDD's methodology (§2) is specifically designed to close.
- **Technical ability:** high — comfortable across devices, will use desktop for focused study sessions.
- **Learning behavior:** disciplined, longer sessions (20–40 min), responds well to structured curricula and visible metrics.
- **Motivation:** intrinsic + achievement-oriented — cares about a credible certificate for university/job applications.
- **Pain points:** most apps below her level or shallow at conversational depth; wants real spoken practice with actual correction, not just pattern drills.

### 3.3 Advanced Learner — "Amara, C1"
- **Profile:** 34, mid-career professional, native Yoruba/British-English-schooled speaker, needs to sound natural and idiomatic in American professional contexts specifically (not British English, which she already has).
- **Goals:** polish idiomatic/collocational fluency, master professional register and American-specific pronunciation/vocabulary nuances, get a credential recognized by employers.
- **Frustrations:** most apps have thin or nonexistent C1 content ("everything stops mattering after B2"); nothing addresses the specific AmE-vs-BrE conversion she needs.
- **Technical ability:** very high, expects a polished, professional-grade product experience — low tolerance for a product that feels like a kids' app.
- **Learning behavior:** self-directed, seeks out nuance (collocations, idioms, register) rather than basic drills; likely to use the platform in short professional-context bursts.
- **Motivation:** career advancement; wants efficiency, not gamified filler.
- **Pain points:** condescending UI/content pitched at beginners; lack of depth at her level (directly validates the Master Blueprint's decision to build a real, non-trivial C1 tier — Section 4's competitive research should confirm whether competitors under-serve this tier too).

### 3.4 ESL Teacher — "Priya, Instructor"
- **Profile:** 41, certified ESL instructor at a language institute, teaches 3–5 cohorts of adult learners.
- **Goals:** deliver consistent, high-quality instruction without spending hours on manual admin/grading; actually know which students are falling behind before it's too late.
- **Frustrations:** juggling a patchwork of tools (spreadsheet for grades, separate app for homework, printed worksheets); no visibility into class-wide error patterns.
- **Technical ability:** moderate — comfortable with standard SaaS tools, not necessarily technical.
- **Learning behavior (of the platform itself):** wants to onboard fast, needs the teacher dashboard to be immediately legible, not a training burden.
- **Motivation:** professional pride in student outcomes; time scarcity is her core constraint.
- **Pain points:** rubric-inconsistent grading across colleagues at her institution; no easy way to see "which grammar point is the whole class stuck on" (directly maps to the Learning Analytics teacher dashboard, Master Blueprint §7).

### 3.5 Academy Administrator — "David, Academy Admin"
- **Profile:** 45, runs a mid-size language-institute program (or corporate L&D function) evaluating platforms to license/deploy.
- **Goals:** prove program ROI to stakeholders, ensure consistent content quality across all instructors, manage licensing/billing simply.
- **Frustrations:** most consumer apps have no institutional layer at all; generic LMS platforms aren't language-pedagogy-aware and require heavy internal setup.
- **Technical ability:** moderate-to-high, evaluates products on total cost of ownership and integration ease, not just feature lists.
- **Learning behavior:** evaluates in a sales/procurement context — needs a compelling demo of the Academy Admin dashboard (Master Blueprint §14) and a clear content-governance story (§4) to trust the platform's quality control.
- **Motivation:** budget-accountable; needs measurable outcomes data to justify renewal.
- **Pain points:** no credible way to prove learning outcomes to funders/parents/leadership without a real assessment/certification backbone (directly maps to the Assessment Engine, Master Blueprint §6).

---

## 4. Competitive Analysis

Grounded in live research (August 2026), sourced throughout. Where sources conflicted (a few figures below), that's flagged rather than silently picking one.

### 4.1 Duolingo
- **Model:** Freemium + ads; Super (~$8/mo) and Max (~$168/yr, GPT-4-powered roleplay/video-call practice) tiers; free **Duolingo for Schools** teacher dashboard (K-12-oriented, not a paid enterprise product). [duolingo.com/efficacy](https://www.duolingo.com/efficacy/studies)
- **Mechanics:** Gamified micro-drills (streaks, XP, leaderboards); mostly receptive skills (reading/listening/vocab/grammar) via matching/translation/multiple-choice; Max adds AI conversation practice.
- **Strengths:** Massive scale (4.7★, 47M+ Play Store ratings); an independent peer-reviewed study (Jiang et al. 2021, *Foreign Language Annals*) found course-completers matched **4 semesters** of university instruction on reading/listening; the **Duolingo English Test** is a genuinely recognized credential — accepted by ~95% of U.S. News Top 100 universities and all Ivy League schools.
- **Weaknesses:** Widely documented to under-develop **speaking/production** skills relative to receptive skills; academic critique (Tandfonline systematic review, 2021) characterizes it as largely behaviorist drilling disconnected from authentic communicative use; a 2025 "hearts→energy" mechanic change triggered a measurable backlash (45% of a sampled negative-review set cited it); consumer-complaint sites (Sitejabber, 2.5★) tell a notably worse story than curated app-store scores.
- **Missing opportunity we can take:** no real mastery-gated, multi-skill CEFR certification tied to actual course content (the DET is a separate, generic admissions test, not a "you finished B1" credential); no serious teacher/institutional dashboard beyond a free K-12 companion tool.

### 4.2 Babbel
- **Model:** $8–15/mo subscription (annual cheapest) or $249–299 lifetime; **Babbel Live** (teacher-led group classes) has shifted toward B2B rather than staying a consumer offering; 5,000+ corporate clients via **Babbel for Business** (SSO, admin dashboards, usage analytics). [Babbel for Business](https://www.babbelforbusiness.com/faq/)
- **Mechanics:** Structured, curriculum-driven scenario-based lessons with native-speaker (not synthesized) audio — more traditionally "coursebook-like" than Duolingo.
- **Strengths:** Cites third-party academic studies (Yale, CUNY, Michigan State) on oral-proficiency gains; strong, actively-growing B2B motion.
- **Weaknesses:** Babbel Live quality is teacher-dependent, with reviewers describing "assembly-line" delivery when teachers stick rigidly to slides; **Babbel's own support documentation explicitly states its completion certificates are not formally accredited** — a direct, self-admitted gap in the exact area (credible credentialing) we're building around; revenue/funding figures are inconsistent across public sources (flagged, not load-bearing here).
- **Missing opportunity we can take:** no CEFR-mastery-gated certification of any real external credibility; live-class quality control is inconsistent in a way a rubric-driven, reviewed content model (Master Blueprint §4) is specifically designed to avoid.

### 4.3 Cambly
- **Model:** Pure live-tutoring subscription (~$52–109/mo depending on frequency), no meaningful free tier; tutors paid ~$10–12/hr with **no teaching credential required**.
- **Mechanics:** On-demand 1:1 video conversation with native-English speakers, no structured curriculum backbone; added AI-driven personalized feedback in late 2024.
- **Strengths:** Real, on-demand live human speaking practice — the single gap most other app-only competitors share.
- **Weaknesses:** Explicit, sourced criticism of an "expectation mismatch" — marketed to learners as staffed by "extremely qualified, well-educated professionals" while tutors themselves report the platform positions the work as casual, uncredentialed conversation; very low independent review scores (Trustpilot ~2.1/5, Sitejabber ~1.1/5) with recurring complaints about tutor-quality variance and support.
- **Missing opportunity we can take:** **no proficiency certification of any note** for the core adult product — the clearest gap of any competitor researched; entirely dependent on tutor-to-tutor quality variance with no underlying pedagogical framework or content governance.

### 4.4 EF English Live
- **Model:** 6–12 month subscriptions (~$89–139/mo), pricing **not publicly listed** (funnel-gated) — itself a recurring user/reviewer complaint; strong, longstanding B2B arm via EF Education First (founded 1965).
- **Mechanics:** Placement test → live small-group + private 1:1 classes with EF-employed teachers, 24/7, plus self-study video and speech-recognition exercises — closer to a traditional online school than an app.
- **Strengths:** Real, credentialed teachers (not peer tutors); Trustpilot 4.1/5 (14,427 reviews, "Great"); the **EF SET** is a free, standardized, CEFR-aligned, LinkedIn-shareable test — arguably the second-strongest credential in this whole competitive set after the Duolingo English Test.
- **Weaknesses:** Documented complaints about crowded, low-interactivity group classes and limited individual speaking time; billing/contract complaints including "unlimited" claims that turned out capped, and high cancellation penalties; a real, notable spread between Trustpilot (4.1) and Google Play (3.8/5,880 reviews) ratings; opaque pricing.
- **Missing opportunity we can take:** EF SET is a strong *test*, but it's disconnected from a structured, mastery-gated *learning* progression the way our Assessment Engine (Master Blueprint §6) ties certification directly to the curriculum a learner actually completed; EF's cost structure and contract-commitment model is a clear premium-friction point a cleaner subscription model can undercut.

### 4.5 Coursera (language-learning slice)
- **Model:** Individual courses (~$49–99) or Coursera Plus ($399/yr); mature **Coursera for Business/Campus** enterprise products (this is Coursera's real core competency, not language learning specifically).
- **Mechanics:** Traditional MOOC format (recorded lectures, quizzes, peer/auto-graded assignments) — not a language-app-style daily drill loop; added **Coursera Coach**, an AI tutor (34M+ messages, 2.4M+ learners since launch, 2025 Newsweek AI Impact Award).
- **Strengths:** Real university/company-sourced content; Professional Certificates have measurable (if uneven) employer traction (~87% of US employers reportedly accept online certificates in screening, per cited NACE data).
- **Weaknesses:** MOOC completion rates are a well-documented structural problem across the category — academic sources cite completion rates as low as 15% or less for certificate programs, and Coursera's own certificates are explicitly **not equivalent to a degree** with "essentially zero" recognition in regulated professions; **no CEFR-aligned proficiency certification** for its thin English-learning course slice; no gamified drilling, speaking practice loop, or CEFR placement at all — not purpose-built for language acquisition.
- **Missing opportunity we can take:** Coursera essentially doesn't compete on language-acquisition mechanics at all — English content is a minor corner of a much larger, unrelated catalog. Low direct threat, but a useful proof point that generic MOOC infrastructure doesn't substitute for a purpose-built language platform.

### 4.6 Khan Academy
**Verdict: does not meaningfully compete.** Confirmed directly — Khan Academy has **no dedicated ESL/EFL course**; its "Grammar" content targets native-English-speaking K-12 students, not CEFR-leveled foreign-language acquisition, and there's an open, unfulfilled community request on Khan Academy's own help center asking them to add one. Its AI tutor, **Khanmigo** ($4/mo, free for teachers), is a well-regarded Socratic-method AI layer but sits over unrelated subjects (math, humanities, coding). Included here for completeness and because a Head of Education-level review should be able to show the gap was checked, not assumed — not because it's a real competitive threat.

### 4.7 What the academic research actually says (not just competitor marketing)
This directly informs whether we can credibly claim a "real learning outcomes" differentiation:
- Independent, peer-reviewed evidence (Jiang et al. 2021; a Cambridge *Studies in SLA* controlled comparison) shows app-based learning can match or exceed classroom instruction on **receptive** skills (reading, vocabulary) — but a consistent, multi-study pattern shows classroom/live-instruction models retain an edge specifically on **listening comprehension gains and spoken production**, which app-only tools consistently under-deliver.
- Headline efficacy claims across the *entire* category (Duolingo's "34 hours = one semester," a competitor's "13-hour" counter-claim) are self-funded, company-commissioned marketing research that independent researchers explicitly flag as needing genuinely independent replication — a pattern found industry-wide, not unique to any one competitor.
- Academic literature on gamification specifically documents an **"illusion of learning" risk** — users fixating on streak/point mechanics in a way disconnected from actual proficiency gain — which is precisely the gap between our Gamification (motivational) and Certification (credentialing) layers is designed to close (Master Blueprint §8, restated at every layer per Section 14's review).

### 4.8 How Elrefaee Differentiates — Synthesized
| Gap found across competitors | Elrefaee's answer |
|---|---|
| No competitor combines a mastery-gated, multi-skill, CEFR-traceable certification *tied directly to completed curriculum content* — Duolingo's DET and EF SET are strong but structurally separate from any specific course; Babbel's certificates are self-admittedly unaccredited; Cambly and Coursera have essentially none relevant here | Assessment Engine certification is earned by passing the assessment for content the learner actually completed, with full per-skill auditability (Master Blueprint §8) |
| Every app-only competitor is documented to under-deliver on speaking/production specifically; live-tutor competitors (Cambly) solve this but with well-documented, sourced tutor-quality-control problems | Structured, EDD-governed speaking methodology (EDD §11) plus a phased pronunciation-assessment engine (Master Blueprint §10), not tutor-variance-dependent |
| The "illusion of learning" gamification critique is real, sourced, and industry-wide | Explicit, repeatedly-enforced separation between the motivational layer and the credentialing layer (Master Blueprint §8) |
| Efficacy marketing claims industry-wide are self-funded and treated skeptically by researchers | We should not repeat this mistake — any efficacy claim we make publicly should be flagged internally for independent validation before use, not asserted the way "34 hours" was (carried into Section 11's risk table) |
| No researched competitor has a real, governed teacher/institutional content-quality system — Duolingo for Schools is a free reporting companion, Babbel/EF's B2B strength is sales/admin tooling, not pedagogical content governance | Content Governance lifecycle (Master Blueprint §4) plus RBAC-scoped Instructor/Reviewer/Designer/Admin roles (§13) is a structural advantage, not just a feature checkbox |

**Noted data-quality caveats** (so the PRD doesn't overstate certainty): Babbel's public revenue figures conflict across sources; Cambly's funding status is reported inconsistently; Cambly's and EF's specific B2B/enterprise feature depth and EF's 2024–2026 AI roadmap could not be fully verified in this research pass. None of these affect the differentiation conclusions above, but they shouldn't be cited as precise facts without a follow-up direct check of the companies' own investor/press materials if that precision is ever needed externally (e.g., in a pitch deck).

---

## 5. Product Scope (MoSCoW) — MVP

### Must Have
- Pre-A1 through B1 curriculum (a real, complete sub-ladder — not a thin slice of every level), authored and governed per the Content Governance lifecycle (Master Blueprint §4).
- Student dashboard: progress tracking, vocabulary notebook, spaced-repetition review queue, XP/streaks.
- Instructor dashboard: rosters, homework assignment/tracking, rubric-based grading.
- Core RBAC (Student, Instructor, Content Reviewer, Curriculum Designer, Academy Admin) enforced via the two-layer model (Master Blueprint §15).
- Assessment Engine v1: unit/level checkpoint quizzes, mastery-gated progression (no adaptive placement test yet — see Should Have).
- Certification v1: level-completion certificates through B1, full multi-skill assessment, explicit non-accreditation disclaimer.
- Pronunciation Phase 1 (Web Speech API — record/playback/basic feedback).
- AI Tutor v1 (text-based, scoped guided-discovery behavior per EDD §18) and AI Writing Feedback v1.
- Curriculum Studio v1 (minimum viable authoring tool — enough to not require raw database access, per Master Blueprint §5's sequencing note).
- Accessibility: WCAG 2.2 AA core requirements (keyboard nav, screen reader support, captions/transcripts, adjustable font size, dark mode).
- Auth, billing (Stripe, subscription model live first — see Section 12), core security architecture (Master Blueprint §15).

### Should Have
- B2 and C1 curriculum (extends the ladder once B1 is proven).
- Multi-stage adaptive placement test (Master Blueprint §3.5, §6).
- AI Conversation Partner module.
- Pronunciation Phase 2 (professional phoneme-level scoring engine).
- High-contrast mode, dyslexia-friendly font toggle (beyond WCAG's mandatory floor).
- Academy Admin dashboard depth (academy-wide analytics, content publishing controls) — beyond the MVP's minimum.
- Leaderboards (optional, per the gamification model's "motivational-layer" framing, Master Blueprint §8).

### Could Have
- next-intl-powered localized UI chrome (Master Blueprint §12) — infrastructure-ready but no actual translated locale shipped yet.
- Personalized Study Plans AI module.
- Question Generator AI module (assisting Curriculum Designers, output always entering as Draft).
- One-time-purchase and B2B/institutional billing plans (beyond the MVP's single subscription model).

### Won't Have (for MVP — explicitly deferred, not rejected)
- C2 level content (Master Blueprint §3.1 — out of scope until the core ladder is proven).
- Kids/teens track, guardian-linked accounts, COPPA-specific flows (Master Blueprint §1, §18).
- Multi-academy product surface — academy-creation flow, cross-academy marketplace, per-academy billing plans (Master Blueprint §18's explicit "architect for it, don't build it yet").
- Accredited third-party certification partnerships (Master Blueprint §8 — the `issuer` field exists in the data model but no partner integration ships in MVP).
- Localized (translated) UI in any language beyond English.
- Live human-tutor marketplace features (a deliberate differentiation choice — see Section 4 once the competitive analysis lands, particularly vs. Cambly/EF English Live's live-tutor model).

---

## 6. User Stories

Acceptance criteria use Given/When/Then where it clarifies a specific behavior; simpler stories use a plain checklist.

### 6.1 Student
**US-S1 — Placement onboarding**
> As a new student, I want to find out my current CEFR level before I start, so that I don't waste time on content that's too easy or get lost in content that's too hard.
- *Given* a new account with no prior activity, *when* I complete the self-assessment grid and adaptive test, *then* I am placed at a specific level and unit, and can see why (which skills placed me there).

**US-S2 — Daily learning loop**
> As a student, I want a clear "what should I do today" entry point, so that I don't have to decide for myself what to study.
- The dashboard surfaces exactly one primary recommended action (next lesson or due review queue) plus secondary options; empty/first-day state is handled explicitly (not a blank dashboard).

**US-S3 — Vocabulary review**
> As a student, I want words I'm forgetting to come back to me automatically, so that I don't have to manually decide what to re-study.
- Review queue populates from the spaced-repetition scheduler (EDD §15); a word marked "hard" repeatedly resurfaces sooner than one marked "easy," with no manual scheduling required from the student.

**US-S4 — Speaking practice with feedback**
> As a student, I want to record myself speaking and get feedback, so that I can improve pronunciation without a live human present.
- *Given* a pronunciation exercise, *when* I record and submit, *then* I receive Phase-1 (comparison-based) or Phase-2 (phoneme-scored) feedback within a defined response time (Section 8), and can re-attempt without penalty.

**US-S5 — Progression gate**
> As a student, I want to know exactly what I need to do to advance to the next level, so that progression feels earned and legible, not arbitrary.
- Level/unit progress screen explicitly shows per-skill mastery status against the gate threshold, not just a vague percentage.

**US-S6 — Certificate**
> As a student, I want a shareable certificate after passing a level's full assessment, so that I have proof of my ability I can show others.
- Certificate includes the disclaimer language (Master Blueprint §8), is downloadable/shareable, and links to a verifiable record (not just an image a learner could forge).

**US-S7 — AI Tutor help**
> As a student, I want to ask a question when I'm stuck on a lesson, so that I don't have to wait for a scheduled class to get unstuck.
- AI Tutor responds within the current lesson's context, follows the EDD §18 scaffolding behavior (doesn't just hand over the answer), and clearly hands off to a human instructor if it's not confident.

**US-S8 — Accessibility**
> As a student who uses a screen reader, I want every exercise type (including drag-and-drop) to be fully operable via keyboard/screen reader, so that I'm not locked out of any part of the curriculum.
- No exercise type ships without a verified non-drag, keyboard-accessible alternative interaction (WCAG 2.2, Master Blueprint §11).

### 6.2 Instructor
**US-I1 — Cohort overview**
> As an instructor, I want to see at a glance which students in my cohort are falling behind, so that I can intervene before they disengage.
- Dashboard surfaces an at-risk indicator (e.g., no activity in N days, or repeated failure on the same checkpoint) per student, not just a raw activity log.

**US-I2 — Grading writing/speaking submissions**
> As an instructor, I want a consistent rubric when grading student writing/speaking, so that my grading is fair and comparable across students and consistent with my colleagues'.
- Rubric categories match the EDD's fixed writing-feedback buckets (content/organization/grammar/vocabulary/mechanics, EDD §12); AI Writing Feedback pre-fills a suggested score the instructor can accept or override, never auto-finalizes without instructor sign-off for graded (not practice) submissions.

**US-I3 — Class-wide error patterns**
> As an instructor, I want to see which grammar point or vocabulary set the whole class is struggling with, so that I know what to re-teach instead of guessing.
- Cohort-level aggregated error analytics (Master Blueprint §7), not just individual student scores.

**US-I4 — Homework assignment**
> As an instructor, I want to assign specific lessons/exercises as homework with a due date, so that I can extend classroom instruction outside class time.
- Assigned items appear distinctly in the student's dashboard as "assigned by [Instructor]," with completion tracked back to the instructor's view.

### 6.3 Content Reviewer
**US-R1 — Review queue**
> As a content reviewer, I want a queue of everything awaiting pedagogical review, so that nothing gets published without passing the EDD checklist.
- Queue is filterable by content type/level; each item shows a diff against its last published version (Master Blueprint §4.2) and the EDD §19 checklist inline.

**US-R2 — Request changes**
> As a content reviewer, I want to send content back with specific comments, so that the Curriculum Designer knows exactly what to fix without a separate conversation.
- "Changes Requested" transition requires at least one comment tied to a specific checklist item; content returns to Draft state, original draft is preserved (not overwritten) per the versioning model.

### 6.4 Curriculum Designer
**US-C1 — Author a lesson**
> As a curriculum designer, I want a structured lesson editor that enforces the canonical lesson template, so that I can't accidentally publish something that skips a required step (e.g., no communicative task).
- Editor blocks correspond to EDD §5's structure; submitting for review is blocked if a required block (e.g., CEFR-traceable objective, EDD §3) is empty.

**US-C2 — Manage vocabulary at scale**
> As a curriculum designer, I want to bulk-edit vocabulary entries, so that I'm not hand-crafting hundreds of individual records one at a time.
- Bulk table editor with CEFR-level and stretch-word validation (Master Blueprint §5), sense-specific entries (EDD §7) supported natively, not bolted on.

**US-C3 — Use AI Content Assistant**
> As a curriculum designer, I want AI-drafted content suggestions I can accept, edit, or reject, so that I can move faster without giving up authorship/quality control.
- AI Content Assistant output always lands as an editable Draft attributed to the AI, requiring explicit human acceptance before it can even enter the review queue (Master Blueprint §9's hard rule).

### 6.5 Academy Admin
**US-A1 — Publish approved content**
> As an academy admin, I want to review and publish content that's passed pedagogical review, so that I have final quality control before anything reaches learners.
- Publish action is only available on "Approved" status items (Master Blueprint §4.1); can additionally schedule a future `publish_at`.

**US-A2 — Academy-wide outcomes view**
> As an academy admin, I want to see aggregate learner outcomes across my whole academy, so that I can report on program effectiveness to stakeholders.
- Dashboard aggregates completion rates, certification rates, and engagement metrics academy-wide (not just per-cohort), matching the KPIs in Section 10.

### 6.6 Super Admin
**US-SA1 — Manage roles and permissions**
> As a super admin, I want to add or adjust roles/permissions without needing a code deploy, so that the org structure can evolve without engineering being a bottleneck.
- Role/permission changes are data operations (Master Blueprint §13's roles-as-data model), auditable via the shared audit log (§4.3/§15).

**US-SA2 — Configure AI providers**
> As a super admin, I want to swap or reconfigure which AI provider powers a given module, so that we're never locked into one vendor's pricing or capability ceiling.
- Provider configuration happens through the AI Gateway's adapter configuration (Master Blueprint §9), with usage/cost visible per module before and after a swap.

---

## 7. Functional Requirements

Each feature: **Purpose · Behavior · Inputs · Outputs · Edge cases · Dependencies.**

### 7.1 Authentication
- **Purpose:** securely identify users and establish their role/session.
- **Behavior:** email/password, magic link, and OAuth sign-in; MFA required for Instructor+ roles, offered to Students; session via short-lived JWT + refresh token (Master Blueprint §15).
- **Inputs:** email/password or OAuth token; MFA code where applicable.
- **Outputs:** authenticated session; role/permission set resolved from the roles-as-data model (§13).
- **Edge cases:** account takeover attempt (rate-limited, alerts on repeated failure); expired/revoked session mid-lesson (graceful re-auth without losing in-progress exercise state); email already registered under a different auth method.
- **Dependencies:** Supabase Auth, RBAC (§7.2 below references roles), audit log.

### 7.2 Profiles
- **Purpose:** represent a user's identity, role, and learning/teaching context.
- **Behavior:** student profile includes current level, target goals, native language (optional, for future L1 glossing — Master Blueprint §12), notification preferences; instructor profile includes assigned cohorts and bio; admin profile includes managed academy/scope.
- **Inputs:** user-provided fields at onboarding + editable later.
- **Outputs:** profile data consumed by the dashboard, analytics, and AI modules (e.g., AI Tutor uses current level/context).
- **Edge cases:** a user holding multiple roles (e.g., Academy Admin who also reviews content) needs one coherent profile with role-scoped views, not duplicate accounts.
- **Dependencies:** Authentication, RBAC.

### 7.3 Dashboard (Student / Instructor / Admin — three distinct surfaces)
- **Purpose:** the primary daily-use screen per role, surfacing the single most relevant next action plus supporting context.
- **Behavior:** Student — next lesson/review queue, progress, streak, certificates; Instructor — cohort at-risk view, pending grading, class analytics; Admin — publishing queue, academy-wide KPIs.
- **Inputs:** aggregated data from Learning Analytics (§7.15), Content Governance state, Assessment Engine results.
- **Outputs:** role-specific rendered views; no student ever sees instructor/admin data and vice versa (enforced by RLS, Master Blueprint §15).
- **Edge cases:** brand-new user with zero history (explicit empty/onboarding state, not a blank or broken dashboard); a user with an overdue/lapsed subscription (dashboard should communicate this clearly, not silently degrade).
- **Dependencies:** Learning Analytics, RBAC, Billing.

### 7.4 Courses (Level/Academy structure)
- **Purpose:** the top-level container mapping to a CEFR level within an academy (Master Blueprint §18's `Academy` entity).
- **Behavior:** each course = one CEFR level's worth of units; enforces prerequisite gating (can't enter B1 course without A2 mastery-gate completion).
- **Inputs:** curriculum map (Phase 1 deliverable) defining unit sequence.
- **Outputs:** a navigable course structure exposed to students per their current placement.
- **Edge cases:** a learner placed mid-course by the adaptive placement test (not always starting at unit 1); a learner who fails a level-end assessment (remediation path, not just "try again" with no guidance).
- **Dependencies:** Content Governance (Published content only), Assessment Engine (mastery gates).

### 7.5 Lessons
- **Purpose:** the atomic teaching unit, per the canonical structure (EDD §5).
- **Behavior:** presents warm-up → presentation → controlled practice → communicative task → wrap-up, in sequence; queues vocabulary/grammar into spaced repetition at completion.
- **Inputs:** authored Content Item (lesson type) at "Published" status.
- **Outputs:** completion event (feeds analytics), spaced-repetition queue updates, XP award.
- **Edge cases:** learner exits mid-lesson (resume exactly where they left off, not restart); a lesson referencing vocabulary/grammar not yet formally taught (should be caught at review time, §7.2 of the Master Blueprint's checklist, not at runtime).
- **Dependencies:** Content Governance, Vocabulary system, Gamification (XP).

### 7.6 Units
- **Purpose:** thematic grouping of lessons around one communicative goal, ending in a checkpoint.
- **Behavior:** sequential lesson unlock (or free navigation within a unit — a UX-phase decision, flagged here as open); unit-end checkpoint quiz gates progression to the next unit.
- **Inputs:** ordered set of lesson Content Items.
- **Outputs:** unit-completion status, checkpoint result feeding mastery-gate logic.
- **Edge cases:** a learner who passes the checkpoint without completing every lesson (policy decision needed: allow skip-ahead for a demonstrably competent learner, or require full completion — flagged as an open product decision, Section 14).
- **Dependencies:** Lessons, Assessment Engine.

### 7.7 Exercises
- **Purpose:** in-lesson practice items, retrieval-based by default (EDD §16).
- **Behavior:** presents a prompt, accepts a typed/spoken/selected response, evaluates correctness, provides immediate formative feedback (distinguished from Assessment Engine's summative scoring, EDD §14).
- **Inputs:** learner response (text, audio, drag-drop, selection).
- **Outputs:** correct/incorrect + latency event (feeds analytics), immediate feedback shown to learner.
- **Edge cases:** near-miss typed answers (e.g., minor typo in an otherwise-correct free-text response — needs fuzzy matching, not exact-string-only, to avoid penalizing typos as comprehension failures); drag-and-drop exercises must have a keyboard/non-drag equivalent (WCAG 2.2, §11).
- **Dependencies:** Content Governance, Learning Analytics, Accessibility requirements.

### 7.8 Quizzes
- **Purpose:** checkpoint-level formative/summative assessment within the Assessment Engine.
- **Behavior:** assembled from the item bank per a test blueprint (Master Blueprint §6); scored against the unit/level's mastery threshold.
- **Inputs:** blueprint definition + item bank.
- **Outputs:** pass/fail + per-skill score breakdown, feeding both progression gating and analytics.
- **Edge cases:** a learner who fails narrowly on one skill only (targeted remediation recommendation, not a full unit repeat by default); repeated failures (escalation path — flag to instructor if enrolled in an instructor-led cohort).
- **Dependencies:** Assessment Engine, Content Governance (item bank entries are Content Items too).

### 7.9 Vocabulary (notebook, flashcards)
- **Purpose:** the learner-facing surface for vocabulary acquisition and retention.
- **Behavior:** auto-populates from completed lessons; presents due-for-review items via the FSRS-style scheduler (EDD §15); supports manual bookmarking of any word encountered.
- **Inputs:** lesson completion events, learner recall responses (feeds the scheduler's stability/difficulty model).
- **Outputs:** review queue, retention-curve analytics per word.
- **Edge cases:** a word taught in multiple senses (each sense reviewed independently per the EVP-style sense-specific model, EDD §7); a learner who bookmarks a word above their current level (allowed, but flagged as "stretch" in their personal notebook, not counted against level-mastery calculations).
- **Dependencies:** Lessons, Learning Analytics.

### 7.10 Pronunciation
- **Purpose:** speaking-practice recording and feedback, phased per Master Blueprint §10.
- **Behavior:** Phase 1 — record, play back, compare to reference audio, basic recognition-based feedback (Web Speech API); Phase 2 — phoneme/stress/rhythm/intonation/fluency scoring via a dedicated engine.
- **Inputs:** learner audio recording, target phrase/word.
- **Outputs:** score/feedback object (`PronunciationEngine.assess()` contract, Master Blueprint §10); stored for trend analytics (§7.15).
- **Edge cases:** poor microphone/environment audio quality (must degrade gracefully — tell the learner to retry in a quieter space, not silently mis-score); browser without Web Speech API support (fallback to record/playback-only, no automated scoring, with clear messaging).
- **Dependencies:** AI Gateway (§7.12–7.14 modules), Storage (audio files), Accessibility (an alternative path for learners who cannot produce spoken audio at all — a genuine accessibility gap to design for explicitly, not ignore).

### 7.11 Certificates
- **Purpose:** the credentialing artifact proving level mastery (Master Blueprint §8).
- **Behavior:** issued automatically upon passing a level's comprehensive multi-skill assessment; includes disclaimer language; references the exact Assessment Engine result by foreign key (auditable, per Master Blueprint §8).
- **Inputs:** passed level-end assessment result.
- **Outputs:** downloadable/shareable certificate artifact + a verifiable record (e.g., a unique verification URL/ID a third party could check).
- **Edge cases:** a disputed certificate (must be traceable back to raw per-skill scores, not just a pass/fail flag); a learner who wants to re-attempt after already certifying (policy needed — allow re-certification to reflect improved skill, or treat the original as immutable — flagged as an open decision, Section 14).
- **Dependencies:** Assessment Engine, Content Governance's audit trail.

### 7.12 AI Tutor
- **Purpose:** in-context conversational help scoped to the current lesson.
- **Behavior:** follows EDD §18's full behavior spec (guided-discovery scaffolding, global/local error-correction distinction, epistemic honesty, escalation to human instructor when uncertain).
- **Inputs:** learner's question/message, current lesson context.
- **Outputs:** a scaffolded response (never just "the answer" without pedagogical framing); logged interaction for QA (Master Blueprint §9).
- **Edge cases:** learner asks something entirely off-topic (scope-discipline rule, EDD §18 — redirects rather than answering at length); learner disputes an AI correction (escalates to human Instructor, doesn't argue).
- **Dependencies:** AI Gateway, Content Governance (lesson context), Error Correction Methodology (EDD §13).

### 7.13 AI Writing Coach
- **Purpose:** feedback on writing submissions across the five fixed categories (EDD §12).
- **Behavior:** scores/comments content, organization, grammar, vocabulary, mechanics separately; pre-fills a suggested score for instructor-graded submissions but never auto-finalizes a grade without human sign-off (US-I2).
- **Inputs:** learner's written submission, the task's rubric/objective.
- **Outputs:** categorized feedback + suggested score; feeds the writing-quality analytics metric (§7.15).
- **Edge cases:** off-topic or nonsensical submission (feedback should say so directly, not force a category-by-category score onto ungradable text); plagiarism/AI-generated-submission detection is explicitly **out of scope for MVP** — flagged as a real risk in Section 11, not silently ignored.
- **Dependencies:** AI Gateway, EDD writing methodology.

### 7.14 AI Conversation Partner
- **Purpose:** open(er)-ended spoken/written conversational practice beyond structured exercises.
- **Behavior:** holds a level-appropriate conversation on a given topic/scenario, applies the same error-correction methodology (EDD §13) as the AI Tutor.
- **Inputs:** learner's spoken/typed conversational turns, selected scenario/topic.
- **Outputs:** conversational responses + a post-session summary of notable errors/strengths.
- **Edge cases:** the single highest AI-safety-review-priority module (Master Blueprint §9) — inappropriate learner input, attempts to derail the conversation off-topic, or (once the kids/teens track exists) interacting with a minor all need explicit guardrails before launch, not after an incident.
- **Dependencies:** AI Gateway, strictest safety-review process of any module (§9), Pronunciation (if spoken).

### 7.15 Teacher CMS (Curriculum Studio, Instructor-facing subset)
- **Purpose:** the non-developer authoring/management surface (Master Blueprint §5).
- **Behavior:** structured block-based lesson editor, vocabulary bulk editor, quiz builder against the item bank, media upload with mandatory transcript/caption attachment, scheduled publication, revision history + one-click restore.
- **Inputs:** Curriculum Designer/Reviewer/Admin actions.
- **Outputs:** Content Items moving through the lifecycle (§4.1 of the Master Blueprint).
- **Edge cases:** two Curriculum Designers editing the same Draft simultaneously (needs conflict handling — last-write-wins is not acceptable for a review-gated content system; needs either locking or a merge/conflict UI, flagged as a Phase-3/4 design decision).
- **Dependencies:** Content Governance, RBAC, Accessibility (transcript enforcement).

### 7.16 Analytics
- **Purpose:** the Learning Analytics system (Master Blueprint §7) surfaced through role-appropriate dashboards.
- **Behavior:** event ingestion → computed metrics (mastery-per-skill, CEFR progress, retention curves, bottleneck detection) → role-scoped dashboards.
- **Inputs:** granular learning events from every other feature (lessons, exercises, quizzes, pronunciation, vocabulary).
- **Outputs:** student/instructor/admin dashboard views; exportable reports for Academy Admins.
- **Edge cases:** a new learner with insufficient data for a meaningful trend (dashboards must handle sparse-data states gracefully, not show broken/empty charts); GDPR export/delete requests must correctly remove or anonymize analytics history (Master Blueprint §15).
- **Dependencies:** every learner-facing feature (as an event source), RBAC (access scoping), PostHog + domain-specific Postgres tables.

### 7.17 Notifications
- **Purpose:** re-engagement and time-sensitive alerts.
- **Behavior:** streak-at-risk reminders, review-queue-due alerts, homework due-date reminders (instructor-assigned), content-review-queue alerts (for Reviewers), certificate-earned celebration.
- **Inputs:** triggering events from Analytics, Gamification, Content Governance.
- **Outputs:** in-app, email (via Resend), and optionally push notifications.
- **Edge cases:** notification fatigue (must be user-configurable, not a fixed firehose — ties to Settings §7.20); a learner who's genuinely stopped using the product long-term (re-engagement cadence should taper, not persist indefinitely).
- **Dependencies:** Settings (preferences), Email infrastructure.

### 7.18 Gamification
- **Purpose:** the motivational layer (Master Blueprint §8) — XP, streaks, badges, optional leaderboards.
- **Behavior:** XP awarded per completed lesson/exercise/review; streak counted on any-day-active basis; badges for defined milestones; leaderboard opt-in only (privacy-respecting default-off, per Should-Have scope).
- **Inputs:** completion/activity events.
- **Outputs:** visible XP/streak/badge state on the student dashboard.
- **Edge cases:** must never visually blend with the Certification layer (§7.11) — a real product-design constraint stated explicitly in the Master Blueprint (§8) and worth restating here since it's easy to accidentally conflate in UI design; streak-freeze/vacation-mode handling (a missed day for a legitimate reason shouldn't feel punitive).
- **Dependencies:** Analytics (event source), Notifications.

### 7.19 Search
- **Purpose:** let a learner or instructor find specific content (a vocabulary word, a grammar topic, a past lesson) without browsing the full curriculum tree.
- **Behavior:** searches Published content only for Students; Curriculum Designers/Reviewers can search across all lifecycle states within their permission scope.
- **Inputs:** free-text query.
- **Outputs:** ranked results scoped to what the querying role/user is permitted to see.
- **Edge cases:** search must never surface Draft/In-Review content to a Student (a real content-governance leak risk if search indexing isn't RBAC-aware from the start).
- **Dependencies:** Content Governance, RBAC.

### 7.20 Settings
- **Purpose:** user-controlled preferences.
- **Behavior:** notification preferences, accessibility preferences (font size, high-contrast, dyslexia-friendly font, dark/light/system theme), account/billing management, data export/deletion request (GDPR).
- **Inputs:** user selections.
- **Outputs:** applied preferences across the app.
- **Edge cases:** a data-deletion request must correctly interact with legitimate retention needs (e.g., a certificate record's underlying assessment result — Master Blueprint §15's privacy section already flags this tension; Settings is where the learner actually invokes it).
- **Dependencies:** Accessibility, Billing, Security/Privacy architecture.

---

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Core dashboard/lesson pages: p95 load time < 2.5s on a mid-tier mobile device over 4G. API responses (non-AI): p95 < 300ms. AI-dependent responses (Tutor, Writing Feedback): p95 < 5s, with an explicit loading/typing-indicator state — never a silent hang. |
| **Security** | Per Master Blueprint §15 in full: two-layer RBAC+RLS enforcement, MFA for elevated roles, encrypted transit/at-rest, audited actions, least-privilege service keys. |
| **Accessibility** | WCAG 2.2 AA baseline (Master Blueprint §11), verified against the live W3C spec before each major release, not just at launch. |
| **Scalability** | Follows the staged roadmap in Master Blueprint §16 (100 → 1M+ users) — NFR here is that no MVP architectural decision should block the next stage's addition (e.g., don't hardcode assumptions that prevent adding a caching layer later). |
| **Availability** | Target 99.9% uptime for the learner-facing app post-launch (≈43 minutes/month allowed downtime); status page communicating incidents transparently. |
| **Reliability** | No data loss on a failed AI call, network drop, or browser crash mid-lesson — in-progress state is persisted incrementally, not only on explicit "save." |
| **Maintainability** | Content and configuration are data, never hardcoded (Master Blueprint §17's standing rule); ≥80% automated test coverage on core learning-loop and assessment-scoring logic specifically (not a blanket number across the whole codebase, which would incentivize testing trivial code over what actually matters). |
| **Localization** | UI is i18n-ready (next-intl) from Phase 3 (Master Blueprint §12); zero translated locales required for MVP, but zero hardcoded English strings outside the resource-file layer. |
| **Privacy** | GDPR-readiness per Master Blueprint §15: self-serve export/delete, documented lawful basis, data minimization. |
| **Compliance** | No COPPA obligations at MVP (no under-13 users) — but no MVP data-model decision should require a breaking migration when the kids/teens track adds COPPA scope later (Master Blueprint §18/§19 cross-reference). |

---

## 9. User Journey

**Discovery → First visit:** learner arrives via marketing site (SEO/paid/referral) → sees a clear value proposition distinguishing real certification + AI + teacher support from "another gamified app" (informed by Section 4's differentiation findings) → starts a low-friction signup (no forced long form).

**Onboarding → Placement:** account created → CEFR self-assessment grid (fast, low-friction) → short multi-stage adaptive test → placed at a specific level/unit with a plain-language explanation of *why* → guided first-lesson walkthrough (not just dropped into the curriculum cold).

**Daily learning loop:** returns → dashboard surfaces one clear next action (new lesson or due review) → completes a lesson (warm-up → presentation → controlled practice → task → wrap-up) → vocabulary/grammar auto-queued for spaced review → XP/streak updated → optionally interacts with AI Tutor if stuck.

**Weekly/ongoing:** spaced-repetition review queue resurfaces older material → unit-end checkpoint quiz gates progression → instructor (if enrolled in a cohort) assigns homework, grades writing/speaking submissions with rubric-consistent feedback.

**Level completion → Certification:** learner reaches level-end eligibility → takes the comprehensive multi-skill assessment (Listening/Reading/Writing/Speaking/Grammar/Vocabulary/real-life task) → on passing, certificate issued with disclaimer + verification link → learner is placed into the next level's first unit, momentum preserved (not dumped back to a generic "course catalog").

**Instructor-side (parallel thread):** logs in → sees cohort at-risk view and pending grading queue first (not a generic landing page) → grades submissions with rubric + AI-suggested scores → reviews class-wide error-pattern analytics → adjusts homework assignment accordingly.

**Admin-side (parallel thread):** reviews the content-publishing queue → monitors academy-wide outcome KPIs (Section 10) → manages instructor/student accounts within their academy scope.

**Retention/return after lapse:** a lapsed learner returning after days/weeks away sees a "welcome back" recovery flow — a quick re-placement check on whether their level assessment still holds, not silently resuming as if no time passed, and not forcing a full re-placement either.

---

## 10. Success Metrics (KPIs)

### Educational KPIs
- % of active learners advancing ≥1 CEFR sub-level per 90 days.
- Mastery-gate first-attempt pass rate per level (target range, not just "high" — too high suggests gates are too easy, too low suggests content gaps; needs calibration once data exists).
- Vocabulary retention rate at 30/90-day intervals (from the spaced-repetition scheduler's own tracked recall data).
- Speaking-skill score trend per learner cohort over time (once Pronunciation Phase 2 is live).

### Business KPIs
- MRR and MRR growth rate.
- Free-to-paid conversion rate.
- Net revenue retention (subscription context) / renewal rate (B2B context).
- CAC and CAC payback period, segmented by acquisition channel.
- B2B/institutional pipeline: # of academy-admin evaluation trials → signed contracts.

### Technical KPIs
- p95/p99 latency against the targets in Section 8.
- Uptime against the 99.9% target.
- Error rate (5xx) per 1,000 requests.
- AI Gateway cost-per-active-learner, tracked per module (Master Blueprint §9) — a direct unit-economics signal.

### AI KPIs
- AI Tutor/Writing Coach/Conversation Partner response acceptance rate (learner doesn't immediately dismiss/re-ask).
- Escalation rate to human instructor (too high signals AI capability gaps; too low, monitored alongside qualitative review, could signal the AI is overconfident rather than genuinely accurate).
- Flagged/unsafe-output rate (target: zero tolerance, actively monitored, not just measured).

### Teacher KPIs
- Time-to-grade per submission (should trend down as rubric/AI-assist tooling matures).
- Instructor-reported satisfaction (surveyed) with cohort visibility/analytics.
- Instructor retention/renewal rate (for B2B accounts).

### Student KPIs
- D1/D7/D30 retention.
- Weekly active learners as % of registered.
- Streak-length distribution (a supporting engagement signal, explicitly **not** a proxy for actual learning — cross-referenced against Educational KPIs so the business never optimizes streak length at the expense of real proficiency gain, which is precisely the failure mode Section 2 identifies in competitors).
- Certificate completion rate among learners who reach eligibility.

---

## 11. Risks

| Risk | Category | Mitigation |
|---|---|---|
| Content-production bottleneck — every module needs human review (Master Blueprint §4/§19) | Educational / Operational | Decide review batch size early in Phase 4; consider a small dedicated review team rather than a single-reviewer bottleneck as volume grows |
| AI hallucination in Tutor/Writing Coach — confidently wrong grammar explanation | AI / Educational | Epistemic-honesty behavior rule (EDD §18) + escalation path + logged interactions for ongoing QA sampling, not a "ship and hope" approach |
| AI Conversation Partner safety incident (inappropriate content, especially once minors are in scope later) | AI / Legal | Strictest safety review of any module before launch (Master Blueprint §9); explicit scope discipline; flagged/unsafe-output KPI actively monitored, not just logged |
| Certificate credibility disputed by a learner or employer | Legal / Business | Disclaimer language + full auditability back to raw per-skill Assessment Engine results (Master Blueprint §8) |
| EGP licensing terms restrict commercial use of the grammar-structure spine | Legal | Verify directly with Cambridge/English Profile before Phase 1 content production (already flagged in Master Blueprint §19) |
| Plagiarism / AI-generated learner submissions undermine Writing Coach and certification integrity | Educational / AI | Explicitly out of scope for MVP (§7.13) but flagged here as a real, not-yet-mitigated risk — needs a decision before Writing-based certification scales |
| Market risk — the category (Duolingo-class apps) has trained users to expect free/cheap; premium positioning may face price resistance | Business | Section 4's competitive analysis and differentiation story needs to directly inform pricing/positioning; validate willingness-to-pay before over-investing in premium-only build-out |
| Efficacy-claim credibility — every researched competitor's headline "X hours = Y outcome" claim is self-funded and treated skeptically by independent researchers (Section 4.7) | Business / Legal | Never publish an unverified efficacy claim; any public claim about learning outcomes must be flagged for independent validation before use, not asserted the way "34 hours = one semester" was |
| Data-loss / reliability failure mid-lesson erodes trust fast for a paying product | Technical | Incremental state persistence (§8 NFR), tested restore procedures (Master Blueprint §15) |
| Scalability debt — an MVP shortcut blocks a later scaling stage | Technical | Explicit NFR (§8) that no MVP decision should preclude the staged roadmap (Master Blueprint §16); architecture reviews should check this specifically before each major release |
| Kids/teens and multi-academy scope creep during MVP build, diluting focus | Business / Operational | Both are explicitly Won't-Have for MVP (Section 5) — this table exists partly to keep that decision visible and defensible under future pressure to "just add it" |
| Regulatory risk — GDPR (live) and COPPA (future) compliance gaps | Legal / Compliance | GDPR-readiness built into MVP (§8 NFR); COPPA-readiness deferred but data model kept non-blocking (Master Blueprint §19) |

---

## 12. MVP Definition — Version 1.0

**What's included:** everything in Section 5's Must Have list — Pre-A1 through B1 curriculum; Student and Instructor dashboards; core RBAC (five of six roles active; Super Admin exists but with a minimal console); Assessment Engine v1 (checkpoint quizzes, mastery gating, no adaptive placement test yet — placement uses the self-assessment grid plus a simpler fixed diagnostic, not the full adaptive engine); certification through B1; Pronunciation Phase 1; AI Tutor v1 and AI Writing Feedback v1 (Conversation Partner and Personalized Study Plans are Should/Could Have, not MVP); Curriculum Studio v1 (minimum viable, not the full vision in Master Blueprint §5); WCAG 2.2 AA core compliance; Stripe subscription billing (single plan, not yet the full monetization-agnostic surface — the *architecture* is monetization-agnostic per Master Blueprint §1, but MVP ships one concrete model to validate before building others).

**What's intentionally postponed, and why:**
- **B2/C1 content** — validate the pedagogical model and production pipeline on a smaller ladder (Pre-A1→B1) before scaling content investment across the full ladder.
- **Adaptive placement test** — needs real item-bank attempt data to calibrate meaningfully (Master Blueprint §6); MVP uses a simpler, still-legitimate two-stage placement.
- **Pronunciation Phase 2, AI Conversation Partner** — genuinely higher cost/complexity; validated after there's revenue to justify the spend (Master Blueprint §10).
- **Full Curriculum Studio** — sequenced after the MVP curriculum proves the content model (Master Blueprint §5's explicit sequencing call).
- **Multi-academy, kids/teens** — Section 5's Won't Have list; both are architected for, neither is built.

**MVP success gate (what "done" means, so this isn't open-ended):** the Pre-A1→B1 ladder is fully published and review-approved; a real cohort of learners can be placed, learn, get graded (with instructor support), pass mastery gates, and earn a B1 certificate end-to-end without any manual/developer intervention; the Educational and Student KPIs (Section 10) are instrumented and reporting real numbers, even if targets aren't yet hit.

---

## 13. Product Roadmap Summary

**Version 1 (MVP, per Section 12):** Pre-A1→B1, core dashboards, AI Tutor + Writing Coach, Pronunciation Phase 1, subscription billing.

**Version 2:** Extend curriculum to B2/C1 (full ladder complete); ship the adaptive placement test (now calibratable on V1's real attempt data); Pronunciation Phase 2; AI Conversation Partner; Academy Admin dashboard depth; expand billing to B2B/institutional and one-time-purchase models (the monetization-agnostic architecture from Master Blueprint §1 starts paying off here).

**Version 3:** Full Curriculum Studio (Master Blueprint §5's complete vision); Personalized Study Plans and Question Generator AI modules; accredited third-party certification-partner integration (using the `issuer` field already in the data model, Master Blueprint §8); begin the kids/teens track as its own parallel effort (Master Blueprint §1/§18), not a retrofit.

**Future Vision:** the multi-academy ecosystem becomes real — additional academies (Business English, IELTS/TOEFL prep, and eventually the non-English verticals named in Master Blueprint §18) launch on the same governed content/assessment/AI infrastructure, with English Academy as the proven flagship rather than a one-off product.

---

## 14. Executive Cross-Functional Review

Reviewing this PRD as if from the CEO, CTO, CPO, Lead Engineer, Head of Education, QA Lead, UX Director, and AI Architect's respective vantage points surfaced the following, addressed directly rather than left implicit:

- **(CPO/CEO) Pricing/positioning is asserted, not yet validated.** Section 1's business objectives and Section 11's market risk both name this, but the PRD doesn't yet propose actual price points. **Deliberately left open** — pricing needs the real competitive-analysis data (Section 4) plus, ideally, direct learner willingness-to-pay research, neither of which should be guessed into this document. Flagged as a required pre-launch workstream, not a gap in the PRD's rigor.
- **(Lead Engineer/CTO) Two features have unresolved technical policy questions embedded in their Edge Cases** (§7.6 unit skip-ahead policy, §7.15 concurrent-editing conflict resolution). These are correctly identified as decisions, not silently defaulted — but they need explicit answers before Phase 1 architecture locks them in one way or the other. Carried into Section 15's decision list below rather than left buried in a feature's edge-case bullet.
- **(QA Lead) Fuzzy-matching for free-text exercises (§7.7) needs a defined tolerance policy** (e.g., how many characters of edit-distance count as "correct despite a typo") before QA can write meaningful test cases — currently stated as a requirement without a threshold. Flagged, not fabricated, since the right threshold is a curriculum/UX call, not an engineering guess.
- **(UX Director) The User Journey (Section 9) is strong for the Student path but thinner for Instructor/Admin.** This is intentional given the PRD's word budget and that Section 6/7 already cover those roles in depth via user stories and functional requirements — but the dedicated UX phase (Master Blueprint Phase 2) should produce full journey maps for all three roles, not just extend this section.
- **(Head of Education) Gamification vs. Certification separation (§7.18) is stated as a hard rule for the third time across three documents (EDD, Blueprint, PRD).** That's deliberate repetition, not redundancy — it's the single easiest thing for a UX or engineering team under deadline pressure to accidentally blur, so it's restated at the point closest to implementation each time rather than assumed to carry over from an earlier doc.
- **(AI Architect) AI KPI "escalation rate" (§10) is defined but no target range is given.** Correctly left unset — a target requires baseline data this product doesn't have yet. Noted here so it isn't mistaken for an oversight: it's an explicit "measure first, target later" call, consistent with how the Educational KPIs section handles mastery-gate pass rates.
- **(CTO) Scalability NFR (§8) is a meta-requirement ("don't block the next stage") rather than a hard number**, which is correct at MVP but means it can't be tested automatically. **Recommendation, not yet actioned:** add a lightweight architecture-review checklist item to the Phase 3 technical foundation work, checked against Master Blueprint §16's staged table specifically.
- **No contradictions found between this PRD and the Master Blueprint/EDD** on methodology, role definitions, content lifecycle, or the multi-academy/kids-deferred stance — cross-checked explicitly rather than assumed, since drift between a PRD and its own foundational documents is one of the most common real-world failure modes this review was meant to catch.

**Net assessment:** production-ready as a PRD. Section 4's competitive analysis is now complete and sourced (not a placeholder), and confirms rather than undermines the differentiation strategy in Sections 1–2 — no competitor combines mastery-gated certification, governed content quality, and structured speaking pedagogy the way this product is designed to. What remains is the small set of explicitly-flagged open decisions above, appropriately deferred to Phase 1/Phase 3 rather than guessed here.

---

## 15. Open Decisions Before Phase 1 (SRS)

1. Unit skip-ahead policy (§7.6) — allow a learner to pass a checkpoint without completing every lesson, or require full completion?
2. Certificate re-attempt policy (§7.11) — allow re-certification to reflect improved skill, or treat original certificates as immutable?
3. Concurrent-editing conflict resolution in the Curriculum Studio (§7.15) — locking vs. merge/conflict UI?
4. Free-text exercise fuzzy-matching tolerance (§7.7) — needs a defined edit-distance/typo-tolerance policy.
5. MVP pricing/plan structure — not guessed in this PRD; needs a dedicated pricing workstream informed by Section 4's competitive data.
6. Confirm the MoSCoW scope in Section 5, and the MVP gate definition in Section 12, before Phase 1 (SRS/technical architecture) begins.
