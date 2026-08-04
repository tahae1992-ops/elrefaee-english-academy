// Re-exported so cross-module composition code (src/lib/lesson-access.ts,
// Route Handlers) stays within the arch-check boundary rule — only a
// module's interface layer is importable from outside it.
export { computeUnitAccess } from "@/modules/learning/domain/services/compute-unit-access";
export type { LessonProgressStatus, UnitAccessState } from "@/modules/learning/domain/services/compute-unit-access";
export type { Enrollment } from "@/modules/learning/application/ports/enrollment-repository-port";
export type { LessonProgress, LastPosition } from "@/modules/learning/application/ports/progress-repository-port";
export type { ExerciseAttempt, RecordExerciseAttemptInput } from "@/modules/learning/application/ports/exercise-attempt-repository-port";
