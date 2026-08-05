import type { TutorConversationRepositoryPort, TutorMessageRecord } from "@/modules/ai/application/ports/tutor-conversation-repository-port";

export class TutorMessageNotFoundError extends Error {
  constructor() {
    super("Message not found, or does not belong to this learner.");
    this.name = "TutorMessageNotFoundError";
  }
}

/** doc 08 §3.11's "[Flag for instructor]" learner-initiated action (EDD §18's escalation rule, "made a literal UI affordance"). */
export class FlagTutorMessageUseCase {
  constructor(private readonly conversations: TutorConversationRepositoryPort) {}

  async execute(userId: string, messageId: number): Promise<TutorMessageRecord> {
    const message = await this.conversations.setMessageFlagged(messageId, userId, true);
    if (!message) throw new TutorMessageNotFoundError();
    return message;
  }
}
