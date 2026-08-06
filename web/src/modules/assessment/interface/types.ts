// Re-exported so UI code can reference these types without reaching
// past this Interface-layer module into Application/Domain internals
// (arch-check's no-cross-module-reach-into-internals rule, SAD §4).
export type { CefrLevel, PlacementScore } from "@/modules/assessment/domain/services/score-placement-attempt";
export type { CheckpointScore, SkillBreakdownEntry } from "@/modules/assessment/domain/services/score-checkpoint-attempt";
export type { AssessmentItem } from "@/modules/assessment/application/ports/item-bank-port";
export { AttemptNotFoundError, AttemptNotOwnedError } from "@/modules/assessment/application/use-cases/submit-response.use-case";
