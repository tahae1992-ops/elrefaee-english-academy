import type { LessonRepositoryPort } from "@/modules/curriculum/application/ports/lesson-repository-port";
import type { ExerciseRepositoryPort } from "@/modules/curriculum/application/ports/exercise-repository-port";
import type { VocabularyEntryRepositoryPort } from "@/modules/curriculum/application/ports/vocabulary-entry-repository-port";
import type { MaterialRepositoryPort } from "@/modules/curriculum/application/ports/material-repository-port";
import {
  collectExerciseIds,
  collectVocabularyEntryIds,
  collectMaterialIds,
  toClientLessonContent,
  type ClientLessonContent,
} from "@/modules/curriculum/domain/services/lesson-blocks";
import { toClientExercise } from "@/modules/curriculum/domain/services/exercise";
import type { ClientExercise } from "@/modules/curriculum/domain/services/exercise";
import { toClientVocabularyEntry } from "@/modules/curriculum/domain/services/vocabulary-entry";
import type { ClientVocabularyEntry } from "@/modules/curriculum/domain/services/vocabulary-entry";
import { toClientMaterial } from "@/modules/curriculum/domain/services/material";
import type { ClientMaterial } from "@/modules/curriculum/domain/services/material";

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
    private readonly vocabularyEntries: VocabularyEntryRepositoryPort,
    private readonly materials: MaterialRepositoryPort,
  ) {}

  async execute(lessonId: string): Promise<ClientLesson> {
    const lesson = await this.lessons.getById(lessonId);
    if (!lesson) throw new LessonNotFoundError();

    const exerciseIds = collectExerciseIds(lesson.content);
    const fullExercises = await this.exercises.listByIds(exerciseIds);
    const clientExercises = new Map<string, ClientExercise>(
      [...fullExercises.entries()].map(([id, exercise]) => [id, toClientExercise(exercise)]),
    );

    const vocabularyEntryIds = collectVocabularyEntryIds(lesson.content);
    const fullVocabularyEntries = await this.vocabularyEntries.listByIds(vocabularyEntryIds);

    // Every vocabulary entry's own image/audio materials (Template 0's
    // steps 1/3) join the block-level materialIds (video/listening) so
    // both resolve from one batch fetch.
    const blockMaterialIds = collectMaterialIds(lesson.content);
    const vocabularyMaterialIds = [...fullVocabularyEntries.values()].flatMap((entry) =>
      [entry.imageMaterialId, entry.audioMaterialId].filter((id): id is string => Boolean(id)),
    );
    const fullMaterials = await this.materials.listByIds([...new Set([...blockMaterialIds, ...vocabularyMaterialIds])]);
    const clientMaterials = new Map<string, ClientMaterial>(
      [...fullMaterials.entries()].map(([id, material]) => [id, toClientMaterial(material)]),
    );

    const clientVocabularyEntries = new Map<string, ClientVocabularyEntry>(
      [...fullVocabularyEntries.entries()].map(([id, entry]) => [id, toClientVocabularyEntry(entry, clientMaterials)]),
    );

    return {
      id: lesson.id,
      unitId: lesson.unitId,
      courseId: lesson.courseId,
      orderIndex: lesson.orderIndex,
      content: toClientLessonContent(lesson.content, clientExercises, clientVocabularyEntries, clientMaterials),
    };
  }
}
