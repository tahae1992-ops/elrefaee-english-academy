/**
 * Fills the versioned template (ai.prompt_templates, module='tutor')
 * with per-call learner/lesson context — pure string interpolation, no
 * I/O. The template itself carries EDD §18's static behavioral rules;
 * this function only supplies what varies per learner/lesson/turn.
 *
 * Deliberately excludes exercise answer keys and vocabulary_review_
 * state internals from the context it's given — callers (see
 * src/lib/build-tutor-lesson-context.ts) only ever pass this
 * client-safe data in the first place, but the exclusion is restated
 * here since a leaked answer key in the system prompt would be
 * silently invisible to any UI-layer review.
 */

export interface TutorPromptContext {
  cefrLevel: string;
  lessonTitle: string;
  lessonObjective: string;
  targetVocabulary: string[];
  /** Short, human-readable descriptions of exercises this learner got wrong in this lesson — never the correct answer itself. */
  recentMistakes: string[];
}

const PLACEHOLDER_PATTERN = /\{\{(\w+)\}\}/g;

export function buildTutorSystemPrompt(templateBody: string, context: TutorPromptContext): string {
  const values: Record<string, string> = {
    cefrLevel: context.cefrLevel,
    lessonTitle: context.lessonTitle,
    lessonObjective: context.lessonObjective,
    targetVocabulary: context.targetVocabulary.length > 0 ? context.targetVocabulary.join(", ") : "(none listed)",
    recentMistakes: context.recentMistakes.length > 0 ? context.recentMistakes.join("; ") : "(none yet)",
  };

  return templateBody.replace(PLACEHOLDER_PATTERN, (match, key: string) => values[key] ?? match);
}

const VOCABULARY_MISTAKE_PATTERN = /^Vocabulary: "(.+)" \(still learning\)$/;
const EXERCISE_MISTAKE_PATTERN = /^Exercise: "(.+)"$/;
const MAX_STARTERS = 3;

/**
 * doc 08 §3.11's chat empty-state "suggested-question starter set" —
 * "tutor suggestions based on learner mistakes." Turns the same
 * `recentMistakes` strings already built for the system prompt into
 * clickable learner-facing questions, so the suggestions are always
 * grounded in this learner's real attempts, not generic prompts.
 */
export function deriveTutorStarters(context: TutorPromptContext): string[] {
  const starters: string[] = [];
  for (const mistake of context.recentMistakes) {
    const vocabularyMatch = mistake.match(VOCABULARY_MISTAKE_PATTERN);
    if (vocabularyMatch) {
      starters.push(`Can you explain the word "${vocabularyMatch[1]}"?`);
      continue;
    }
    const exerciseMatch = mistake.match(EXERCISE_MISTAKE_PATTERN);
    if (exerciseMatch) {
      starters.push(`I got this one wrong — can you help me understand it: "${exerciseMatch[1]}"?`);
    }
  }

  if (starters.length === 0) {
    starters.push(`Can you help me understand "${context.lessonTitle}"?`);
  }

  return starters.slice(0, MAX_STARTERS);
}
