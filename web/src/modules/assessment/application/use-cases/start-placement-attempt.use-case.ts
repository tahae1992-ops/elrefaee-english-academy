import { tiersAroundLevel, type CefrLevel } from "@/modules/assessment/domain/services/score-placement-attempt";
import type { AssessmentItem, ItemBankPort } from "@/modules/assessment/application/ports/item-bank-port";
import type { AttemptRepositoryPort } from "@/modules/assessment/application/ports/attempt-repository-port";

export interface StartPlacementAttemptInput {
  userId: string;
  selfAssessedLevel: CefrLevel;
}

export interface StartPlacementAttemptResult {
  attemptId: string;
  items: AssessmentItem[];
}

export class BlueprintNotFoundError extends Error {
  constructor() {
    super('Placement test blueprint is not configured.');
    this.name = "BlueprintNotFoundError";
  }
}

/**
 * Stage 2's assembly step — API Spec §7's `assembleAttempt` (the item
 * set is decided once, here, not re-selected item-by-item: the "fixed
 * diagnostic" the approved MVP scope calls for, not true adaptive
 * routing).
 */
export class StartPlacementAttemptUseCase {
  constructor(
    private readonly itemBank: ItemBankPort,
    private readonly attempts: AttemptRepositoryPort,
  ) {}

  async execute(input: StartPlacementAttemptInput): Promise<StartPlacementAttemptResult> {
    const blueprint = await this.itemBank.getBlueprint("placement");
    if (!blueprint) {
      throw new BlueprintNotFoundError();
    }

    const tiers = tiersAroundLevel(input.selfAssessedLevel, blueprint.tiersAroundSelfAssessment);
    const gradedItems = await this.itemBank.assembleItems(
      blueprint.gradedSkills,
      tiers,
      blueprint.itemsPerSkillPerTier,
    );
    const speakingPrompt = await this.itemBank.getSpeakingPrompt(input.selfAssessedLevel);
    const items = speakingPrompt ? [...gradedItems, speakingPrompt] : gradedItems;

    const attempt = await this.attempts.create({
      userId: input.userId,
      blueprintId: blueprint.id,
      selfAssessedLevel: input.selfAssessedLevel,
      assembledItemIds: items.map((item) => item.id),
    });

    return { attemptId: attempt.id, items };
  }
}
