import type { TutorConversationRepositoryPort, TutorMessageRecord } from "@/modules/ai/application/ports/tutor-conversation-repository-port";

const HISTORY_LIMIT = 50;

/** "Support conversation history" — resuming the docked chat panel reopens the same (user, lesson) thread. */
export class GetConversationHistoryUseCase {
  constructor(private readonly conversations: TutorConversationRepositoryPort) {}

  async execute(userId: string, lessonId: string, now: Date): Promise<TutorMessageRecord[]> {
    const conversation = await this.conversations.getOrCreateForUserAndLesson(userId, lessonId, now);
    return this.conversations.listRecentMessages(conversation.id, HISTORY_LIMIT);
  }
}
