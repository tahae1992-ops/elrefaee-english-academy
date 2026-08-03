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

**Superseded 2026-08-03:** the "no icon yet" decision below (kept visible, struck through in spirit rather than deleted, so the reasoning trail stays honest) was reaffirmed once and then explicitly reversed at your direction, with a full asset set requested. The reasoning wasn't wrong for where the product was — it's superseded because the situation changed: you made a deliberate call to invest in a real mark now rather than wait. That's a legitimate call for the product's owner to make; this document's job is to make the reversal visible, not to pretend it was the plan all along.

> ~~No icon or symbolic mark ships at launch. A premium, credibility-first brand earns a mark once it has a reputation to attach one to — inventing an unproven symbol alongside an unproven product is a net negative, not neutral.~~

### 2.1 The mark

**Construction:** three horizontal bars, left-aligned, of increasing length (34 / 55 / 76 units — a clean, repeatable +21 step), rounded pill ends, 14-unit height, 8-unit gap, symmetric margins. The shared left edge implies a vertical spine without drawing one — read as an abstract **E** (EREA) at a glance, while the ascending lengths read as **progression through levels**, the product's actual core mechanic (Blueprint §3's CEFR ladder), without a single literal education cliché. No graduation cap, book, globe, flag, or pencil appears anywhere in this system, by explicit instruction and by design — the mark earns recognition through geometric precision and repetition, not through borrowed symbolism.

**Why this construction and not another:** it had to (a) connect to the name, (b) connect to what the product actually does, (c) survive being shrunk to 16px, and (d) not look like anything else in the EdTech category, which skews heavily toward mascots, open books, and graduation iconography (PRD §4's competitive research already documented this pattern across Duolingo/Babbel/Cambly/EF). An abstract geometric ascent satisfies all four without needing an origin story stretched past what it can bear.

**Color:** `#22537F` (`color-primary-600`) on light surfaces; the app-icon/favicon/social-avatar variants invert to white-on-`#22537F` fill for sufficient contrast at small sizes (verified pair, doc 09 §2.1, 8.04:1). The mark never appears in the reserved accent gold (doc 09 §2.2's rule, restated here because a "logo" is exactly the kind of asset someone will reach for that color on by instinct).

### 2.2 The asset set

Seven production SVG files, `web/public/brand/`:

| File | Use |
|---|---|
| `logo-primary.svg` | Horizontal lockup (mark + "EREA" wordmark) — app navigation, marketing header, anywhere there's room |
| `logo-secondary.svg` | Stacked lockup (mark above, wordmark centered below) — square/constrained contexts the primary lockup doesn't fit |
| `monogram.svg` | The mark alone, on-light — standalone symbolic use |
| `app-icon.svg` | Mark on a filled rounded-square, white-on-brand-blue — app/PWA icon convention, 512×512 |
| `favicon.svg` | Same construction, optimized for 32×32 browser-tab rendering |
| `social-avatar.svg` | Mark scaled to 65% and re-centered specifically so a circular crop (most social platforms) never clips a bar — verified: the farthest mark point sits ~31 units from center on a 50-unit-radius canvas |
| `watermark.svg` | Mark at 10% opacity, brand color (not generic gray, so it still reads as EREA even faintly) — certificate/document overlay use |

**Honest production caveat:** the wordmark in `logo-primary.svg`/`logo-secondary.svg` is live SVG `<text>` in the Charter font stack, not outlined vector paths. This renders correctly and consistently across web/digital use (the only context these ship into today) but should be converted to outlined paths by a design tool before any print, embroidery, or third-party platform use where the Charter font isn't guaranteed available — flagged now so it isn't discovered the hard way later.

**Explicitly not built yet, and why that's fine:** dark-background reversed variants of the two full logos (the wordmark text needs a light-on-dark color swap to stay legible there). The app's own UI handles this correctly today via a live component that responds to the theme tokens directly (Section 7), rather than a static asset — the static files are for external/portable use, where a v1 scope of "light background" is a reasonable, deliberately incomplete start, not an oversight. Same "architect for it, don't build every variant yet" discipline this project has applied consistently since the Master Blueprint.

**Clear space:** minimum clear space around any lockup equals the height of one bar (14 units in the mark's native coordinate system), on all sides. **Minimum size:** the monogram/app-icon construction remains legible down to 16×16px (verified by the favicon variant); a full lockup (primary or secondary) is never rendered below 24px mark-height.

**Misuse — explicit, not left to inference:**
- Never recolor outside the specified pairings — no accent-gold mark, no arbitrary brand colors (doc 09 §2.2's reserved-accent rule, restated here because a logo is exactly the asset someone reaches for that color on by instinct).
- Never add a drop shadow, outline, gradient, or bevel effect. The mark's entire premium/minimal quality comes from flat geometric precision — any applied effect undoes that immediately.
- Never stretch, skew, or rotate. Never change the relative bar-length ratios (34:55:76) — they're the specific, repeatable geometry that makes this mark *this* mark, not an arbitrary "some ascending bars" placeholder.
- Never place on a background that fails the verified contrast pairs (Section 3) — a busy photo background without a solid-color safe area is a misuse, not a design choice.
- Never reconstruct the mark by eye in a new tool — always start from the SVG source files, whose coordinates are exact and intentional.

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

- **Favicon:** `favicon.svg` (Section 2.2), replacing the generic Next.js default — live in `web/src/app/icon.svg` via Next's file-convention icon, applied across every browser tab and OS-level surface.
- **App icon:** `app-icon.svg` — the same construction at production resolution (512×512) for any future PWA/native app-icon need.
- **Loading screen:** the app's route-level loading state (`app/[locale]/loading.tsx`) renders the monogram mark centered, respecting `prefers-reduced-motion` for any transition — the first brand-bearing thing a user sees on a slow connection, not an unbranded spinner.
- **Homepage:** the Primary Logo lockup (live component, Section 2's asset set backing it) replaces the text-only "EREA" heading used since Sprint 1.
- **Certificates:** full lockup + "Elrefaee English Academy" as issuer (Blueprint §8, DDD §3.4) — unchanged by this document, confirmed consistent with it; the certificate template is a natural future home for the Secondary Logo or a watermark once Assessment/Certificates (Sprint 7) is built.
- **Email:** EREA as sender name; footer signature block uses the full legal name once, in small type, alongside standard legal boilerplate (unsubscribe link, physical/registered address once one exists).
- **Metadata (`<title>`, Open Graph, etc.):** "EREA" as the primary product name in every page's metadata — set in Sprint 1.5's implementation and unchanged by this revision; the full name stays in the metadata `description` field where a search engine or share-preview benefits from it.
- **Social profiles:** `social-avatar.svg` — the circle-crop-safe variant, ready for direct upload to any platform.

---

**Net assessment:** the brand system now has a real, deliberately geometric mark — reversed from this document's own earlier "no icon yet" call, at your explicit direction, with that reversal made visible rather than smoothed over (Section 2). Seven production SVG assets, one construction, no borrowed education iconography. Ready for your review.
