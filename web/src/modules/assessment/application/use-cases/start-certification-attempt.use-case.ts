import type { AssessmentItem, ItemBankPort } from "@/modules/assessment/application/ports/item-bank-port";
import type { AttemptRepositoryPort } from "@/modules/assessment/application/ports/attempt-repository-port";
import type { CertificationResultRepositoryPort } from "@/modules/assessment/application/ports/certification-result-repository-port";
import type { CefrLevel } from "@/modules/assessment/domain/services/score-placement-attempt";
import { computeCertificationEligibility } from "@/modules/assessment/domain/services/compute-certification-cooldown";

export interface StartCertificationAttemptInput {
  userId: string;
  cefrLevel: CefrLevel;
}

export interface StartCertificationAttemptResult {
  attemptId: string;
  items: AssessmentItem[];
  timeLimitMinutes: number;
}

export class CertificationBlueprintNotFoundError extends Error {
  constructor() {
    super("No certification exam is configured for this level.");
    this.name = "CertificationBlueprintNotFoundError";
  }
}

export class CertificationCooldownError extends Error {
  constructor(public readonly unlockAt: Date) {
    super("A previous certification attempt for this level failed recently. Try again after the cooldown period.");
    this.name = "CertificationCooldownError";
  }
}

/**
 * Mirrors StartCheckpointAttemptUseCase's idempotent fetch-or-create
 * shape, plus SRS §9.6's cooldown gate a checkpoint attempt doesn't
 * need (checkpoints allow unlimited practice attempts; certification
 * exams don't). "Has the learner completed every unit's checkpoint
 * for this level" is enforced by the caller, same division of
 * responsibility as StartCheckpointAttemptUseCase's own unit-lesson
 * gate.
 */
export class StartCertificationAttemptUseCase {
  constructor(
    private readonly itemBank: ItemBankPort,
    private readonly attempts: AttemptRepositoryPort,
    private readonly certificationResults: CertificationResultRepositoryPort,
  ) {}

  async execute(input: StartCertificationAttemptInput): Promise<StartCertificationAttemptResult> {
    const blueprint = await this.itemBank.getCertificationBlueprint(input.cefrLevel);
    if (!blueprint) {
      throw new CertificationBlueprintNotFoundError();
    }

    const existing = await this.attempts.findInProgressByUserAndBlueprint(input.userId, blueprint.id);
    if (existing) {
      const items = await this.itemBank.getItemsByIds(existing.assembledItems);
      return { attemptId: existing.id, items, timeLimitMinutes: blueprint.timeLimitMinutes };
    }

    const history = await this.certificationResults.findHistoryByUserAndLevel(input.userId, input.cefrLevel);
    const eligibility = computeCertificationEligibility(
      history,
      new Date(),
      blueprint.cooldownDays,
      blueprint.maxFailuresBeforeEscalation,
    );
    if (!eligibility.canAttempt && eligibility.unlockAt) {
      throw new CertificationCooldownError(eligibility.unlockAt);
    }

    const items = await this.itemBank.assembleCertificationItems(input.cefrLevel, blueprint.itemCount);
    const attempt = await this.attempts.create({
      userId: input.userId,
      blueprintId: blueprint.id,
      assembledItemIds: items.map((item) => item.id),
    });

    return { attemptId: attempt.id, items, timeLimitMinutes: blueprint.timeLimitMinutes };
  }
}
