import type { AwardXpInput, AwardXpResult, XpRepositoryPort } from "@/modules/engagement/application/ports/xp-repository-port";

/** SRS FR-18: XP is recorded to the append-only ledger and the balance projection is updated in the same write — idempotent per `sourceEventId`. */
export class AwardXpUseCase {
  constructor(private readonly xp: XpRepositoryPort) {}

  async execute(input: AwardXpInput): Promise<AwardXpResult> {
    return this.xp.award(input);
  }
}
