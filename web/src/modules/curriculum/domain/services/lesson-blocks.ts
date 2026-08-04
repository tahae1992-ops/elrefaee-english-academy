/**
 * The 5-block lesson shape (EDD §5: warm-up, presentation, controlled
 * practice, communicative task, wrap-up). No JSON schema for this
 * exists anywhere in the docs (`ContentVersion.payload` is typed as an
 * opaque object project-wide) — designed for this slice, stored
 * directly on `content_items.payload` per curriculum.ts's documented
 * simplification.
 *
 * `PracticeExercise.correctOptionIndex` must never reach the client
 * before the learner answers — same rule as
 * `assessment.item_bank.scoring_key`. `toClientLesson` below is the
 * single place that strips it.
 */

export interface PracticeExercise {
  itemType: "multiple_choice";
  prompt: string;
  options: string[];
  correctOptionIndex: number;
}

export interface ClientPracticeExercise {
  itemType: "multiple_choice";
  prompt: string;
  options: string[];
}

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
  exercises: PracticeExercise[];
}

export interface ClientControlledPracticeBlock {
  type: "controlled_practice";
  instructions: string;
  exercises: ClientPracticeExercise[];
}

export interface CommunicativeTaskBlock {
  type: "communicative_task";
  instructions: string;
  prompt: string;
}

export interface WrapUpBlock {
  type: "wrap_up";
  summary: string;
  targetVocabulary: string[];
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
  | WrapUpBlock;

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

/** Strips every practice exercise's `correctOptionIndex` before the content reaches a client. */
export function toClientLessonContent(content: LessonContent): ClientLessonContent {
  return {
    title: content.title,
    objective: content.objective,
    blocks: content.blocks.map((block) => {
      if (block.type !== "controlled_practice") return block;
      return {
        type: "controlled_practice",
        instructions: block.instructions,
        exercises: block.exercises.map(({ itemType, prompt, options }) => ({ itemType, prompt, options })),
      };
    }),
  };
}

/** doc 09 §5.5: "[Continue] disabled until the current block's required interaction is complete." warm_up/presentation/wrap_up have none. */
export function blockRequiresInteraction(blockType: LessonBlock["type"]): boolean {
  return blockType === "controlled_practice" || blockType === "communicative_task";
}
