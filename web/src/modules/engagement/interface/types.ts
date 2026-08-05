// Re-exported so UI/Route Handler code stays within the arch-check boundary rule (only a module's interface layer is importable from outside it).
export { XP_REWARDS } from "@/modules/engagement/domain/services/xp-rewards";
export type { XpReason } from "@/modules/engagement/domain/services/xp-rewards";
export type { AwardXpInput, AwardXpResult } from "@/modules/engagement/application/ports/xp-repository-port";
