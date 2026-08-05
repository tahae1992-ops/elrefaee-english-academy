import type { BadgeRepositoryPort, BadgeWithStatus } from "@/modules/engagement/application/ports/badge-repository-port";

export class ListBadgesUseCase {
  constructor(private readonly badges: BadgeRepositoryPort) {}

  async execute(userId: string): Promise<BadgeWithStatus[]> {
    return this.badges.listForUser(userId);
  }
}
