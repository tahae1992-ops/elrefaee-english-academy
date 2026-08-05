import type { TutorConversationRepositoryPort, TutorMessageRecord } from "@/modules/ai/application/ports/tutor-conversation-repository-port";
import type { PromptTemplateRepositoryPort } from "@/modules/ai/application/ports/prompt-template-repository-port";
import type { AiGateway } from "@/modules/ai/application/services/ai-gateway";
import { buildTutorSystemPrompt, type TutorPromptContext } from "@/modules/ai/domain/services/tutor-prompt";
import type { ConversationTurn } from "@/modules/ai/domain/services/gateway-types";

export class PromptTemplateNotFoundError extends Error {
  constructor() {
    super("No active prompt template configured for the tutor module.");
    this.name = "PromptTemplateNotFoundError";
  }
}

export class TutorRateLimitExceededError extends Error {
  constructor() {
    super("Daily AI Tutor message limit reached. Try again tomorrow.");
    this.name = "TutorRateLimitExceededError";
  }
}

/** FR-12's "input length capped... to bound cost/abuse" extended per-day (SRS §6.4b's per-user AI rate limit) — real, simple, config data. */
const DAILY_MESSAGE_LIMIT = 50;
/** SAD §7.4: "a rolling window of the last N turns kept verbatim." */
const ROLLING_WINDOW_TURNS = 10;

export interface SendTutorMessageResult {
  conversationId: string;
  userMessage: TutorMessageRecord;
  assistantMessage: TutorMessageRecord;
}

/**
 * API Spec §6.9: POST /ai/tutor/messages (FR-12). Orchestrates
 * conversation state + the versioned prompt template + the Gateway —
 * everything here is `ai`-module-owned data; the CEFR level/lesson
 * content/recent-mistakes that shape `promptContext` are cross-module
 * (curriculum/identity/learning) and are resolved by the caller (see
 * src/lib/build-tutor-lesson-context.ts), same boundary rule as every
 * other cross-module composition in this codebase.
 */
export class SendTutorMessageUseCase {
  constructor(
    private readonly conversations: TutorConversationRepositoryPort,
    private readonly promptTemplates: PromptTemplateRepositoryPort,
    private readonly gateway: AiGateway,
  ) {}

  async execute(userId: string, lessonId: string, message: string, promptContext: TutorPromptContext, now: Date): Promise<SendTutorMessageResult> {
    const messagesSentToday = await this.conversations.countUserMessagesSince(userId, startOfUtcDay(now));
    if (messagesSentToday >= DAILY_MESSAGE_LIMIT) {
      throw new TutorRateLimitExceededError();
    }

    const template = await this.promptTemplates.getActive("tutor");
    if (!template) throw new PromptTemplateNotFoundError();

    const conversation = await this.conversations.getOrCreateForUserAndLesson(userId, lessonId, now);
    const history = await this.conversations.listRecentMessages(conversation.id, ROLLING_WINDOW_TURNS);
    const historyTurns: ConversationTurn[] = history.map((entry) => ({ role: entry.role, content: entry.content }));

    const systemPrompt = buildTutorSystemPrompt(template.templateBody, promptContext);
    const result = await this.gateway.invokeTutor({ systemPrompt, history: historyTurns, message }, { userId, promptTemplateId: template.id });

    const userMessage = await this.conversations.appendMessage(conversation.id, "user", message, now);
    const assistantMessage = await this.conversations.appendMessage(conversation.id, "assistant", result.reply, now);
    if (result.moderationFlagged) {
      await this.conversations.setMessageFlagged(assistantMessage.id, userId, true);
    }
    await this.conversations.touchLastMessageAt(conversation.id, now);

    return { conversationId: conversation.id, userMessage, assistantMessage: { ...assistantMessage, flagged: result.moderationFlagged } };
  }
}

function startOfUtcDay(date: Date): Date {
  return new Date(`${date.toISOString().slice(0, 10)}T00:00:00.000Z`);
}
