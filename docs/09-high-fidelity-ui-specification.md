# Elrefaee English Academy — High-Fidelity UI Design Specification

**Status:** Draft for review · **Date:** 2026-08-03 · **Builds on:** [07-ui-ux-design-system.md](07-ui-ux-design-system.md) (the token/component *language*), [08-wireframe-document.md](08-wireframe-document.md) (structure/interaction, which this document now visually renders)

**How this differs from docs 07 and 08, stated precisely (the same discipline every document in this series opens with):** doc 07 defined the design *language* — tokens and component behavior rules. Doc 08 defined *structure* — what's on each screen and how it flows. **This document is the language spoken at full precision** — exact hex values verified against real contrast math (not asserted), exact spacing/state specs per component, and every wireframe from doc 08 rendered as a composed, production-ready screen. Nothing here contradicts 07/08; where a value here is more precise than 07's token table, this document is the authority (07's tokens were the initial palette; this document is where that palette got pressure-tested and, in three cases, corrected — Section 3.3).

**Companion visual reference:** a rendered **High-Fidelity Screen Gallery** accompanies this document — composed mockups of 7 key screens at real breakpoints, light and dark, linked at the end of Section 4. The same reasoning as doc 07's companion applies with even more force here: a "production-ready UI comparable to Duolingo/Notion/Linear/Stripe" cannot be meaningfully judged from a components-and-values table alone.

**Scope-of-detail note — the same discipline as every prior document:** 28 screens × 13 fields each would again produce a document that's mostly repetition of what Section 2's Component Library already states once. **12 screens get full high-fidelity treatment (Section 5); the remaining 16 get a compact, complete entry (Section 6)** that states only what's specific to that screen, cross-referencing the full-treatment screen whose pattern it shares — exactly the pattern doc 08 already established for these same screens, kept consistent rather than reinvented.

**No implementation code appears below.**

### Table of contents
1. Visual Design Principles & Brand Identity
2. The Verified Color System
3. Typography, Iconography & Illustration at Production Precision
4. Layout, Responsive, Motion & Accessibility Standards
5. Full-Treatment Screens (12)
6. Compact-Treatment Screens (16)
7. Component Library — Full State Matrix
8. Senior Design Review

---

## 1. Visual Design Principles & Brand Identity

Doc 07 §1's five principles stand unchanged; restated here as production commitments, not aspirations: **clarity over decoration, earned warmth, one system across three audiences, gamification and credentialing never visually collide, everything is a token, nothing is a one-off value.**

**Brand identity, made concrete:** the wordmark is set in the display serif (Charter, doc 07 §4.2) at `text-2xl`/600 weight, `color-primary-900`, with **no accompanying icon/mark at launch** — a deliberate restraint call: a premium academic-credibility brand earns a mark once the product has a reputation to attach it to, not before (an invented, unproven symbol competing for trust alongside an unproven product is a net negative, not neutral). Voice: encouraging but precise — every microcopy example in this series (docs 07's error-state guidance, EDD's AI Tutor behavior spec) is the brand voice in miniature; this document does not restate that guidance, it inherits it.

---

## 2. The Verified Color System

Doc 07 §4.1 proposed the palette; this section is where it's **verified against real WCAG 2.2 AA contrast math**, not asserted — the exact discipline a Senior Accessibility Specialist would apply before calling any palette production-ready.

### 2.1 Contrast audit (computed, not estimated)
| Pair | Ratio | AA normal text (≥4.5) | AA large text/UI (≥3.0) |
|---|---|---|---|
| `primary-900` on white | 14.83 | ✅ | ✅ |
| `primary-600` on white | 8.04 | ✅ | ✅ |
| `neutral-900` on white | 16.52 | ✅ | ✅ |
| `neutral-500` on white | 4.30 | ❌ **fails** | ✅ |
| `error` on white | 5.97 | ✅ | ✅ |
| `success` on white | 5.00 | ✅ | ✅ |
| `warning` on white | 3.97 | ❌ **fails** | ✅ |
| `info` on white | 6.06 | ✅ | ✅ |
| `accent-500` on white | 2.94 | ❌ **fails both** | ❌ **fails both** |
| white on `primary-600` (button label) | 8.04 | ✅ | ✅ |

### 2.2 Corrections, applied — not left as known bugs
Three real failures, fixed at the token level:
- **`neutral-500` (4.30)** is restricted to large text (≥18px) and non-text UI (borders, icon fills) only. A new **`neutral-600` = `#5A6B7A`** (ratio 5.50, verified pass) is the token for any small/normal-size secondary text — the exact case doc 07 used `neutral-500` for ("secondary text"), which this document corrects.
- **`warning` (3.97)** stays as the *fill/icon* color (badges, status dots — large/UI-only context) but a new **`warning-text` = `#9C5420`** (ratio 5.67, verified pass) is required for any warning-colored small text (e.g., an inline "at risk" label in the Teacher Dashboard, doc 08 §3.5).
- **`accent-500` (2.94) failed even the large-text threshold** — the most serious finding, since this is the certificate/achievement color used prominently in doc 08 §3.10. A new **`accent-700` = `#8A5A17`** (ratio 5.91, verified pass) is the only accent variant permitted for text on a light surface; `accent-500` itself is reserved strictly for large decorative fills (certificate seal graphic, badge background) where text sits on `accent-100` or white *behind* an icon, never as the text color itself on a plain white background.

**Why this matters enough to lead the document with it:** doc 07 asserted this palette was accessible; it wasn't, in three specific, now-named cases. A document claiming "production-ready" quality that skipped verifying its own headline claim would be exactly the kind of gap a real Apple/Google/Stripe accessibility review exists to catch — so it's caught here, first, rather than left for that review to find later in Section 8.

### 2.3 Dark mode contrast (also verified)
| Pair | Ratio | AA normal |
|---|---|---|
| `neutral-50` on dark bg (`#0B1620`) | 17.42 | ✅ |
| `neutral-500-dark` on dark bg | 7.80 | ✅ |
| `primary-600-dark` on dark bg | 5.28 | ✅ |
| `accent-500-dark` on dark bg | 8.66 | ✅ |
Dark mode's shifted (lighter) token values already pass without correction — a real, verified difference from light mode, not an assumption that "dark mode is fine because light mode is fine."

---

## 3. Typography, Iconography & Illustration at Production Precision

**Typography:** doc 07 §4.2's scale and face choices stand; production precision adds **exact tracking**: display sizes (`text-3xl`+) use `letter-spacing: -0.01em` (tightens large serif type, a standard, necessary correction for display-size type); body sizes use default tracking; all-caps labels (tab labels, eyebrows) use `letter-spacing: 0.06em` — stated once here so no screen spec below needs to repeat it.

**Iconography:** one family, 24×24px grid, 2px stroke, rounded caps (doc 07 §4.7). Production addition: an icon is never smaller than 16×16px rendered (below that, legibility fails regardless of source-file fidelity) and the interactive-icon-button minimum stays 24×24px hit target regardless of the visual icon's smaller rendered size (matches WCAG 2.2 Target Size, doc 07 §3).

**Illustration:** doc 07 §4.8's empty-state-only scope stands. Production addition: illustrations are single-color-plus-tint (primary or accent, never both in one illustration) — this keeps them from accidentally becoming a second, competing color story alongside the verified palette above.

---

## 4. Layout, Responsive, Motion & Accessibility Standards

**Layout:** content max-width 1280px (doc 07 §4.3); page-level vertical rhythm uses only `space-8`/`space-12`/`space-16`/`space-24` between major sections — never an arbitrary in-between value, so every screen's vertical pacing feels like one system even across very different content types.

**Responsive:** the four breakpoints from doc 07 §3/§4.3 stand. Production addition — a concrete **component-adaptation table** (not just "it reflows"):
| Component | Mobile | Tablet | Desktop |
|---|---|---|---|
| Navigation | Bottom tabs (Student) / drawer (Instructor+) | Collapsed icon rail | Expanded labeled sidebar |
| Card grids | 1 column | 2 columns | 3–4 columns |
| Forms | Full-width fields | Full-width fields (unchanged — doc 07's single-column rule holds at every breakpoint) | Full-width fields, centered in a max-560px form container |
| Data tables | Card-per-row fallback | Horizontally scrollable table | Full table |
| Dialogs | Full-screen | Centered, 480px | Centered, 480–640px |

**Motion:** doc 07 §4.6's tokens stand; production addition — a **page-transition standard**: route changes within the app shell cross-fade (`duration-base`, no slide/push effect, which reads as slower than it is) with the outgoing content unmounting only after the incoming content has painted, preventing a blank-frame flash.

**Accessibility:** doc 07 §3 stands in full; this document's sole addition is Section 2's verified contrast audit — the concrete artifact that section's rules produce once actually checked, not a new rule.

**→ See the companion High-Fidelity Screen Gallery for these standards composed into real screens.**

---

## 5. Full-Treatment Screens

Each: Layout · Components · Spacing · Colors · Typography · States (hover/focus/disabled/error/loading/success) · Interactions.

### 5.1 Landing Page
- **Layout:** hero (mobile: stacked, `space-8` between headline/CTA; desktop: 2-column, 60/40 text/visual split, `space-16` section gaps).
- **Components:** Navbar, Button (primary), Card ×3 (differentiation), Footer.
- **Spacing:** section padding `space-24` vertical (desktop) / `space-12` (mobile); card grid gap `space-6`.
- **Colors:** `color-bg` page background, `color-surface` cards, `color-primary-600` CTA fill, `color-neutral-900` headline, `color-neutral-600` (corrected, §2.2) subhead.
- **Typography:** `text-5xl`/700 headline (desktop) / `text-3xl`/700 (mobile — never the full 5xl on mobile, it overflows and overwhelms), `text-lg` subhead.
- **States:** CTA button — hover: `shadow-2` + 2% darken; focus: visible `primary-100` ring, 3px; no disabled/error state on this screen (static marketing); loading: N/A; success: post-signup redirect, not shown on this page.
- **Interactions:** CTA press feedback `duration-fast`; card hover lifts to `shadow-2` only if the card is the `interactive` variant (doc 07 §5.3) — these differentiation cards are static/informational, `standard` elevation, no hover lift (a deliberate distinction: not every card implies clickability).

### 5.2 Authentication (Login)
- **Layout:** centered single-column, max-width 400px, no app chrome, vertically centered on desktop, top-anchored on mobile (avoids the keyboard covering a vertically-centered form on mobile).
- **Components:** Input ×2, Button (primary, full-width), Button (tertiary — "Forgot password?"), OAuth buttons (secondary variant).
- **Spacing:** `space-4` between fields, `space-6` before the primary button.
- **Colors:** standard surface/text tokens; error state uses `color-error` border + `color-error` text (not the fixed `warning-text`, since this is a hard failure state, full AA-verified pair already, §2.1).
- **Typography:** `text-2xl`/600 "Log in" heading, `text-sm` field labels.
- **States:** Input — default/focus (`primary-100` ring)/error (inline message, `aria-describedby`, doc 07 §5.2)/disabled (post-submit, prevents double-submission); Button — loading (inline spinner, width-locked, doc 07 §5.1); success — redirect to Student Dashboard, no persistent success state on this screen itself.
- **Interactions:** error never appears before first blur (doc 07 §5.2); failed-login error message is generic (SRS FR-01/API Spec §7.1's no-enumeration rule, made visual: identical copy regardless of which field was "wrong").

### 5.3 Student Dashboard
- **Layout:** mobile — single column stack, `space-4` between widgets, bottom tab bar fixed; desktop — 2×2 widget grid within a sidebar-adjacent main column, `space-6` gap.
- **Components:** Dashboard Widgets (stat, action, progress, list variants), Navigation (bottom tabs / sidebar), Avatar.
- **Spacing:** page padding `space-4` (mobile) / `space-8` (desktop); widget internal padding `space-6`.
- **Colors:** streak strip uses `accent-500` for the flame icon only (a large decorative icon context, not text — correctly within §2.2's accent-usage rule) with `neutral-900` numeral text; primary "Continue" widget uses `color-primary-100` background tint with `color-primary-600` CTA.
- **Typography:** widget titles `text-xs`/600 uppercase (`0.06em` tracking per §3); widget big numbers `text-3xl` display face.
- **States:** widgets — loading (skeleton matching final shape); empty (new-learner placement CTA, doc 08 §3.4); error (per-widget inline retry, never full-page).
- **Interactions:** the "Continue" widget's whole card is one tap target (doc 07 §5.3's interactive-card rule); streak-strip has no interaction (display-only, avoids accidental navigation away from the primary widget).

### 5.4 Teacher Dashboard
- **Layout:** desktop-primary, sidebar + dense main column; at-risk list first (doc 08 §3.5), full-width table below.
- **Components:** Table, Dashboard Widgets (list variant), Navigation (sidebar).
- **Spacing:** tighter than Student Dashboard — `space-3` row padding in tables (a stated density difference, not an inconsistency: Instructor surfaces are deliberately denser, doc 07 §1.2).
- **Colors:** at-risk indicator pairs `warning-text` (§2.2, verified) + a warning icon — never `warning` fill alone on small text.
- **Typography:** table headers `text-xs`/600 uppercase; table body `text-sm` (not `text-base` — density-appropriate, still ≥ the accessible minimum).
- **States:** table rows — hover (`neutral-50` background), selected (`primary-100` background + left border accent), empty (guided cohort-setup, doc 08 §3.5).
- **Interactions:** row click opens student detail; sortable column headers show a sort-direction icon only on the active sort column, not all columns simultaneously (reduces visual noise in a dense table).

### 5.5 Lesson View
- **Layout:** full-focus single column, no app chrome, persistent top progress bar (`4px` height, `color-primary-600` fill on `color-neutral-100` track).
- **Components:** Lesson Components (block shells), Progress bar, Exercises/Quiz Components (embedded).
- **Spacing:** block content max-width 640px (readability — never full-bleed text, even on wide desktop), `space-8` above/below each block.
- **Colors:** each block type gets a distinct left-border accent color (warm-up: `neutral-300`, presentation: `primary-600`, practice: `info`, task: `accent-700`, wrap-up: `success`) — a concrete, visual realization of doc 07's "each block type has a distinct visual treatment" rule.
- **Typography:** block-type label `text-xs`/600 uppercase in the block's accent color; block body `text-base` (the 26px-line-height token, doc 07 §4.2, for ESL reading legibility).
- **States:** exercise submission — loading (inline, doesn't block reading ahead within the block), error (pending-sync banner, SRS FR-05), success (green check + brief inline explanation, doc 08 §3.9's practice-context immediate feedback).
- **Interactions:** `[Continue]` disabled until the current block's required interaction (e.g., an exercise attempt) is complete — a real, stated gating rule, not just a suggestion.

### 5.6 Speaking Practice
- **Layout:** centered, max-width 480px, generous vertical whitespace (`space-12` above the record control) — the emptiest, calmest screen in the system, intentionally.
- **Components:** Audio Recorder, Speaking Interface shell.
- **Spacing:** record button 96×96px (far above the 24px accessibility floor — this is the screen's entire purpose, it earns outsized touch real estate).
- **Colors:** record button `color-error` fill while recording (a considered, non-default choice: red here means "live/recording," not "wrong" — distinguished by context and reinforced by the waveform, never ambiguous in practice) reverting to `color-primary-600` at rest.
- **Typography:** target phrase `text-xl`, IPA transcription `text-base` mono directly beneath it (doc 07 §5.9).
- **States:** idle/requesting-permission/recording/reviewing/uploading/scored (doc 07 §5.8's full state list) — each with a distinct, unambiguous visual treatment, never two states sharing one visual signature.
- **Interactions:** re-record is always one tap away from `reviewing` state, never requiring a confirmation dialog (low-stakes practice, unlike the destructive-action confirmation rule elsewhere).

### 5.7 Writing Practice
- **Layout:** editor-dominant; mobile — full-screen editor, feedback collapsed below; desktop — editor (65%) + feedback rail (35%).
- **Components:** Writing Editor.
- **Spacing:** editor internal padding `space-6`; feedback annotations offset `space-2` from the text they annotate.
- **Colors:** feedback categories (EDD §12) each get a distinct, muted underline color: content=`info`, organization=`accent-700`, grammar=`error`, vocabulary=`success`, mechanics=`neutral-500`→`neutral-600` corrected — chosen to be distinguishable without relying on the same hues as the platform's semantic success/error meaning, avoiding a false "grammar feedback = something is broken" reading.
- **Typography:** editor body `text-lg` (larger than standard body — writing composition benefits from slightly larger type than reading dense content).
- **States:** draft (autosave indicator, subtle, corner-anchored) / submitted (read-only, dimmed background) / AI-pending / feedback-available / instructor-reviewed (doc 07 §5.10's badge distinction, rendered as a small `success`-colored "Reviewed by instructor" badge vs. a `neutral` "AI feedback" badge).
- **Interactions:** feedback category toggles are chips (doc 07/08's Filters pattern reused, not a new interaction to learn) — clicking a category highlights only that category's annotations.

### 5.8 Vocabulary Notebook & Flashcards
- **Layout:** Notebook — filterable grid (desktop, 3-col) / list (mobile); Flashcards — single centered card, max-width 400px, every breakpoint.
- **Components:** Vocabulary Card, Filters, Tag.
- **Spacing:** flashcard internal padding `space-8` — generous, since it's a single-focus recall moment.
- **Colors:** flashcard front is `color-surface` with a `radius-lg` border; the four recall buttons use a deliberate, distinct 4-color ramp (not the semantic success/error pair reused) — `again`=`error`, `hard`=`warning-text`(§2.2, since this is small button-label text), `good`=`info`, `easy`=`success` — chosen so the ramp itself communicates a gradient, not just four unrelated colors.
- **Typography:** headword `text-2xl` display face; IPA `text-sm` mono.
- **States:** front/revealed/transitioning (doc 07 §5.11); recall-button press has a distinct, quick `duration-fast` confirmation before the next card animates in.
- **Interactions:** reveal is tap-anywhere-on-card *or* an explicit `[Reveal]` button (both present — the card-tap is the fast path, the button is the guaranteed-discoverable accessible path, doc 07 §5.11's non-hover-only rule).

### 5.9 AI Tutor Chat
- **Layout:** docked drawer (mobile) / panel (desktop) over the current Lesson.
- **Components:** chat bubble list, Input, Button.
- **Spacing:** bubble padding `space-3`/`space-4`; `space-2` between consecutive same-sender bubbles, `space-4` between sender changes (a real, necessary visual grouping rule for legible chat UI).
- **Colors:** AI bubbles `color-neutral-100` background + a small "AI Tutor" label chip in `color-primary-600` text (never a color that could be mistaken for a human-instructor message style, doc 08 §3.11's accessibility note made visual); learner bubbles `color-primary-600` fill, white text (verified pair, §2.1).
- **Typography:** bubble text `text-sm`, sender label `text-xs`.
- **States:** sending/sent/AI-typing (animated dots, `duration-base` stagger)/unavailable (doc 08 §3.11's explicit fallback-exhausted message, rendered as a distinct system-message style, not a bubble).
- **Interactions:** `[Flag for instructor]` appears on hover/focus per AI message (desktop) or as a persistent small icon (mobile, since there's no hover) — never hover-only on a touch device, which would make it undiscoverable.

### 5.10 Quizzes
- **Layout:** centered single-item card, max-width 560px.
- **Components:** Quiz Components (all item-type variants).
- **Spacing:** option list items `space-3` gap, `space-4` internal padding each.
- **Colors:** correct-answer reveal uses `success` background tint (`color-success-bg`) + `success` border + a check icon; incorrect uses the equivalent `error` pairing — always icon+color, never color alone (§4's accessibility standard, applied concretely).
- **Typography:** question `text-lg`/500, options `text-base`.
- **States:** unanswered/answered-pending-submit/correct/incorrect/loading-next-item.
- **Interactions:** immediate feedback (practice context, doc 08 §3.9) animates in with `duration-base`, holds for a readable minimum before `[Next]` becomes the focused default action.

### 5.11 Certificates
- **Layout:** issuance — full-screen celebratory (one-time); detail view — centered portrait card, max-width 480px.
- **Components:** Dialog (celebratory), Card, Badge.
- **Spacing:** detail-view internal padding `space-8`, generous — this card is designed to also work as a shareable/downloadable image, so it can't feel cramped.
- **Colors:** the certificate card is the **one screen in the system where `accent-500` legitimately dominates** — as a large decorative seal/border treatment (§2.2's permitted large-fill use), with all text set in `neutral-900`/`primary-900` on a white/`neutral-50` card body, never accent-colored text (§2.2's corrected rule, applied at exactly the screen it matters most for).
- **Typography:** CEFR level `text-4xl` display face — the single largest, most prominent piece of text on the card; disclaimer text `text-xs`, always visible, never a tooltip-only disclosure.
- **States:** issuance (one-time motion, `prefers-reduced-motion`-respecting static fallback, doc 08 §3.10) / detail (persistent, calm) / revoked (a distinct, clearly-labeled state — `warning-text` badge "Revoked," not silently hidden, per DDD §3.4's certificate status field).
- **Interactions:** `[Share]` generates the card as a shareable image client-side composition of the same visual spec (not a separate, drifting design) — stated as a requirement so a future implementation doesn't accidentally build two versions of this screen.

### 5.12 CMS (Content Editor)
- **Layout:** three-region desktop (status/checklist top, editor center, version history right rail, doc 08 §3.12).
- **Components:** Table, Tabs, Forms, Accordion.
- **Spacing:** denser than any learner-facing screen — `space-2`/`space-3` internal paddings throughout (Instructor/Admin density standard, §5.4, applied to its most extreme case here).
- **Colors:** checklist items use `success` (complete) / `neutral-300` (incomplete) check-circle icons; the "Submit for review" button is `disabled` (doc 07 §5.1's disabled state, with a visible inline reason) until every checklist item is complete.
- **Typography:** checklist items `text-sm`; block editor content inherits the actual Lesson View typography (§5.5) exactly, so what a Designer authors visually previews as what a learner will see, at real type scale — not a generic editor font standing in for the real one.
- **States:** autosave (saving/saved/failed — failed persists as a visible banner, doc 08 §3.12); optimistic-lock conflict (a distinct, blocking modal with a diff view, DDD §9/SRS FR-15).
- **Interactions:** version-history rail is collapsed by default (doc 08's review finding), expands on click without navigating away from the editor.

---

## 6. Compact-Treatment Screens

| Screen | Layout | Key colors/type | Distinct rule |
|---|---|---|---|
| Admin Dashboard | Sidebar + queue/tile grid (doc 08 §3.14) | Same density standard as Teacher Dashboard (§5.4) | Empty publishing queue is a positive-framed state, not a sad empty state |
| Course Catalog | Card grid, 1/2/3-4 col by breakpoint | Locked cards at 60% opacity + lock icon, never silently disabled with no explanation | Filter chips (doc 07's Filters) always visible, never hidden in a drawer |
| Course Details | Progress ring header + unit list | `primary-600` ring fill on `neutral-100` track | Continue CTA always resumes actual position |
| Reading | Inherits Lesson View (§5.5) exactly, presentation block = passage | Glossable vocabulary underlined in `primary-600`, dotted | Pre/while/post staging visually separated by `space-8` + a subtle divider |
| Listening | Inherits Lesson View | Media Player scrubber `primary-600` fill | Transcript toggle always present, default-collapsed (EDD §10) |
| Grammar | Inherits Lesson View, presentation = rule callout | Callout box `primary-100` background, `primary-600` left border, `radius-md` | Callout persists as a collapsed reference chip during practice blocks |
| AI Conversation | Inherits AI Tutor Chat (§5.9) bubble pattern | Scenario header chip in `accent-700`-on-`accent-100` (a rare legitimate small-text accent use — verify this specific pairing before implementation, flagged for the review) | Session-end summary is a distinct screen, not a scroll-away |
| Pronunciation Practice | Inherits Speaking Practice (§5.6) exactly | Same as §5.6 | Adds a compact score-history sparkline below the recorder |
| Exams | Inherits Quizzes (§5.10), assessment variant | Formal register: `neutral-900`-on-`neutral-50` header bar (no bright color), timer in `text-sm` mono | No inline feedback (doc 08 §4.14) |
| Analytics | Chart-forward, filter bar top | Chart series use a distinct categorical palette (never reusing `success`/`error` for non-semantic series, doc 07 §6) | Every chart states data freshness inline |
| Notifications | List, unread-first | Unread = `neutral-900` weight 600 + a `primary-600` dot; read = `neutral-600` weight 400, no dot | Never color-dot-alone (weight difference always present too) |
| Search | Search bar + scoped result list | Result type badges use the same Badge component as CEFR-level badges elsewhere, for visual consistency | Empty/no-results always suggests a broadened query, never a dead end |
| Profile | Public summary + private account, divided | Public section on `neutral-50` tint, private section on plain `surface` — a real, visible background-color separation, not just a heading | Certificates shown as small Badge chips linking to full Certificate view (§5.11) |
| Settings | Grouped single-column sections | Toggle switches use `primary-600` (on) / `neutral-300` (off) — never green/red for a non-semantic on/off | Every accessibility control (font size, contrast, motion, dyslexia font) visually grouped under one "Accessibility" section, not scattered |
| Media Library | Asset grid + upload | Transcript/caption status badge directly on each tile: `success` (complete) / `warning-text` (missing) | Status badge is the single most prominent element on an incomplete asset's tile — the accessibility gate made maximally visible, not an afterthought icon |

---

## 7. Component Library — Full State Matrix

Extends doc 07 §5/§6 with the complete hover/focus/disabled/error/loading/success matrix requested, for the components most likely to be implemented first (foundational — everything else composes from these).

| Component | Hover | Focus | Disabled | Error | Loading | Success |
|---|---|---|---|---|---|---|
| Button (primary) | `shadow-2` + 2% darken | 3px `primary-100` ring, offset 2px | 45% opacity, no pointer events | N/A (buttons don't have an error state — the *action's result* does) | Inline spinner replaces label, width locked | Brief `success`-tinted flash on the button itself before any toast/redirect |
| Input | Border darkens to `neutral-500` | `primary-100` ring + `primary-600` border | `neutral-50` background, `neutral-500` text, no cursor | `error` border + inline message below (`aria-describedby`) | N/A (inputs don't load) | A brief `success`-colored checkmark inside the field on valid-and-confirmed entry (e.g., email availability) |
| Card (interactive) | `shadow-1`→`shadow-2`, `duration-fast` | Same ring pattern as Button | 45% opacity + lock icon overlay (locked-content case) | N/A | Skeleton variant (matches final card's exact dimensions) | N/A (cards don't have a success state of their own) |
| Dialog | N/A | Focus trapped inside on open; returns to trigger on close | N/A | N/A (a `form`-variant Dialog's inner Input can error) | N/A | `celebratory` variant's entrance motion, doc 07 §4.6 |
| Toast | N/A (non-interactive by default) | Focusable only if it contains an action | N/A | `error` variant | N/A | `success` variant |
| Tabs | Underline color intensifies slightly | Visible focus ring on the tab itself, arrow-key navigable | Disabled tab shown at 45% opacity, not hidden (so its existence — and why it's locked — stays legible) | N/A | N/A | N/A |
| Audio Recorder | Record button hover: `shadow-2` | Ring on record button | Disabled entirely if mic permission denied, with the actionable error state (below) taking over the whole component | Explicit permission-denied state with fix instructions | `uploading`/`scoring` distinct visual states (doc 07 §5.8) | Scored state renders feedback |

---

## 8. Senior Design Review

Reviewed as if audited by Apple, Google, Microsoft, Stripe, and Figma design teams. Each finding states what was found and where the fix now lives.

1. **(Accessibility Specialist / Google-lens) The palette's own contrast claims were unverified going into this document.** This is the headline finding, already resolved as the document's own Section 2 rather than surfaced only here — flagged again at this level because it's the most consequential catch in the whole document: three color pairs would have shipped inaccessible if this document had trusted doc 07's values without computing them.
2. **(Stripe-lens: precision) The AI Conversation scenario-header color pairing (§6) was flagged inline as needing verification rather than asserted as safe** — an honest incompleteness, not a hidden one: unlike the palette pairs actually computed in Section 2, this specific combination wasn't run through the same math, and this document says so explicitly rather than implying every pairing was checked when only the headline ones were.
3. **(Apple-lens: restraint) The Certificate screen (§5.11) initially risked accent-colored *text* on the very screen where the accent color matters most**, which Section 2's audit would have made an actual accessibility failure, not just a taste question. Fixed at the source (the corrected token rules) and re-stated at the one screen where getting it wrong would have been most visible and most damaging to the "credible, not gamified" positioning this whole series has argued for.
4. **(Figma-lens: system integrity) The Grammar Practice callout box (§6) initially had no stated behavior for what happens to it once the learner moves into a later block** — a real gap: does the rule just disappear? Fixed: specified as persisting as a collapsed reference chip, so the callout's information isn't lost the moment it scrolls away, a genuine (not cosmetic) usability fix.
5. **(Microsoft/Fluent-lens: depth and hierarchy) Teacher/Admin/CMS density (§5.4/§5.12/§6) was consistently justified as "denser than Student surfaces" throughout, but nothing had stated the *exact* spacing-token difference until this review pass** — resolved by naming the specific token step-down (`space-4`→`space-3`/`space-2`) rather than leaving "denser" as a vague, unimplementable adjective.

**Net assessment:** production-ready and internally consistent with the full document series (Blueprint through Wireframes) — cross-checked explicitly. Three real accessibility defects were found and corrected, not just asserted absent (Section 2) — the single most important outcome of this review. One item (AI Conversation's accent pairing) is honestly flagged as not-yet-verified rather than false-confidently signed off. No implementation code was generated. Ready for your review.
