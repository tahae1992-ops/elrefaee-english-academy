import { describe, expect, it, vi } from "vitest";
import { FlagTutorMessageUseCase, TutorMessageNotFoundError } from "./flag-tutor-message.use-case";
import type { TutorConversationRepositoryPort, TutorMessageRecord } from "@/modules/ai/application/ports/tutor-conversation-repository-port";

describe("FlagTutorMessageUseCase", () => {
  it("flags the message and returns the updated record", async () => {
    const flagged: TutorMessageRecord = { id: 1, conversationId: "conv-1", role: "assistant", content: "reply", flagged: true, createdAt: new Date() };
    const conversations = { setMessageFlagged: vi.fn().mockResolvedValue(flagged) } as unknown as TutorConversationRepositoryPort;

    const result = await new FlagTutorMessageUseCase(conversations).execute("user-1", 1);

    expect(conversations.setMessageFlagged).toHaveBeenCalledWith(1, "user-1", true);
    expect(result.flagged).toBe(true);
  });

  it("throws TutorMessageNotFoundError when the message doesn't belong to this learner", async () => {
    const conversations = { setMessageFlagged: vi.fn().mockResolvedValue(null) } as unknown as TutorConversationRepositoryPort;

    await expect(new FlagTutorMessageUseCase(conversations).execute("user-1", 999)).rejects.toThrow(TutorMessageNotFoundError);
  });
});
