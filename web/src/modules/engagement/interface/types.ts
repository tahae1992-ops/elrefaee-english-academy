// Re-exported so UI/Route Handler code stays within the arch-check boundary rule (only a module's interface layer is importable from outside it).
export { XP_REWARDS } from "@/modules/engagement/domain/services/xp-rewards";
export type { XpReason } from "@/modules/engagement/domain/services/xp-rewards";
export type { AwardXpInput, AwardXpResult } from "@/modules/engagement/application/ports/xp-repository-port";
export type { XpTransactionRecord } from "@/modules/engagement/application/ports/xp-repository-port";
export { deriveLevel, XP_PER_LEVEL } from "@/modules/engagement/domain/services/learner-level";
export type { LearnerLevel } from "@/modules/engagement/domain/services/learner-level";
export type { StreakState } from "@/modules/engagement/domain/services/streak";
export type { StreakRecord } from "@/modules/engagement/application/ports/streak-repository-port";
export type { BadgeWithStatus } from "@/modules/engagement/application/ports/badge-repository-port";
export type { LearnerStatsSnapshot } from "@/modules/engagement/domain/services/badge-evaluator";
export type { DailyGoalProgress } from "@/modules/engagement/application/use-cases/get-daily-goal-progress.use-case";
