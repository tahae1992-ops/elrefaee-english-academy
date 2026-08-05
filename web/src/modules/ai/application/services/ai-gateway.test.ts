import { describe, expect, it, vi } from "vitest";
import { AiGateway } from "./ai-gateway";
import { AiProviderError, AiUnavailableError } from "@/modules/ai/domain/services/gateway-types";
import type { TutorProviderPort } from "@/modules/ai/application/ports/tutor-provider-port";
import type { AiInteractionRepositoryPort } from "@/modules/ai/application/ports/ai-interaction-repository-port";

const INPUT = { systemPrompt: "sys", history: [], message: "Why 'have been' not 'was'?" };
const META = { userId: "user-1", promptTemplateId: "template-1" };

function fakeInteractions(): AiInteractionRepositoryPort & { log: ReturnType<typeof vi.fn> } {
  return { log: vi.fn().mockResolvedValue(undefined) };
}

describe("AiGateway.invokeTutor", () => {
  it("returns the primary provider's reply and logs a non-flagged interaction on success", async () => {
    const primary: TutorProviderPort = {
      providerKey: "anthropic",
      invoke: vi.fn().mockResolvedValue({ reply: "Great question!", costUsd: 0.001, latencyMs: 500, providerKey: "anthropic" }),
    };
    const interactions = fakeInteractions();

    const result = await new AiGateway(primary, interactions).invokeTutor(INPUT, META);

    expect(result).toEqual({ reply: "Great question!", moderationFlagged: false });
    expect(interactions.log).toHaveBeenCalledWith(expect.objectContaining({ providerKey: "anthropic", flagged: false }));
  });

  it("blocks the message before calling any provider when the input is severely unsafe", async () => {
    const primary: TutorProviderPort = { providerKey: "anthropic", invoke: vi.fn() };
    const interactions = fakeInteractions();

    const result = await new AiGateway(primary, interactions).invokeTutor({ ...INPUT, message: "I want to kill myself" }, META);

    expect(primary.invoke).not.toHaveBeenCalled();
    expect(result.moderationFlagged).toBe(true);
    expect(result.reply).not.toBe("Great question!");
    expect(interactions.log).toHaveBeenCalledWith(expect.objectContaining({ flagged: true, providerKey: "none" }));
  });

  it("falls back to the secondary provider when the primary fails", async () => {
    const primary: TutorProviderPort = { providerKey: "anthropic", invoke: vi.fn().mockRejectedValue(new AiProviderError("anthropic", "timeout")) };
    const fallback: TutorProviderPort = {
      providerKey: "fallback",
      invoke: vi.fn().mockResolvedValue({ reply: "Fallback reply", costUsd: 0.002, latencyMs: 300, providerKey: "fallback" }),
    };
    const interactions = fakeInteractions();

    const result = await new AiGateway(primary, interactions, fallback).invokeTutor(INPUT, META);

    expect(result.reply).toBe("Fallback reply");
    expect(interactions.log).toHaveBeenCalledWith(expect.objectContaining({ providerKey: "fallback" }));
  });

  it("throws AiUnavailableError when every configured provider fails", async () => {
    const primary: TutorProviderPort = { providerKey: "anthropic", invoke: vi.fn().mockRejectedValue(new AiProviderError("anthropic", "down")) };
    const interactions = fakeInteractions();

    await expect(new AiGateway(primary, interactions).invokeTutor(INPUT, META)).rejects.toThrow(AiUnavailableError);
    expect(interactions.log).not.toHaveBeenCalled();
  });

  it("flags the interaction when the output itself trips moderation", async () => {
    const primary: TutorProviderPort = {
      providerKey: "anthropic",
      invoke: vi.fn().mockResolvedValue({ reply: "how to make a bomb, step 1...", costUsd: 0.001, latencyMs: 100, providerKey: "anthropic" }),
    };
    const interactions = fakeInteractions();

    const result = await new AiGateway(primary, interactions).invokeTutor(INPUT, META);

    expect(result.moderationFlagged).toBe(true);
    expect(result.reply).not.toContain("bomb");
  });
});
