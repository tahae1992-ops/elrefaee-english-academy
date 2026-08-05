// Re-exported so cross-module composition code (src/lib/lesson-access.ts,
// Route Handlers) stays within the arch-check boundary rule — only a
// module's interface layer is importable from outside it.
export { computeUnitAccess } from "@/modules/learning/domain/services/compute-unit-access";
export type { LessonProgressStatus, UnitAccessState } from "@/modules/learning/domain/services/compute-unit-access";
export type { Enrollment } from "@/modules/learning/application/ports/enrollment-repository-port";
export type { LessonProgress, LastPosition } from "@/modules/learning/application/ports/progress-repository-port";
export type { ExerciseAttempt, RecordExerciseAttemptInput } from "@/modules/learning/application/ports/exercise-attempt-repository-port";
export { deriveReviewState } from "@/modules/learning/domain/services/review-state";
export type { ReviewLearningState } from "@/modules/learning/domain/services/review-state";
export type { ReviewRating } from "@/modules/learning/domain/services/fsrs-scheduler";
export type { VocabularyReviewStateRecord } from "@/modules/learning/application/ports/vocabulary-review-state-repository-port";
export type { DueReviewQueue } from "@/modules/learning/application/use-cases/get-due-review-queue.use-case";
export { ReviewItemNotFoundError } from "@/modules/learning/application/use-cases/submit-review-response.use-case";
export type { SubmitReviewResponseResult } from "@/modules/learning/application/use-cases/submit-review-response.use-case";
