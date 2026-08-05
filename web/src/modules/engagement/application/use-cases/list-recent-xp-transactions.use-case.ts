import type { XpRepositoryPort, XpTransactionRecord } from "@/modules/engagement/application/ports/xp-repository-port";

export class ListRecentXpTransactionsUseCase {
  constructor(private readonly xp: XpRepositoryPort) {}

  async execute(userId: string, limit: number): Promise<XpTransactionRecord[]> {
    return this.xp.listRecentTransactions(userId, limit);
  }
}
