import { getDb } from "@/shared/infrastructure/db/client";
import { feedbackSubmissions } from "@/shared/infrastructure/db/tables/feedback";
import type { FeedbackRepositoryPort, SaveFeedbackInput } from "@/modules/feedback/application/ports/feedback-repository-port";

export class DrizzleFeedbackAdapter implements FeedbackRepositoryPort {
  async save(input: SaveFeedbackInput): Promise<void> {
    await getDb().insert(feedbackSubmissions).values({
      userId: input.userId,
      category: input.category,
      message: input.message,
      pageUrl: input.pageUrl,
    });
  }
}
