# Elrefaee English Academy — Educational Design Document (EDD)

**Status:** Draft for review · **Date:** 2026-08-03 · **Companion to:** [00-master-blueprint.md](00-master-blueprint.md)

This is the academy's educational constitution. It governs how content gets *made*, the way the Master Blueprint governs how the *platform* gets built. **No lesson, exercise, assessment item, or AI-tutor response should ever violate what's defined here.** Where the Master Blueprint's Content Governance lifecycle (§4) asks "has this content passed pedagogical review," the checklist it's reviewed against is §19 of this document.

### Table of contents
1. Purpose & Authority
2. Teaching Philosophy
3. CEFR Implementation Strategy
4. American English Standards
5. Lesson Structure
6. Grammar Progression Methodology
7. Vocabulary Progression Methodology
8. Pronunciation Methodology
9. Reading Methodology
10. Listening Methodology
11. Speaking Methodology
12. Writing Methodology
13. Error Correction Methodology
14. Assessment Methodology
15. Review Strategy (Spaced Repetition)
16. Active Recall Strategy
17. Teacher Methodology
18. AI Tutor Behavior
19. Content Quality Standards (the publication checklist)

---

## 1. Purpose & Authority

This document translates the Master Blueprint's Section 2 methodology summary into concrete, applicable rules a Curriculum Designer, Content Reviewer, Instructor, or AI content-generation module can follow without having to re-derive pedagogical theory each time. When a lesson doesn't fit a rule cleanly, the *rationale* behind the rule (not just the rule) should resolve the judgment call — which is why every methodology below states its evidence, not just its instruction.

---

## 2. Teaching Philosophy

We teach English as a tool for real communication, built on explicit, structured knowledge — not immersion alone, and not rote drilling alone. A learner should always know *why* a structure works the way it does, and should always be pushed, quickly, to *use* it for something real. Progression is earned through demonstrated ability, not time spent or content merely viewed. Motivation is engineered deliberately (spaced review, streaks, visible progress) because relying on a learner's willpower alone is not a teaching strategy — it's an absence of one.

This is the hybrid model from the Master Blueprint §2, restated as a philosophy rather than a table: **CEFR gives us the destination map; CLT (weak form) and TBLT give us how a lesson is taught and practiced; spaced repetition and active recall give us how it's remembered; mastery learning gives us when a learner is allowed to move on; project-based capstones give us how it's proven and celebrated.**

---

## 3. CEFR Implementation Strategy

Every lesson objective is written to a fixed template, so a Content Reviewer can check CEFR-traceability mechanically rather than subjectively:

