import type { StreakRecord, StreakRepositoryPort } from "@/modules/engagement/application/ports/streak-repository-port";

export class GetStreakUseCase {
  constructor(private readonly streaks: StreakRepositoryPort) {}

  async execute(userId: string): Promise<StreakRecord | null> {
    return this.streaks.findByUser(userId);
  }
}
