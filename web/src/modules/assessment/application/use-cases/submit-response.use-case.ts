import type { ItemBankPort } from "@/modules/assessment/application/ports/item-bank-port";
import type { AttemptRepositoryPort } from "@/modules/assessment/application/ports/attempt-repository-port";

export interface SubmitResponseInput {
  attemptId: string;
  userId: string;
  itemId: string;
  responsePayload: Record<string, unknown>;
}

export class AttemptNotFoundError extends Error {
  constructor() {
    super("Attempt not found.");
    this.name = "AttemptNotFoundError";
  }
}
export class AttemptNotOwnedError extends Error {
  constructor() {
    super("This attempt does not belong to the current user.");
    this.name = "AttemptNotOwnedError";
  }
}
export class AttemptAlreadyCompletedError extends Error {
  constructor() {
    super("This attempt is already completed.");
    this.name = "AttemptAlreadyCompletedError";
  }
}
export class ItemAlreadyAnsweredError extends Error {
  constructor() {
    super("This item has already been answered.");
    this.name = "ItemAlreadyAnsweredError";
  }
}

/**
 * API Spec §7's `POST /assessment-attempts/{id}/responses`. Never
 * returns whether the answer was correct — doc 09 §5.3/doc 08 §3.3's
 * explicit rule that Stage 2 withholds a running score to avoid
 * measurably increasing test anxiety.
 */
export class SubmitResponseUseCase {
  constructor(
    private readonly itemBank: ItemBankPort,
    private readonly attempts: AttemptRepositoryPort,
  ) {}

  async execute(input: SubmitResponseInput): Promise<void> {
    const attempt = await this.attempts.findById(input.attemptId);
    if (!attempt) throw new AttemptNotFoundError();
    if (attempt.userId !== input.userId) throw new AttemptNotOwnedError();
    if (attempt.status !== "in_progress") throw new AttemptAlreadyCompletedError();
    if (!attempt.assembledItems.includes(input.itemId)) throw new AttemptNotFoundError();

    // Independent lookups — run concurrently rather than as two
    // sequential DB round trips.
    const [alreadyAnswered, item] = await Promise.all([
      this.attempts.hasResponseForItem(input.attemptId, input.itemId),
      this.itemBank.getItemForScoring(input.itemId),
    ]);
    if (alreadyAnswered) throw new ItemAlreadyAnsweredError();
    if (!item) throw new AttemptNotFoundError();

    if (item.itemType === "multiple_choice") {
      const selectedOptionIndex = input.responsePayload.selectedOptionIndex;
      const isCorrect = item.scoringKey?.correctOptionIndex === selectedOptionIndex;
      await this.attempts.recordResponse({
        attemptId: input.attemptId,
        itemId: input.itemId,
        responsePayload: input.responsePayload,
        isCorrect,
        scoredBy: "auto",
      });
      return;
    }

    // free_text (Speaking) — ungraded at MVP, no auto/AI pronunciation
    // scoring infrastructure exists yet; stored for future human review.
    await this.attempts.recordResponse({
      attemptId: input.attemptId,
      itemId: input.itemId,
      responsePayload: input.responsePayload,
      isCorrect: null,
      scoredBy: "human",
    });
  }
}
