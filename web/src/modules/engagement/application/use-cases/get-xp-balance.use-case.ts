import type { XpRepositoryPort } from "@/modules/engagement/application/ports/xp-repository-port";

/** Dashboard's XP strip reads the maintained `xp_balances` projection, not `SUM()` over the ledger (DB Design §14's flagged bottleneck). */
export class GetXpBalanceUseCase {
  constructor(private readonly xp: XpRepositoryPort) {}

  async execute(userId: string): Promise<number> {
    return this.xp.getBalance(userId);
  }
}
