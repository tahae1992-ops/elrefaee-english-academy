// Re-exported so UI code stays within the arch-check boundary rule
// (only a module's interface layer is importable from outside it).
export { computeCourseAccess } from "@/modules/curriculum/domain/services/compute-course-access";
export type { CefrLevel, CourseAccess, CourseAccessState } from "@/modules/curriculum/domain/services/compute-course-access";
export type { CourseListItem } from "@/modules/curriculum/application/use-cases/list-courses.use-case";
export type { PublishedCourse } from "@/modules/curriculum/application/ports/course-repository-port";
export type { PublishedUnit } from "@/modules/curriculum/application/ports/unit-repository-port";
export type { PublishedLessonSummary, PublishedLesson } from "@/modules/curriculum/application/ports/lesson-repository-port";
export { toClientLessonContent, blockRequiresInteraction } from "@/modules/curriculum/domain/services/lesson-blocks";
export type {
  ClientLessonContent,
  ClientLessonBlock,
  LessonContent,
  LessonBlock,
} from "@/modules/curriculum/domain/services/lesson-blocks";
export { CourseNotFoundError } from "@/modules/curriculum/application/use-cases/get-course-detail.use-case";
export type { CourseDetail } from "@/modules/curriculum/application/use-cases/get-course-detail.use-case";
export { UnitNotFoundError } from "@/modules/curriculum/application/use-cases/get-unit-detail.use-case";
export type { UnitDetail } from "@/modules/curriculum/application/use-cases/get-unit-detail.use-case";
export { LessonNotFoundError } from "@/modules/curriculum/application/use-cases/get-lesson.use-case";
export type { ClientLesson } from "@/modules/curriculum/application/use-cases/get-lesson.use-case";
export type { ClientExerciseSummary } from "@/modules/curriculum/application/use-cases/list-exercises-for-lesson.use-case";
export { ExerciseNotFoundError as ScoreExerciseNotFoundError } from "@/modules/curriculum/application/use-cases/score-exercise.use-case";
export { toClientExercise } from "@/modules/curriculum/domain/services/exercise";
export type {
  ExerciseType,
  Exercise,
  ClientExercise,
  ClientMultipleChoiceExercise,
  ClientFillInBlankExercise,
  ClientMatchingExercise,
  ClientOrderingExercise,
  ClientTrueFalseExercise,
  ClientShortAnswerExercise,
  ClientSentenceBuildingExercise,
} from "@/modules/curriculum/domain/services/exercise";
export { ExerciseResponseTypeMismatchError } from "@/modules/curriculum/domain/services/score-exercise";
export type { ExerciseResponse, ScoreResult } from "@/modules/curriculum/domain/services/score-exercise";
export { toClientVocabularyEntry } from "@/modules/curriculum/domain/services/vocabulary-entry";
export type { VocabularyEntry, ClientVocabularyEntry, VocabularyTier, ExampleSentence } from "@/modules/curriculum/domain/services/vocabulary-entry";
