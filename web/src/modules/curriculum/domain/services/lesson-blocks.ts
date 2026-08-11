import type { ClientExercise } from "@/modules/curriculum/domain/services/exercise";
import type { ClientVocabularyEntry } from "@/modules/curriculum/domain/services/vocabulary-entry";
import type { ClientMaterial } from "@/modules/curriculum/domain/services/material";

/**
 * The original 5-block lesson shape (EDD §5: warm-up, presentation,
 * controlled practice, communicative task, wrap-up), extended in
 * Phase 21 with 6 more block types (vocabulary, video, reading,
 * listening, speaking practice, quiz) to cover the full section
 * taxonomy the platform now supports — same jsonb-on-content_items
 * storage, same reference-not-embed pattern for anything with its own
 * identity (exercises, vocabulary entries, materials), not a schema
 * replacement. No JSON schema for this exists anywhere in the docs
 * (`ContentVersion.payload` is typed as an opaque object
 * project-wide) — designed for this slice, stored directly on
 * `content_items.payload` per curriculum.ts's documented
 * simplification.
 *
 * `ControlledPracticeBlock.exerciseIds` reference real, standalone
 * `curriculum.content_items` rows (`type='exercise'`) — see
 * exercise.ts. A lesson's own payload never embeds an exercise's
 * answer key; resolving IDs into client-safe exercise content (and
 * stripping keys) happens in GetLessonUseCase, which is the only place
 * with access to the ExerciseRepositoryPort — a pure domain function
 * here can't do that async resolution. The same reference/resolve
 * split applies to `VocabularyBlock.vocabularyIds`,
 * `VideoBlock`/`ListeningBlock.materialId`, and `QuizBlock.exerciseIds`.
 */

export interface WarmUpBlock {
  type: "warm_up";
  prompt: string;
  content: string;
  /** Pre-A1 blueprint (Rev. 3) §2 — "never assume reading ability": an Arabic mirror of `prompt`/`content`, not just of vocabulary meaning. */
  promptAr?: string;
  contentAr?: string;
}

export interface PresentationBlock {
  type: "presentation";
  explanation: string;
  examples: string[];
  explanationAr?: string;
  /** Pre-A1 media audit — optional per-example audio (e.g. phoneme/letter-sound demonstrations), keyed by index into `examples`. Sparse: most presentation blocks have none; a block with mixed audio/no-audio examples only lists the ones that have a real recording. */
  exampleAudioIds?: Record<number, string>;
}

export interface ClientPresentationBlock {
  type: "presentation";
  explanation: string;
  examples: string[];
  explanationAr?: string;
  exampleAudio?: Record<number, ResolvedMaterialRef>;
}

export interface ControlledPracticeBlock {
  type: "controlled_practice";
  instructions: string;
  instructionsAr?: string;
  exerciseIds: string[];
}

export interface ResolvedExerciseRef {
  id: string;
  exercise: ClientExercise;
}

export interface ClientControlledPracticeBlock {
  type: "controlled_practice";
  instructions: string;
  instructionsAr?: string;
  exercises: ResolvedExerciseRef[];
}

