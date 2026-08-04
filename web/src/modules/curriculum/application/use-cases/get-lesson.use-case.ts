import type { LessonRepositoryPort } from "@/modules/curriculum/application/ports/lesson-repository-port";
import type { ExerciseRepositoryPort } from "@/modules/curriculum/application/ports/exercise-repository-port";
import { collectExerciseIds, toClientLessonContent, type ClientLessonContent } from "@/modules/curriculum/domain/services/lesson-blocks";
import { toClientExercise } from "@/modules/curriculum/domain/services/exercise";
import type { ClientExercise } from "@/modules/curriculum/domain/services/exercise";

export class LessonNotFoundError extends Error {
  constructor() {
    super("Lesson not found.");
    this.name = "LessonNotFoundError";
  }
}

export interface ClientLesson {
  id: string;
  unitId: string;
  courseId: string;
  orderIndex: number;
  content: ClientLessonContent;
}

/**
 * Never returns an exercise's answer key — see lesson-blocks.ts's
 * `toClientLessonContent` and exercise.ts's `toClientExercise`. A
 * lesson's `controlled_practice` blocks only hold `exerciseIds`
 * (curriculum.ts); this use-case is where those get resolved into
 * real, client-safe exercise content via ExerciseRepositoryPort, in
 * one batch query. Access gating (is this learner's course/unit
 * actually unlocked) is NOT this use-case's job — SRS FR-04's "denied
 * server-side" rule is enforced by the Route Handler, which combines
 * this with the `learning` module's unit-access check before returning
 * a response (same cross-module-orchestration-in-the-route-handler
 * pattern as the Placement Test finalize route).
 */
export class GetLessonUseCase {
  constructor(
    private readonly lessons: LessonRepositoryPort,
    private readonly exercises: ExerciseRepositoryPort,
  ) {}

  async execute(lessonId: string): Promise<ClientLesson> {
    const lesson = await this.lessons.getById(lessonId);
    if (!lesson) throw new LessonNotFoundError();

    const exerciseIds = collectExerciseIds(lesson.content);
    const fullExercises = await this.exercises.listByIds(exerciseIds);
    const clientExercises = new Map<string, ClientExercise>(
      [...fullExercises.entries()].map(([id, exercise]) => [id, toClientExercise(exercise)]),
    );

    return {
      id: lesson.id,
      unitId: lesson.unitId,
      courseId: lesson.courseId,
      orderIndex: lesson.orderIndex,
      content: toClientLessonContent(lesson.content, clientExercises),
    };
  }
}
