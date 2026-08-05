import type { ClientExercise } from "@/modules/curriculum/domain/services/exercise";
import type { ClientVocabularyEntry } from "@/modules/curriculum/domain/services/vocabulary-entry";

/**
 * The 5-block lesson shape (EDD §5: warm-up, presentation, controlled
 * practice, communicative task, wrap-up). No JSON schema for this
 * exists anywhere in the docs (`ContentVersion.payload` is typed as an
 * opaque object project-wide) — designed for this slice, stored
 * directly on `content_items.payload` per curriculum.ts's documented
 * simplification.
 *
 * `ControlledPracticeBlock.exerciseIds` reference real, standalone
 * `curriculum.content_items` rows (`type='exercise'`) — see
 * exercise.ts. A lesson's own payload never embeds an exercise's
 * answer key; resolving IDs into client-safe exercise content (and
 * stripping keys) happens in GetLessonUseCase, which is the only place
 * with access to the ExerciseRepositoryPort — a pure domain function
 * here can't do that async resolution.
 */

export interface WarmUpBlock {
  type: "warm_up";
  prompt: string;
  content: string;
}

export interface PresentationBlock {
  type: "presentation";
  explanation: string;
  examples: string[];
}

export interface ControlledPracticeBlock {
  type: "controlled_practice";
  instructions: string;
  exerciseIds: string[];
}

export interface ResolvedExerciseRef {
  id: string;
  exercise: ClientExercise;
}

export interface ClientControlledPracticeBlock {
  type: "controlled_practice";
  instructions: string;
  exercises: ResolvedExerciseRef[];
}

export interface CommunicativeTaskBlock {
  type: "communicative_task";
  instructions: string;
  prompt: string;
}

export interface WrapUpBlock {
  type: "wrap_up";
  summary: string;
  /** References real `curriculum.content_items` rows (type='vocabulary_entry') — Review Engine slice. Same reference-not-embed pattern as `ControlledPracticeBlock.exerciseIds`. */
  targetVocabularyIds: string[];
}

export interface ResolvedVocabularyRef {
  id: string;
  entry: ClientVocabularyEntry;
}

export interface ClientWrapUpBlock {
  type: "wrap_up";
  summary: string;
  targetVocabulary: ResolvedVocabularyRef[];
}

export type LessonBlock =
  | WarmUpBlock
  | PresentationBlock
  | ControlledPracticeBlock
  | CommunicativeTaskBlock
  | WrapUpBlock;

export type ClientLessonBlock =
  | WarmUpBlock
  | PresentationBlock
  | ClientControlledPracticeBlock
  | CommunicativeTaskBlock
  | ClientWrapUpBlock;

export interface TeacherNote {
  objective: string;
  timing: string;
  commonErrors: string;
  extension: string;
}

export interface LessonContent {
  title: string;
  objective: string;
  teacherNote: TeacherNote;
  blocks: LessonBlock[];
}

export interface ClientLessonContent {
  title: string;
  objective: string;
  blocks: ClientLessonBlock[];
}

/** Every exerciseId referenced across a lesson's blocks, e.g. to batch-fetch exercise content in one query. */
export function collectExerciseIds(content: LessonContent): string[] {
  const ids: string[] = [];
  for (const block of content.blocks) {
    if (block.type === "controlled_practice") ids.push(...block.exerciseIds);
  }
  return ids;
}

/** Every vocabularyEntryId referenced across a lesson's blocks (currently only wrap_up), e.g. to batch-fetch vocabulary content in one query. */
export function collectVocabularyEntryIds(content: LessonContent): string[] {
  const ids: string[] = [];
  for (const block of content.blocks) {
    if (block.type === "wrap_up") ids.push(...block.targetVocabularyIds);
  }
  return ids;
}

/**
 * Builds the client-safe lesson content once the caller has already
 * resolved every referenced exercise and vocabulary entry to its
 * client-safe form (via ExerciseRepositoryPort/VocabularyEntryRepositoryPort)
 * — this function only does the structural rewrite, not any DB access
 * or answer-key stripping itself.
 */
export function toClientLessonContent(
  content: LessonContent,
  resolvedExercises: Map<string, ClientExercise>,
  resolvedVocabulary: Map<string, ClientVocabularyEntry>,
): ClientLessonContent {
  return {
    title: content.title,
    objective: content.objective,
    blocks: content.blocks.map((block): ClientLessonBlock => {
      if (block.type === "controlled_practice") {
        return {
          type: "controlled_practice",
          instructions: block.instructions,
          exercises: block.exerciseIds.map((id) => {
            const exercise = resolvedExercises.get(id);
            if (!exercise) throw new Error(`Exercise ${id} referenced by a lesson block was not found.`);
            return { id, exercise };
          }),
        };
      }
      if (block.type === "wrap_up") {
        return {
          type: "wrap_up",
          summary: block.summary,
          targetVocabulary: block.targetVocabularyIds.map((id) => {
            const entry = resolvedVocabulary.get(id);
            if (!entry) throw new Error(`Vocabulary entry ${id} referenced by a lesson block was not found.`);
            return { id, entry };
          }),
        };
      }
      return block;
    }),
  };
}

/** doc 09 §5.5: "[Continue] disabled until the current block's required interaction is complete." warm_up/presentation/wrap_up have none. */
export function blockRequiresInteraction(blockType: LessonBlock["type"]): boolean {
  return blockType === "controlled_practice" || blockType === "communicative_task";
}
