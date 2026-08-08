import type { FeedbackCategory, FeedbackRepositoryPort } from "@/modules/feedback/application/ports/feedback-repository-port";
import { validateFeedbackMessage } from "@/modules/feedback/domain/services/validate-feedback-message";

export interface SubmitFeedbackInput {
  userId: string;
  category: FeedbackCategory;
  message: string;
  pageUrl?: string;
}

/** Phase 19's "feedback instrumentation" — a beta learner reporting a bug or suggestion from wherever they are in the app. */
export class SubmitFeedbackUseCase {
  constructor(private readonly feedback: FeedbackRepositoryPort) {}

  async execute(input: SubmitFeedbackInput): Promise<void> {
    const message = validateFeedbackMessage(input.message);
    await this.feedback.save({
      userId: input.userId,
      category: input.category,
      message,
      pageUrl: input.pageUrl,
    });
  }
}
