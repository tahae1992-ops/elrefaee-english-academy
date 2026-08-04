import type { LessonRepositoryPort } from "@/modules/curriculum/application/ports/lesson-repository-port";
import { toClientLessonContent, type ClientLessonContent } from "@/modules/curriculum/domain/services/lesson-blocks";

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
 * Never returns `correctOptionIndex` — see lesson-blocks.ts's
 * `toClientLessonContent`. Access gating (is this learner's course/unit
 * actually unlocked) is NOT this use-case's job — SRS FR-04's "denied
 * server-side" rule is enforced by the Route Handler, which combines
 * this with the `learning` module's unit-access check before returning
 * a response (same cross-module-orchestration-in-the-route-handler
 * pattern as the Placement Test finalize route).
 */
export class GetLessonUseCase {
  constructor(private readonly lessons: LessonRepositoryPort) {}

  async execute(lessonId: string): Promise<ClientLesson> {
    const lesson = await this.lessons.getById(lessonId);
    if (!lesson) throw new LessonNotFoundError();

    return {
      id: lesson.id,
      unitId: lesson.unitId,
      courseId: lesson.courseId,
      orderIndex: lesson.orderIndex,
      content: toClientLessonContent(lesson.content),
    };
  }
}