export interface CommunicativeTaskBlock {
  type: "communicative_task";
  instructions: string;
  prompt: string;
  instructionsAr?: string;
  promptAr?: string;
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

/** Phase 21 — explicit vocabulary presentation (distinct from wrap_up's spaced-repetition queueing of the same entries). */
export interface VocabularyBlock {
  type: "vocabulary";
  instructions: string;
  instructionsAr?: string;
  vocabularyIds: string[];
}

export interface ClientVocabularyBlock {
  type: "vocabulary";
  instructions: string;
  instructionsAr?: string;
  vocabulary: ResolvedVocabularyRef[];
}

export interface ResolvedMaterialRef {
  id: string;
  material: ClientMaterial;
}

/** Phase 21 — an embedded educational video, always via a real, sourced `material` content_item — never an inline URL a block could invent. */
export interface VideoBlock {
  type: "video";
  title: string;
  instructions: string;
  instructionsAr?: string;
  materialId: string;
}

export interface ClientVideoBlock {
  type: "video";
  title: string;
  instructions: string;
  instructionsAr?: string;
  material: ResolvedMaterialRef;
}

/** Phase 21 — a reading passage, optionally with vocabulary glossed inline. */
export interface ReadingBlock {
  type: "reading";
  title: string;
  passage: string;
  glossaryVocabularyIds: string[];
}

export interface ClientReadingBlock {
  type: "reading";
  title: string;
  passage: string;
  glossary: ResolvedVocabularyRef[];
}

/** Phase 21 — a listening clip with transcript, same real-material-only rule as video. */
export interface ListeningBlock {
  type: "listening";
  title: string;
  materialId: string;
  transcript: string;
}

export interface ClientListeningBlock {
  type: "listening";
  title: string;
  material: ResolvedMaterialRef;
  transcript: string;
}

/** Phase 21 — distinct from communicative_task so speaking activities are labeled and countable in their own right (spec's explicit "Speaking practice" section). Same open-response shape. */
export interface SpeakingPracticeBlock {
  type: "speaking_practice";
  instructions: string;
  prompt: string;
  instructionsAr?: string;
  promptAr?: string;
}

/** Phase 21 — a scored checkpoint distinct from controlled_practice: contributes a `assessment.grades` row on completion, not just spaced-repetition/attempt tracking. */
export interface QuizBlock {
  type: "quiz";
  title: string;
  instructions: string;
  instructionsAr?: string;
  exerciseIds: string[];
  passingScorePercent: number;
}

export interface ClientQuizBlock {
  type: "quiz";
  title: string;
  instructions: string;
  instructionsAr?: string;
  exercises: ResolvedExerciseRef[];
  passingScorePercent: number;
}

export type LessonBlock =
  | WarmUpBlock
  | PresentationBlock
  | VocabularyBlock
  | VideoBlock
  | ReadingBlock
  | ListeningBlock
  | ControlledPracticeBlock
  | SpeakingPracticeBlock
  | CommunicativeTaskBlock
  | QuizBlock
  | WrapUpBlock;

export type ClientLessonBlock =
  | WarmUpBlock
  | ClientPresentationBlock
  | ClientVocabularyBlock
  | ClientVideoBlock
  | ClientReadingBlock
  | ClientListeningBlock
  | ClientControlledPracticeBlock
  | SpeakingPracticeBlock
  | CommunicativeTaskBlock
  | ClientQuizBlock
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

/** Every exerciseId referenced across a lesson's blocks (controlled_practice and quiz), e.g. to batch-fetch exercise content in one query. */
export function collectExerciseIds(content: LessonContent): string[] {
  const ids: string[] = [];
  for (const block of content.blocks) {
    if (block.type === "controlled_practice" || block.type === "quiz") ids.push(...block.exerciseIds);
  }
  return ids;
}

/** Every vocabularyEntryId referenced across a lesson's blocks (wrap_up, vocabulary, reading's glossary), e.g. to batch-fetch vocabulary content in one query. */
export function collectVocabularyEntryIds(content: LessonContent): string[] {
  const ids: string[] = [];
  for (const block of content.blocks) {
    if (block.type === "wrap_up") ids.push(...block.targetVocabularyIds);
    if (block.type === "vocabulary") ids.push(...block.vocabularyIds);
    if (block.type === "reading") ids.push(...block.glossaryVocabularyIds);
  }
  return ids;
}

/** Every materialId referenced across a lesson's blocks (video, listening, presentation example audio), e.g. to batch-fetch material content in one query. */
export function collectMaterialIds(content: LessonContent): string[] {
  const ids: string[] = [];
  for (const block of content.blocks) {
    if (block.type === "video" || block.type === "listening") ids.push(block.materialId);
    if (block.type === "presentation" && block.exampleAudioIds) ids.push(...Object.values(block.exampleAudioIds));
  }
  return ids;
}

function resolveVocabularyRefs(
  ids: string[],
  resolvedVocabulary: Map<string, ClientVocabularyEntry>,
): ResolvedVocabularyRef[] {
  return ids.map((id) => {
    const entry = resolvedVocabulary.get(id);
    if (!entry) throw new Error(`Vocabulary entry ${id} referenced by a lesson block was not found.`);
    return { id, entry };
  });
}

function resolveExerciseRefs(ids: string[], resolvedExercises: Map<string, ClientExercise>): ResolvedExerciseRef[] {
  return ids.map((id) => {
    const exercise = resolvedExercises.get(id);
    if (!exercise) throw new Error(`Exercise ${id} referenced by a lesson block was not found.`);
    return { id, exercise };
  });
}

function resolveMaterialRef(id: string, resolvedMaterials: Map<string, ClientMaterial>): ResolvedMaterialRef {
  const material = resolvedMaterials.get(id);
  if (!material) throw new Error(`Material ${id} referenced by a lesson block was not found.`);
  return { id, material };
}

/**
 * Builds the client-safe lesson content once the caller has already
 * resolved every referenced exercise, vocabulary entry, and material
 * to its client-safe form (via ExerciseRepositoryPort/
 * VocabularyEntryRepositoryPort/MaterialRepositoryPort) — this
 * function only does the structural rewrite, not any DB access or
 * answer-key stripping itself.
 */
export function toClientLessonContent(
  content: LessonContent,
  resolvedExercises: Map<string, ClientExercise>,
  resolvedVocabulary: Map<string, ClientVocabularyEntry>,
  resolvedMaterials: Map<string, ClientMaterial>,
): ClientLessonContent {
  return {
    title: content.title,
    objective: content.objective,
    blocks: content.blocks.map((block): ClientLessonBlock => {
      switch (block.type) {
        case "presentation": {
          if (!block.exampleAudioIds) return block;
          const exampleAudio: Record<number, ResolvedMaterialRef> = {};
          for (const [index, materialId] of Object.entries(block.exampleAudioIds)) {
            exampleAudio[Number(index)] = resolveMaterialRef(materialId, resolvedMaterials);
          }
          return { type: "presentation", explanation: block.explanation, examples: block.examples, explanationAr: block.explanationAr, exampleAudio };
        }
        case "controlled_practice":
          return {
            type: "controlled_practice",
            instructions: block.instructions,
            instructionsAr: block.instructionsAr,
            exercises: resolveExerciseRefs(block.exerciseIds, resolvedExercises),
          };
        case "quiz":
          return {
            type: "quiz",
            title: block.title,
            instructions: block.instructions,
            instructionsAr: block.instructionsAr,
            exercises: resolveExerciseRefs(block.exerciseIds, resolvedExercises),
            passingScorePercent: block.passingScorePercent,
          };
        case "wrap_up":
          return {
            type: "wrap_up",
            summary: block.summary,
            targetVocabulary: resolveVocabularyRefs(block.targetVocabularyIds, resolvedVocabulary),
          };
        case "vocabulary":
          return {
            type: "vocabulary",
            instructions: block.instructions,
            instructionsAr: block.instructionsAr,
            vocabulary: resolveVocabularyRefs(block.vocabularyIds, resolvedVocabulary),
          };
        case "reading":
          return {
            type: "reading",
            title: block.title,
            passage: block.passage,
            glossary: resolveVocabularyRefs(block.glossaryVocabularyIds, resolvedVocabulary),
          };
        case "video":
          return {
            type: "video",
            title: block.title,
            instructions: block.instructions,
            instructionsAr: block.instructionsAr,
            material: resolveMaterialRef(block.materialId, resolvedMaterials),
          };
        case "listening":
          return {
            type: "listening",
            title: block.title,
            material: resolveMaterialRef(block.materialId, resolvedMaterials),
            transcript: block.transcript,
          };
        default:
          return block;
      }
    }),
  };
}

/** doc 09 §5.5: "[Continue] disabled until the current block's required interaction is complete." warm_up/presentation/vocabulary/reading/video/listening/wrap_up have none. */
export function blockRequiresInteraction(blockType: LessonBlock["type"]): boolean {
  return (
    blockType === "controlled_practice" ||
    blockType === "communicative_task" ||
    blockType === "speaking_practice" ||
    blockType === "quiz"
  );
}
