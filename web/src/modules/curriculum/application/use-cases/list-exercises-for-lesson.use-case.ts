import type { LessonRepositoryPort } from "@/modules/curriculum/application/ports/lesson-repository-port";
import type { ExerciseRepositoryPort } from "@/modules/curriculum/application/ports/exercise-repository-port";
import { LessonNotFoundError } from "@/modules/curriculum/application/use-cases/get-lesson.use-case";
import { collectExerciseIds } from "@/modules/curriculum/domain/services/lesson-blocks";
import { toClientExercise, type ClientExercise } from "@/modules/curriculum/domain/services/exercise";

export interface ClientExerciseSummary {
  id: string;
  exercise: ClientExercise;
}

/** API Spec §6.4: GET /exercises?lessonId= — every exercise a lesson's blocks reference, answer keys stripped. */
export class ListExercisesForLessonUseCase {
  constructor(
    private readonly lessons: LessonRepositoryPort,
    private readonly exercises: ExerciseRepositoryPort,
  ) {}

  async execute(lessonId: string): Promise<ClientExerciseSummary[]> {
    const lesson = await this.lessons.getById(lessonId);
    if (!lesson) throw new LessonNotFoundError();

    const exerciseIds = collectExerciseIds(lesson.content);
    const resolved = await this.exercises.listByIds(exerciseIds);

    return exerciseIds
      .map((id) => ({ id, exercise: resolved.get(id) }))
      .filter((entry): entry is { id: string; exercise: NonNullable<typeof entry.exercise> } => entry.exercise !== undefined)
      .map(({ id, exercise }) => ({ id, exercise: toClientExercise(exercise) }));
  }
}
