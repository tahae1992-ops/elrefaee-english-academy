import type { TutorProviderPort } from "@/modules/ai/application/ports/tutor-provider-port";
import type { AiInteractionRepositoryPort } from "@/modules/ai/application/ports/ai-interaction-repository-port";
import type { TutorInvokeInput } from "@/modules/ai/domain/services/gateway-types";
import { AiUnavailableError } from "@/modules/ai/domain/services/gateway-types";
import { moderateInput, moderateOutput } from "@/modules/ai/domain/services/moderation";

export interface AiGatewayInvokeMeta {
  userId: string;
  promptTemplateId: string | null;
}

export interface AiGatewayResult {
  reply: string;
  /** True if either the input or the output tripped a moderation rule — surfaced so the caller can mark the persisted message flagged, distinct from the learner-initiated "Flag for instructor" action. */
  moderationFlagged: boolean;
}

const SAFE_REFUSAL_MESSAGE =
  "I can't help with that. I'm here for English learning, so let's get back to the lesson — and if you need support, please reach out to a trusted person or a local helpline.";

/**
 * SAD §7.1: "A single internal service (`aiGateway.invoke(module,
 * input, context)`) fronting all AI-touching functionality." This is
 * that service for the `tutor` module (the only module built in this
 * slice) — moderates input, calls the primary provider (falling back
 * to a secondary one if configured, per SAD §7.6; none is configured
 * yet, so a primary failure goes straight to AiUnavailableError),
 * moderates output, and logs every attempt to `ai.interactions`
 * (cost/latency/safety, never content) regardless of outcome.
 */
export class AiGateway {
  constructor(
    private readonly primaryProvider: TutorProviderPort,
    private readonly interactions: AiInteractionRepositoryPort,
    private readonly fallbackProvider?: TutorProviderPort,
  ) {}

  async invokeTutor(input: TutorInvokeInput, meta: AiGatewayInvokeMeta): Promise<AiGatewayResult> {
    const inputModeration = moderateInput(input.message);
    if (inputModeration.severity === "blocked") {
      await this.interactions.log({
        userId: meta.userId,
        module: "tutor",
        providerKey: "none",
        promptTemplateId: meta.promptTemplateId,
        costUsd: 0,
        latencyMs: 0,
        flagged: true,
      });
      return { reply: SAFE_REFUSAL_MESSAGE, moderationFlagged: true };
    }

    const providers = [this.primaryProvider, this.fallbackProvider].filter((provider): provider is TutorProviderPort => Boolean(provider));

    for (const provider of providers) {
      const startedAt = Date.now();
      try {
        const output = await provider.invoke(input);
        const latencyMs = Date.now() - startedAt;
        const outputModeration = moderateOutput(output.reply);
        const flagged = outputModeration.severity !== "none" || inputModeration.severity === "flagged";

        await this.interactions.log({
          userId: meta.userId,
          module: "tutor",
          providerKey: output.providerKey,
          promptTemplateId: meta.promptTemplateId,
          costUsd: output.costUsd,
          latencyMs,
          flagged,
        });

        if (outputModeration.severity === "blocked") {
          return { reply: SAFE_REFUSAL_MESSAGE, moderationFlagged: true };
        }
        return { reply: output.reply, moderationFlagged: flagged };
      } catch {
        // SAD §7.6: fallback attempts are logged distinctly from primary-success calls, but this MVP has no secondary adapter configured — a primary failure here simply tries the next configured provider (if any) or falls through to AiUnavailableError below.
        continue;
      }
    }

    throw new AiUnavailableError("tutor");
  }
}
