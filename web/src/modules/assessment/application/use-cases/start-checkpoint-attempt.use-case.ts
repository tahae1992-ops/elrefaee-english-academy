import type { AssessmentItem, ItemBankPort } from "@/modules/assessment/application/ports/item-bank-port";
import type { AttemptRepositoryPort } from "@/modules/assessment/application/ports/attempt-repository-port";

export interface StartCheckpointAttemptInput {
  userId: string;
  unitId: string;
}

export interface StartCheckpointAttemptResult {
  attemptId: string;
  items: AssessmentItem[];
}

export class CheckpointBlueprintNotFoundError extends Error {
  constructor() {
    super("No checkpoint quiz is configured for this unit.");
    this.name = "CheckpointBlueprintNotFoundError";
  }
}

/**
 * API Spec §6.4's `GET /quizzes/{unitId}/checkpoint` — modeled as an
 * idempotent fetch-or-create: an in-progress attempt for this
 * (learner, unit) is resumed rather than duplicated (re-opening the
 * checkpoint panel, a page refresh, etc. shouldn't abandon progress or
 * pile up orphaned attempts). "Has the learner completed every lesson
 * in this unit" is enforced by the caller (the Route Handler, alongside
 * curriculum/learning composition it already has — SAD §4: this
 * use-case only knows about assessment's own data).
 */
export class StartCheckpointAttemptUseCase {
  constructor(
    private readonly itemBank: ItemBankPort,
    private readonly attempts: AttemptRepositoryPort,
  ) {}

  async execute(input: StartCheckpointAttemptInput): Promise<StartCheckpointAttemptResult> {
    const blueprint = await this.itemBank.getCheckpointBlueprint(input.unitId);
    if (!blueprint) {
      throw new CheckpointBlueprintNotFoundError();
    }

    const existing = await this.attempts.findInProgressByUserAndBlueprint(input.userId, blueprint.id);
    if (existing) {
      const items = await this.itemBank.getItemsByIds(existing.assembledItems);
      return { attemptId: existing.id, items };
    }

    const items = await this.itemBank.assembleCheckpointItems(input.unitId, blueprint.itemCount);
    const attempt = await this.attempts.create({
      userId: input.userId,
      blueprintId: blueprint.id,
      assembledItemIds: items.map((item) => item.id),
    });

    return { attemptId: attempt.id, items };
  }
}
