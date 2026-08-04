import type { LessonRepositoryPort } from "@/modules/curriculum/application/ports/lesson-repository-port";
import { LessonNotFoundError } from "@/modules/curriculum/application/use-cases/get-lesson.use-case";

export class BlockNotFoundError extends Error {
  constructor() {
    super("Block not found, or not a controlled-practice block.");
    this.name = "BlockNotFoundError";
  }
}

export class ExerciseNotFoundError extends Error {
  constructor() {
    super("Exercise not found in this block.");
    this.name = "ExerciseNotFoundError";
  }
}

export interface CheckPracticeAnswerInput {
  lessonId: string;
  blockIndex: number;
  exerciseIndex: number;
  selectedOptionIndex: number;
}

export interface CheckPracticeAnswerResult {
  isCorrect: boolean;
  correctOptionIndex: number;
}

/**
 * Scores a controlled-practice multiple_choice exercise server-side —
 * `correctOptionIndex` is read from the real lesson content (never
 * trusted from the client), then revealed in the response only now
 * that the learner has answered (doc 09 §5.10's "correct-answer
 * reveal" rule). Same real-scoring-not-placeholder approach as
 * assessment's SubmitResponseUseCase, reused here since lesson
 * practice exercises are lesson-authored content, not assessment
 * items — a separate table would duplicate this exact mechanism for
 * no benefit.
 */
export class CheckPracticeAnswerUseCase {
  constructor(private readonly lessons: LessonRepositoryPort) {}

  async execute(input: CheckPracticeAnswerInput): Promise<CheckPracticeAnswerResult> {
    const lesson = await this.lessons.getById(input.lessonId);
    if (!lesson) throw new LessonNotFoundError();

    const block = lesson.content.blocks[input.blockIndex];
    if (!block || block.type !== "controlled_practice") throw new BlockNotFoundError();

    const exercise = block.exercises[input.exerciseIndex];
    if (!exercise) throw new ExerciseNotFoundError();

    return {
      isCorrect: exercise.correctOptionIndex === input.selectedOptionIndex,
      correctOptionIndex: exercise.correctOptionIndex,
    };
  }
}
