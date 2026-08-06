import { createDrizzleLessonAdapter, createGetLessonProgressUseCase } from "@/composition-root";

export type CheckpointAccessResult = { ok: true } | { ok: false; status: number; body: unknown };

/**
 * SRS FR-06's AC: "Given the skip-ahead flag is off (default), when a
 * learner has not completed every lesson in a unit, then the checkpoint
 * is not accessible." No skip-ahead flag exists yet (the SRS's own
 * "defaulting to require-full-completion until decided" — so this is
 * the only path implemented, not a feature-flagged branch with no
 * second branch behind it).
 */
export async function gateCheckpointAccess(unitId: string, userId: string): Promise<CheckpointAccessResult> {
  const lessons = await createDrizzleLessonAdapter().listForUnit(unitId);
  if (lessons.length === 0) {
    return { ok: false, status: 404, body: { error: "NOT_FOUND", message: "Unit not found." } };
  }

  const progress = await createGetLessonProgressUseCase().execute(
    userId,
    lessons.map((lesson) => lesson.id),
  );
  const allLessonsCompleted = lessons.every((lesson) => progress.get(lesson.id)?.status === "completed");
  if (!allLessonsCompleted) {
    return {
      ok: false,
      status: 403,
      body: { error: "FORBIDDEN", message: "Complete every lesson in this unit before attempting the checkpoint." },
    };
  }

  return { ok: true };
}
