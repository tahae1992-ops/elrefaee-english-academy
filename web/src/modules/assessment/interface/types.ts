// Re-exported so UI code can reference these types without reaching
// past this Interface-layer module into Application/Domain internals
// (arch-check's no-cross-module-reach-into-internals rule, SAD §4).
export type { CefrLevel, PlacementScore } from "@/modules/assessment/domain/services/score-placement-attempt";
export type { CheckpointScore, SkillBreakdownEntry } from "@/modules/assessment/domain/services/score-checkpoint-attempt";
export type { AssessmentItem } from "@/modules/assessment/application/ports/item-bank-port";
export type { CertificationScore } from "@/modules/assessment/application/use-cases/get-attempt-status.use-case";
export type { FinalizeCertificationAttemptResult } from "@/modules/assessment/application/use-cases/finalize-certification-attempt.use-case";
export type { CertificateRecord } from "@/modules/assessment/application/ports/certificate-repository-port";
export type { VerifyCertificateResult } from "@/modules/assessment/application/use-cases/verify-certificate.use-case";
export { AttemptNotFoundError, AttemptNotOwnedError } from "@/modules/assessment/application/use-cases/submit-response.use-case";
export { CertificationCooldownError } from "@/modules/assessment/application/use-cases/start-certification-attempt.use-case";
export { CertificateNotFoundOrNotOwnedError } from "@/modules/assessment/application/use-cases/get-certificate.use-case";
export { CertificateNotFoundError } from "@/modules/assessment/application/use-cases/verify-certificate.use-case";
