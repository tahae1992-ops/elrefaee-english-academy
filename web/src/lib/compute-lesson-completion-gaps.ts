import type { ClientLessonBlock } from "@/modules/curriculum/interface/types";

/**
 * Pre-A1 blueprint (Rev. 3) Rule 6: a lesson is not "complete" just
 * because the client called the endpoint. Cross-module by nature (it
 * reads curriculum block shapes against learning's own activity/attempt
 * records), so it lives here rather than in either module's domain
 * layer — same reasoning as gate-lesson-access.ts.
 *
 * Three checks, one per gating category:
 * - every block up to (and including) the one the learner is
 *   completing from must have a real `section_viewed` event (or be the
 *   current block itself, which this very request proves was reached);
 * - every controlled_practice/quiz exercise must have a real attempt
 *   row (never trusted from the client's own `blockInteractions`);
 * - every communicative_task/speaking_practice block must have a
 *   submitted response in the learner's saved position. This one *is*
 *   client-supplied, deliberately — an open-ended task's "done" state
 *   is self-reported by design (same as the existing UI gate), unlike
 *   exercise correctness which is graded and must be server-verified.
 *
 * Returns an empty array when the lesson is genuinely ready to
 * complete; otherwise a list of machine-readable gap codes (never
 * exposed as fabricated progress either way).
 */
export function computeLessonCompletionGaps(
  blocks: ClientLessonBlock[],
  currentBlockIndex: number,
  viewedBlockIndexes: ReadonlySet<number>,
  attemptedExerciseIds: ReadonlySet<string>,
  blockInteractions: Record<number, unknown>,
): string[] {
  const gaps: string[] = [];

  blocks.forEach((block, index) => {
    const reached = index === currentBlockIndex || viewedBlockIndexes.has(index);
    if (!reached) {
      gaps.push(`block_${index}_not_viewed`);
      return;
    }

    if (block.type === "controlled_practice" || block.type === "quiz") {
      for (const ref of block.exercises) {
        if (!attemptedExerciseIds.has(ref.id)) gaps.push(`exercise_${ref.id}_not_attempted`);
      }
    }

    if (block.type === "communicative_task" || block.type === "speaking_practice") {
      const interaction = blockInteractions[index] as { taskSubmission?: string } | undefined;
      if (!interaction?.taskSubmission?.trim()) gaps.push(`block_${index}_no_submission`);
    }
  });

  return gaps;
}
