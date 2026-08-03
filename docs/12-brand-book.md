# EREA Brand Book

**Status:** Draft for review · **Date:** 2026-08-03 · **Builds on:** [00-master-blueprint.md](00-master-blueprint.md) §1 (brand identity, reaffirmed not reinvented here), [07-ui-ux-design-system.md](07-ui-ux-design-system.md) (the verified token system this book formalizes as *brand*, not just UI)

**What this document is, precisely:** the Design System (doc 07) governs how the product's interface looks and behaves. This Brand Book governs how the *organization presents itself* — name, wordmark, and the small set of rules that keep every surface (app, marketing site, certificates, email, social) recognizably the same brand. It introduces exactly one new decision (the public/legal name split below) and formalizes decisions doc 07/09 already made rather than re-deriving the palette or type system from scratch.

### Table of contents
1. Brand Architecture — EREA & Elrefaee English Academy
2. Wordmark & Logo
3. Color as Brand
4. Typography as Brand
5. Voice & Tone
6. Usage Rules & Misuse
7. Brand Applications

---

## 1. Brand Architecture — EREA & Elrefaee English Academy

Two names, one organization, used deliberately in different registers — not interchangeably, and not as a puzzle a user has to solve.

| Name | Register | Used for |
|---|---|---|
| **EREA** | Public, everyday brand | App navigation/wordmark, browser tab title, marketing site, social media, day-to-day product communications (in-app notifications, the "from" name on transactional email), casual reference throughout this document series going forward |
| **Elrefaee English Academy** | Legal, formal register | Certificates (Blueprint §8 — credibility depends on the full, real name appearing on the credential itself), Terms of Service/Privacy Policy, the footer copyright line, business correspondence, any accreditation-adjacent or legal document |

