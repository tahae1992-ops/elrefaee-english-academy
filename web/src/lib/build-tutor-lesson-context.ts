import { createDrizzleExerciseAttemptAdapter, createDrizzleVocabularyReviewStateAdapter } from "@/composition-root";
import { deriveReviewState } from "@/modules/learning/interface/types";
import type { TutorPromptContext } from "@/modules/ai/interface/types";
import type { ClientLesson, CefrLevel } from "@/modules/curriculum/interface/types";

const MAX_MISTAKES_IN_CONTEXT = 5;

/**
 * The one DB-backed composition point combining `identity` (CEFR
 * level), `curriculum` (the already-resolved, answer-key-free lesson
 * content), and `learning` (this lesson's incorrect exercise attempts
 * + struggled target vocabulary from the Review Engine) into the AI
 * Tutor's per-call prompt context — same cross-module-orchestration-
 * lives-in-a-shared-lib-file rule as resolve-course-progress.ts/
 * resolve-due-review-queue.ts/build-learner-stats-snapshot.ts.
 *
 * "tutor suggestions based on learner mistakes" + "integrate with the
 * Exercise Engine and Review Engine": recentMistakes draws from real
 * exercise_attempts (prompts only, never answer keys — sourced from
 * the already-answer-key-stripped `lesson.content`, not a second
 * curriculum query) and real vocabulary_review_state (items still in
 * the "learning" state for this lesson's own target vocabulary).
 */
export async function buildTutorLessonContext(userId: string, lesson: ClientLesson, cefrLevel: CefrLevel | null): Promise<TutorPromptContext> {
  const wrapUpBlock = lesson.content.blocks.find((block) => block.type === "wrap_up");
  const targetVocabularyRefs = wrapUpBlock && wrapUpBlock.type === "wrap_up" ? wrapUpBlock.targetVocabulary : [];
  const targetVocabulary = targetVocabularyRefs.map((ref) => ref.entry.headword);

  const practiceBlock = lesson.content.blocks.find((block) => block.type === "controlled_practice");
  const exercisesById = new Map(
    practiceBlock && practiceBlock.type === "controlled_practice" ? practiceBlock.exercises.map((ref) => [ref.id, ref.exercise]) : [],
  );

  const [incorrectExerciseIds, strugglingVocabularyHeadwords] = await Promise.all([
    createDrizzleExerciseAttemptAdapter().listDistinctIncorrectExerciseIdsForLesson(userId, lesson.id, MAX_MISTAKES_IN_CONTEXT),
    findStrugglingVocabulary(userId, targetVocabularyRefs),
  ]);

  const exerciseMistakes = incorrectExerciseIds
    .map((exerciseId) => exercisesById.get(exerciseId))
    .filter((exercise): exercise is NonNullable<typeof exercise> => Boolean(exercise))
    .map((exercise) => `Exercise: "${exercise.prompt}"`);

  const vocabularyMistakes = strugglingVocabularyHeadwords.map((headword) => `Vocabulary: "${headword}" (still learning)`);

  return {
    cefrLevel: cefrLevel ?? "not yet assessed",
    lessonTitle: lesson.content.title,
    lessonObjective: lesson.content.objective,
    targetVocabulary,
    recentMistakes: [...exerciseMistakes, ...vocabularyMistakes].slice(0, MAX_MISTAKES_IN_CONTEXT),
  };
}

async function findStrugglingVocabulary(userId: string, targetVocabularyRefs: { id: string; entry: { headword: string } }[]): Promise<string[]> {
  if (targetVocabularyRefs.length === 0) return [];

  const reviewStates = createDrizzleVocabularyReviewStateAdapter();
  const results = await Promise.all(
    targetVocabularyRefs.map(async (ref) => {
      const state = await reviewStates.findByUserAndEntry(userId, ref.id);
      if (!state) return null;
      return deriveReviewState(state.reviewCount, state.stability) === "learning" ? ref.entry.headword : null;
    }),
  );

  return results.filter((headword): headword is string => headword !== null);
}
