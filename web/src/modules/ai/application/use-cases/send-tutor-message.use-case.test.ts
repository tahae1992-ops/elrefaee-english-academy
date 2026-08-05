import { describe, expect, it, vi } from "vitest";
import { PromptTemplateNotFoundError, SendTutorMessageUseCase, TutorRateLimitExceededError } from "./send-tutor-message.use-case";
import type { TutorConversationRecord, TutorConversationRepositoryPort, TutorMessageRecord } from "@/modules/ai/application/ports/tutor-conversation-repository-port";
import type { PromptTemplateRepositoryPort } from "@/modules/ai/application/ports/prompt-template-repository-port";
import type { AiGateway } from "@/modules/ai/application/services/ai-gateway";
import type { TutorPromptContext } from "@/modules/ai/domain/services/tutor-prompt";

const NOW = new Date("2026-08-05T12:00:00.000Z");
const CONTEXT: TutorPromptContext = { cefrLevel: "a1", lessonTitle: "Meeting People", lessonObjective: "o", targetVocabulary: [], recentMistakes: [] };

function fakeConversation(): TutorConversationRecord {
  return { id: "conv-1", userId: "user-1", lessonId: "lesson-1", startedAt: NOW, lastMessageAt: NOW };
}

function fakeMessage(overrides: Partial<TutorMessageRecord> = {}): TutorMessageRecord {
  return { id: 1, conversationId: "conv-1", role: "user", content: "hi", flagged: false, createdAt: NOW, ...overrides };
}

function fakeConversations(overrides: Partial<TutorConversationRepositoryPort> = {}): TutorConversationRepositoryPort {
  return {
    getOrCreateForUserAndLesson: vi.fn().mockResolvedValue(fakeConversation()),
    listRecentMessages: vi.fn().mockResolvedValue([]),
    appendMessage: vi.fn().mockImplementation(async (_conversationId: string, role: "user" | "assistant") => fakeMessage({ role })),
    touchLastMessageAt: vi.fn().mockResolvedValue(undefined),
    countUserMessagesSince: vi.fn().mockResolvedValue(0),
    setMessageFlagged: vi.fn().mockResolvedValue(fakeMessage({ role: "assistant", flagged: true })),
    ...overrides,
  };
}

function fakePromptTemplates(): PromptTemplateRepositoryPort {
  return { getActive: vi.fn().mockResolvedValue({ id: "template-1", module: "tutor", version: 1, templateBody: "Level: {{cefrLevel}}" }) };
}

function fakeGateway(reply = "Good question!", moderationFlagged = false): AiGateway {
  return { invokeTutor: vi.fn().mockResolvedValue({ reply, moderationFlagged }) } as unknown as AiGateway;
}

describe("SendTutorMessageUseCase", () => {
  it("creates/reuses the conversation, calls the gateway with the built system prompt, and persists both messages", async () => {
    const conversations = fakeConversations();
    const promptTemplates = fakePromptTemplates();
    const gateway = fakeGateway("Good question!");

    const result = await new SendTutorMessageUseCase(conversations, promptTemplates, gateway).execute("user-1", "lesson-1", "Why?", CONTEXT, NOW);

    expect(conversations.getOrCreateForUserAndLesson).toHaveBeenCalledWith("user-1", "lesson-1", NOW);
    expect(gateway.invokeTutor).toHaveBeenCalledWith(
      expect.objectContaining({ systemPrompt: "Level: a1", message: "Why?" }),
      { userId: "user-1", promptTemplateId: "template-1" },
    );
    expect(conversations.appendMessage).toHaveBeenCalledTimes(2);
    expect(conversations.touchLastMessageAt).toHaveBeenCalledWith("conv-1", NOW);
    expect(result.conversationId).toBe("conv-1");
  });

  it("marks the assistant message flagged when the gateway reports moderation flagged it", async () => {
    const conversations = fakeConversations();
    const gateway = fakeGateway("refusal", true);

    const result = await new SendTutorMessageUseCase(conversations, fakePromptTemplates(), gateway).execute("user-1", "lesson-1", "bad input", CONTEXT, NOW);

    expect(conversations.setMessageFlagged).toHaveBeenCalled();
    expect(result.assistantMessage.flagged).toBe(true);
  });

  it("throws TutorRateLimitExceededError once the daily message cap is reached", async () => {
    const conversations = fakeConversations({ countUserMessagesSince: vi.fn().mockResolvedValue(50) });

    await expect(
      new SendTutorMessageUseCase(conversations, fakePromptTemplates(), fakeGateway()).execute("user-1", "lesson-1", "hi", CONTEXT, NOW),
    ).rejects.toThrow(TutorRateLimitExceededError);
  });

  it("throws PromptTemplateNotFoundError when no active template exists", async () => {
    const promptTemplates: PromptTemplateRepositoryPort = { getActive: vi.fn().mockResolvedValue(null) };

    await expect(
      new SendTutorMessageUseCase(fakeConversations(), promptTemplates, fakeGateway()).execute("user-1", "lesson-1", "hi", CONTEXT, NOW),
    ).rejects.toThrow(PromptTemplateNotFoundError);
  });

  it("passes recent conversation history to the gateway as prior turns", async () => {
    const priorMessages = [fakeMessage({ role: "user", content: "first" }), fakeMessage({ role: "assistant", content: "reply" })];
    const conversations = fakeConversations({ listRecentMessages: vi.fn().mockResolvedValue(priorMessages) });
    const gateway = fakeGateway();

    await new SendTutorMessageUseCase(conversations, fakePromptTemplates(), gateway).execute("user-1", "lesson-1", "second", CONTEXT, NOW);

    expect(gateway.invokeTutor).toHaveBeenCalledWith(
      expect.objectContaining({ history: [{ role: "user", content: "first" }, { role: "assistant", content: "reply" }] }),
      expect.anything(),
    );
  });
});