**First-mention pairing rule:** the first time a page or document introduces the brand to a new audience (the marketing homepage, an About page, a formal email's opening line), it pairs both — *"EREA — Elrefaee English Academy"* — so the short form is never mysterious. Every subsequent reference on that same page/screen uses **EREA** alone. In-app UI, once a user is past onboarding, uses EREA exclusively; there is no page in the authenticated product where a user needs to see the full legal name in normal use, certificates being the one deliberate exception (Section 7).

**Why this split earns its complexity** (a real question worth answering, not just asserted): "EREA" is short enough to work as UI chrome, a browser tab title, and a favicon monogram — "Elrefaee English Academy" is not. But the *credibility* positioning this entire product is built around (PRD §4.8 — real certification, not a gamified toy) depends on the full, real institutional name appearing where credibility is actually being claimed: a certificate, a legal document. Collapsing to one name either breaks the UI everywhere or weakens the credential everywhere; the split avoids both failure modes deliberately.

---

## 2. Wordmark & Logo

**Reaffirmed, not changed, from Blueprint §1:** no icon or symbolic mark ships at launch. A premium, credibility-first brand earns a mark once it has a reputation to attach one to — inventing an unproven symbol alongside an unproven product is a net negative, not neutral. This Brand Book keeps that call, now applied specifically to the newly-named EREA wordmark.

**Primary wordmark:** "EREA" set in Charter (display serif, doc 07 §4.2), weight 700, in `color-primary-900` (light) / `color-primary-100` (dark) — the exact token pairing already used for the app's `<h1>` treatment (doc 09 §5.1), never a bespoke logo-only color. No letter-spacing adjustment beyond the type system's default (Charter at display sizes already gets `-0.01em` tracking, doc 09 §3).

**Formal lockup:** for marketing/legal contexts needing the full institutional name visible (a letterhead-style treatment, a certificate's header, an About page), "EREA" appears at its normal wordmark size with "Elrefaee English Academy" set beneath it in `text-sm`, `color-neutral-600` (the WCAG-corrected token, doc 09 §2.2), uppercase, `0.06em` tracking — a tagline-style subordinate line, never the same visual weight as EREA itself.

**Favicon monogram — a distinct, narrower decision from "the brand has a logo mark":** a wordmark doesn't survive legibly at 16×16px. The favicon is a single glyph, "E," set in Charter Bold, white-on-`color-primary-600` (the verified 8.04:1 pair, doc 09 §2.1), inside a `radius-md` square. This is a practical, every-site-needs-one necessity, explicitly **not** a broader brand-mark commitment — it never appears anywhere except the browser tab and equivalent OS-level surfaces (PWA icon, if one is ever built).

**Clear space:** minimum clear space around the wordmark equals the cap-height of the "E" in EREA, on all sides, in every context. **Minimum size:** the wordmark is never rendered below 20px cap-height (matches the accessibility floor's spirit — if it's too small to read comfortably, it's too small).

**Misuse — explicit, not left to inference:**
- Never recolor the wordmark outside the two specified token pairings (no accent-gold wordmark, no arbitrary brand colors — this is the same "accent is reserved" discipline from doc 09 §2.2, applied to the wordmark specifically).
- Never add a drop shadow, outline, gradient, or bevel effect.
- Never stretch, condense, or rotate.
- Never place the wordmark on a background that fails the verified contrast pairs (Section 3 below) — a busy photo background behind the wordmark without a solid-color safe area is a misuse, not a design choice.

---

## 3. Color as Brand

Not a new palette — the exact, WCAG-verified tokens from doc 09 §2, now stated as *brand* rules, not just UI rules:

- **`color-primary-600` (#22537F) is the brand color.** It's what the wordmark renders in, what a business card or letterhead would use, what "EREA blue" means if anyone ever says that phrase out loud.
- **`color-accent-500`/`accent-700` (the amber-gold) is never a brand color in the logo/identity sense** — it is reserved, per doc 09 §2.2's already-established rule, for achievement and certification moments inside the product. It does not appear on the wordmark, letterhead, business cards, or any brand-identity surface — restated here specifically because brand collateral is exactly the kind of context where "add a warm accent color" feels like an obvious design instinct, and it's the wrong one for this brand.
- **Neutrals** (the cool-tinted grays, doc 07 §4.1) are the supporting palette for any brand collateral background — never pure white-on-white or an unconsidered off-brand gray.

---

## 4. Typography as Brand

Also not new — doc 07/09's type system, confirmed as the brand's typographic voice: **Charter** (display serif) for anything carrying institutional weight — the wordmark, certificate headings, formal document titles; the **OS-native system font stack** for everything else, including brand collateral body copy, for the identical legibility-first reasoning already established (doc 09 §3). A brand book that introduced a *third* typeface "just for marketing" would be exactly the kind of inconsistency this whole document series has argued against since the Master Blueprint's first page.

---

## 5. Voice & Tone

Encouraging but precise — inherited directly from the EDD's teaching philosophy (EDD §2) and the AI Tutor's behavioral spec (EDD §18), because the brand's voice and the product's pedagogical voice should be the same voice, not two different personalities:

- **Specific over vague.** "Your B1 certificate is ready" beats "Great news!"
- **Earns warmth through substance, not exclamation points.** Consistent with Design System Principle 2 (doc 07 §1.2) — warmth is expressed through restraint and genuine milestones, not constant enthusiasm.
- **Never condescending, never childish.** The primary audience is adults (Blueprint §1); marketing and product copy alike avoid the register EdTech defaults to for younger learners.
- **Honest about limits.** A certificate's disclaimer language (Blueprint §8), an AI Tutor's epistemic-honesty rule (EDD §18) — this isn't just a legal requirement, it's a voice trait: EREA doesn't oversell what it hasn't earned yet, in marketing copy any more than in product copy.

---

## 6. Usage Rules & Misuse

| Context | Correct usage |
|---|---|
| App navigation/header | "EREA" wordmark only |
| Browser tab title | "EREA" (page-specific titles append, e.g. "Unit 4 · EREA") |
| Marketing homepage hero | Formal lockup on first view, "EREA" alone thereafter on the same page |
| Certificate | Full lockup, "Elrefaee English Academy" as the issuer of record (DDD §3.4's `issuer` field literally stores the full legal name, never "EREA") |
| Legal documents, ToS/Privacy, footer copyright | "Elrefaee English Academy" |
| Transactional/notification email "from" name | "EREA" |
| Social media handles/display name | "EREA" |
| Casual internal reference (this document series, code comments, commit messages) | "EREA" — this series will refer to the product as EREA from this document forward, reserving the full legal name for the contexts above |

**A note on `DDD §3.4`'s `issuer` default value:** the certificate table's `issuer` column defaults to `'Elrefaee English Academy'` — this Brand Book confirms that default is correct and should **not** change to "EREA," consistent with Section 1's register split. Flagged explicitly so a future engineer doesn't "simplify" it without realizing the distinction is deliberate.

---

## 7. Brand Applications

- **Favicon:** the "E" monogram (Section 2), applied consistently across every published artifact and the live app from this point forward.
- **Certificates:** full lockup + "Elrefaee English Academy" as issuer (Blueprint §8, DDD §3.4) — unchanged by this document, confirmed consistent with it.
- **Email:** EREA as sender name; footer signature block uses the full legal name once, in small type, alongside standard legal boilerplate (unsubscribe link, physical/registered address once one exists).
- **Metadata (`<title>`, Open Graph, etc.):** "EREA" as the primary product name in every page's metadata going forward — the Sprint 1 app shell's `metadata.title` ("Elrefaee English Academy") is updated to "EREA" as part of this Brand Book's implementation (Phase 2 companion work), with the full name retained in the metadata `description` field where a search engine or share-preview benefits from the fuller institutional name.

---

**Net assessment:** a focused, deliberately small brand system — one new decision (the name split), everything else confirmed rather than reinvented. No logo icon, no new color, no new typeface. Ready for your review.
