import type { AttemptBlueprintMeta, ItemBankPort } from "@/modules/assessment/application/ports/item-bank-port";
import type { AttemptRepositoryPort } from "@/modules/assessment/application/ports/attempt-repository-port";
import { AttemptNotFoundError, AttemptNotOwnedError } from "@/modules/assessment/application/use-cases/submit-response.use-case";

/**
 * Not part of the API Spec's own endpoint table — internal plumbing the
 * `/assessment-attempts/{id}/submit` and `/{id}` Route Handlers use to
 * decide which scoring path (placement vs. checkpoint) an attempt
 * belongs to, without either path reaching into the other's internals.
 */
export class GetAttemptKindUseCase {
  constructor(
    private readonly attempts: AttemptRepositoryPort,
    private readonly itemBank: ItemBankPort,
  ) {}

  async execute(attemptId: string, userId: string): Promise<AttemptBlueprintMeta> {
    const attempt = await this.attempts.findById(attemptId);
    if (!attempt) throw new AttemptNotFoundError();
    if (attempt.userId !== userId) throw new AttemptNotOwnedError();

    const meta = await this.itemBank.getBlueprintMeta(attempt.blueprintId);
    if (!meta) throw new AttemptNotFoundError();
    return meta;
  }
}