> *By the end of this lesson, learners will be able to **[CAN-DO STATEMENT, drawn from or closely modeled on the CEFR 2020 Companion Volume's illustrative descriptors]** using **[TARGET GRAMMAR STRUCTURE, sourced from the Cambridge EGP at this CEFR level]** and **[TARGET VOCABULARY SET, sourced from the Oxford 3000/5000 AmE edition at this CEFR level]**, in the context of **[COMMUNICATIVE SITUATION]**.*

A lesson with no traceable can-do statement, or one borrowing grammar/vocabulary from above its stated level without an explicit "stretch" flag, fails review (§19).

**Spiral, not linear, progression:** a grammar structure taught at A2 reappears at B1 and B2 in more complex form and in harder communicative contexts (recycling principle) — the curriculum map (Phase 1 deliverable) must show these recurrence points explicitly, not just a single first-appearance.

---

## 4. American English Standards

- **Pronunciation reference:** General American (GenAm) IPA, transcribed per **Wells's *Longman Pronunciation Dictionary*** conventions — the same standard Oxford/Cambridge/Longman dictionaries use, so a learner's IPA literacy transfers outside the app.
- **Spelling rules** (encoded as systematic transformation rules, not a word list, so new vocabulary automatically inherits the right form):

| Pattern | British | American |
|---|---|---|
| -our / -or | colour, favour | color, favor |
| -ise/-yse vs -ize/-yze | organise, analyse (also valid: -ize) | organize, analyze (standardized) |
| -re / -er | centre, theatre | center, theater |
| Consonant doubling | travelling, cancelled (always doubles) | traveling, canceled (doubles only if final syllable stressed) |
| -ence / -ense | defence, licence (n.) | defense, license |
| -ogue / -og | catalogue, dialogue | catalog, dialog (both forms exist; catalog/dialog preferred) |

- **Vocabulary:** Oxford 3000/5000, **American English edition** specifically — Oxford publishes this as a distinct list, so this is a direct resource match, not an adaptation.

---

## 5. Lesson Structure

Canonical template every lesson follows (target 20–30 minutes for an adult self-paced online session):

1. **Warm-up** — activate prior knowledge/schema, 2–3 minutes.
2. **Presentation** — explicit teaching of the target grammar/vocabulary (focus-on-form, per Master Blueprint §2's CLT-weak-form rationale) — never left implicit.
3. **Controlled practice** — retrieval-based exercises (§16), not passive recognition, using only the lesson's own target items.
4. **Communicative task** — a TBLT-style real task requiring the target language, tied to the lesson's can-do objective.
5. **Wrap-up / consolidation** — brief summary; target vocabulary/grammar chunks are queued into spaced repetition (§15) here, not left to a separate step the learner might skip.

Every lesson also carries an embedded **teacher note** field (objective, timing breakdown, common learner errors to watch for, suggested extension/homework) — authored alongside the lesson, not bolted on later, so Instructor-mode (§17) is never a second-class citizen of the content pipeline.

---

## 6. Grammar Progression Methodology

Sequenced primarily by the Cambridge EGP's per-CEFR-level structure inventory, secondarily by communicative usefulness and structural complexity. Structures are **recycled, not retired** — each reappearance in a later level increases either structural complexity (e.g., simple past → past continuous interrupted actions → past perfect for sequencing) or the communicative stakes it's applied to (e.g., past tense first for a simple weekend recap, later for a formal incident report). The curriculum map must make every recurrence explicit and intentional, never accidental repetition.

---

## 7. Vocabulary Progression Methodology

Oxford 3000/5000 (AmE) as the frequency/level spine; entries are **sense-specific** (a polysemous word gets one entry per taught meaning, following the English Vocabulary Profile's approach) rather than one flat entry per headword. Vocabulary is explicitly split into two tiers per lesson:
- **Active (productive)** vocabulary — the learner must be able to produce it; included in speaking/writing tasks and weighted more heavily in the spaced-repetition queue.
- **Receptive** vocabulary — the learner only needs to recognize/understand it (common in reading/listening passages slightly above the lesson's core target); lighter repetition weighting.

Thematic clustering (e.g., a "Making plans" unit clusters related vocabulary) is balanced against frequency data — a thematically-fitting but very low-frequency word doesn't displace a more frequent, less thematically-neat one without a specific reason.

---

## 8. Pronunciation Methodology

GenAm IPA is taught explicitly starting at Pre-A1 (not deferred to intermediate levels) — learners see the phonemic transcription of every new vocabulary item from day one, building IPA literacy as a transferable skill alongside spoken pronunciation. Minimal-pair drilling for GenAm-specific contrasts (e.g., /ɪ/ vs /i/) is introduced early; **connected speech features** (linking, reductions, flapped intervocalic /t/) are introduced progressively starting around B1, once a learner has enough of the underlying phoneme system to notice the difference between careful and natural speech. Ties directly to the Master Blueprint's phased Pronunciation System (§10): Phase 1 practice is self/reference-audio comparison; Phase 2 adds real phoneme-level automated feedback against these same GenAm targets.

---

## 9. Reading Methodology

Passages are graded to the unit's CEFR/GSE level (never significantly above except explicitly-flagged "stretch" reading at higher levels). Every reading task follows **pre-reading → while-reading → post-reading** staging: pre-reading activates vocabulary/schema, while-reading uses task-based comprehension questions (not just "read and answer" — a genuine information-gap or purpose for reading), post-reading extends into the unit's communicative task. Explicit reading-speed and comprehension-strategy instruction (skimming, scanning, inferring meaning from context) is introduced from B1 upward, once learners have enough vocabulary automaticity for strategy instruction to be useful rather than frustrating.

---

## 10. Listening Methodology

Audio is AmE-authentic-adjacent (natural pace and connected speech appropriate to level, not artificially slowed beyond what a real GenAm speaker would do for a language learner). **Deliberate methodology decision, resolved against the Master Blueprint's accessibility requirement (§11):** transcripts are *always available on request* — non-negotiable, satisfies WCAG 2.2 accessibility — but the default UI reveals the transcript only *after* a learner has attempted the listening exercise, not before, so the exercise actually tests listening rather than reading. This is a considered pedagogical choice, not an accessibility gap: a learner who needs the transcript immediately (accessibility need) can always request it; a learner practicing listening skill (the default case) is not tempted to skip straight to reading.

---

## 11. Speaking Methodology

Recorded production tasks throughout, with a **fluency-first-then-accuracy** framing for spontaneous spoken production (consistent with TBLT's evidence base from the Master Blueprint §2) — in-task, a learner is not interrupted or penalized for minor errors that don't impede communication; accuracy feedback comes after the task, not during it (see Error Correction Methodology, §13). Feedback tier follows the platform's phased pronunciation system (Master Blueprint §10): Phase 1 self/reference-audio comparison, Phase 2 automated phoneme-level scoring.

---

## 12. Writing Methodology

Staged by level: sentence-level accuracy tasks at Pre-A1/A1, paragraph-level coherence from A2/B1, extended multi-paragraph writing from B2/C1. Feedback (whether from an Instructor or the AI Writing Feedback module, Master Blueprint §9) is always categorized into the same five buckets so it's consistent across the platform: **content, organization, grammar, vocabulary, mechanics** — never a single undifferentiated "score."

---

## 13. Error Correction Methodology

**The core rule:** distinguish **global errors** (impede communication — the listener/reader genuinely can't understand) from **local errors** (don't impede meaning — a minor slip a native speaker would barely notice). Global errors are corrected explicitly and promptly, close to when they occur. Local errors are noted but not corrected in the moment during communicative tasks — over-correcting local errors during a fluency-focused task directly undermines the TBLT/CLT rationale in Master Blueprint §2 (interrupting communicative flow to fix something that didn't break communication teaches learners that hesitation is safer than attempting output, which is the opposite of what we want).

This resolves the classic CLT tension directly: it is *not* "correct everything" (grammar-translation relapse) and *not* "correct nothing" (strong-CLT under-teaching accuracy) — it's a deliberate, stated rule for which errors get which treatment and when, that every Instructor, Content Reviewer, and the AI Tutor (§18) must apply consistently.

---

## 14. Assessment Methodology

**Formative** (low-stakes, embedded throughout lessons): retrieval-practice exercises that double as ongoing competency signal, feeding the Learning Analytics mastery-per-skill metric (Master Blueprint §7) without being a "test" the learner consciously takes.

**Summative** (higher-stakes, gates progression per mastery learning): unit-end and level-end checkpoints via the Assessment Engine (Master Blueprint §6), required to advance. Level-end summative assessment is the same comprehensive, multi-skill assessment that gates certification (Master Blueprint §8) — there is deliberately no separate "pass the level" bar and "earn the certificate" bar; they're the same bar, so the certificate always means exactly what "completed this level" means.

---

## 15. Review Strategy (Spaced Repetition)

Vocabulary items and grammar "chunks" (not whole lessons) are scheduled into the spaced-repetition queue at the end of every lesson (§5's wrap-up step), using an FSRS-style algorithm (modeling per-item stability/difficulty/retrievability from the learner's own review history, per the evidence in Master Blueprint §2). Review scheduling is **per learner, per item** — two learners see different review timing for the same word based on their own individual recall history, not a fixed global schedule.

---

## 16. Active Recall Strategy

**Default rule:** exercises are designed as production/retrieval ("type the word," "complete the sentence from memory," "answer the question aloud") rather than recognition ("choose the correct option from a list") wherever the skill being tested allows it. Multiple-choice format is reserved for specific, deliberate purposes only: early Pre-A1 scaffolding before a learner can produce at all, or diagnostic assessment where isolating a specific misconception matters more than production ability. A content item defaulting to multiple-choice without one of these justifications fails review (§19).

---

## 17. Teacher Methodology

Instructors receive a complete lesson plan (objective, timing, common-error notes, homework suggestion — all authored alongside the lesson per §5) but are expected and encouraged to adapt delivery to their specific cohort. What Instructors may **not** do without going through the Curriculum Studio's review pipeline (Master Blueprint §§4–5): substitute a different can-do objective, skip the level's mastery gate, or introduce grammar/vocabulary meaningfully above the class's current level as core (not stretch) content — the CEFR-traceability guarantee has to hold regardless of which instructor is teaching.

---

## 18. AI Tutor Behavior

Specification the AI Tutor module (Master Blueprint §9) is built against:

- **Persona:** patient, encouraging, models natural GenAm English — never mocks or expresses frustration at learner errors.
- **Correction style:** follows the Error Correction Methodology (§13) exactly — global vs. local error distinction applies to the AI Tutor identically to a human instructor.
- **Pedagogical stance:** scaffolds toward an answer (guided discovery, consistent with CLT/TBLT) rather than simply supplying the correct form immediately — e.g., asks a leading question before giving away a grammar rule the learner could self-correct with a nudge.
- **Epistemic honesty:** never fabricates a correction or explanation it isn't confident is accurate — if uncertain, says so and defers to flagging the interaction for human Instructor/Reviewer follow-up rather than guessing.
- **Scope discipline:** stays within pedagogical purpose; does not wander into unrelated topics or provide non-pedagogical advice.
- **Escalation:** disputed corrections or complex edge cases get flagged to a human Instructor rather than the AI Tutor asserting authority it doesn't have.
- **Safety:** this module gets the strictest pre-launch safety review of any AI Gateway module (Master Blueprint §9), specifically because it's the most open-ended conversational surface and the one most directly facing learners — including, eventually, minors once the kids/teens track exists.

---

## 19. Content Quality Standards — Publication Checklist

A content item cannot move from **In Pedagogical Review** to **Approved** (Master Blueprint §4.1) until every applicable item below is checked by a Content Reviewer:

- [ ] Has a CEFR-traceable can-do objective, written to the template in §3
- [ ] Uses only vocabulary at or below the target CEFR level, except vocabulary explicitly flagged as intentional "stretch" items
- [ ] Grammar structures are sourced from the EGP at an appropriate level for this point in the curriculum's spiral sequence (§6)
- [ ] All prose (explanations, examples, dialogues) is original — verified not copied from any reference source
- [ ] American English spelling and GenAm IPA pronunciation verified against the standards in §4
- [ ] Follows the canonical lesson structure (§5) where applicable — warm-up, presentation, controlled practice, communicative task, wrap-up with spaced-repetition items queued
- [ ] At least one retrieval-based (not recognition-only) exercise present, per §16, or an explicit justification recorded for why recognition format was used
- [ ] A genuine task-based culminating activity present where applicable (§5 step 4)
- [ ] Any audio/video content has an attached transcript/captions (accessibility gate, Master Blueprint §11) before it can be approved
- [ ] Teacher note field is complete (objective, timing, common errors, homework suggestion) per §5 and §17
