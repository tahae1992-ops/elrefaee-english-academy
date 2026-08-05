import Anthropic from "@anthropic-ai/sdk";
import type { TutorProviderPort } from "@/modules/ai/application/ports/tutor-provider-port";
import type { TutorInvokeInput, TutorInvokeOutput } from "@/modules/ai/domain/services/gateway-types";
import { AiProviderError } from "@/modules/ai/domain/services/gateway-types";

/**
 * The real, single provider adapter for this slice (SAD §7.2). The
 * only file in the codebase permitted to import `@anthropic-ai/sdk`
 * directly — enforced by `.dependency-cruiser.cjs`'s
 * `ai-provider-sdk-confined-to-adapter` rule. Swapping or adding a
 * provider is a new file implementing `TutorProviderPort`, wired at
 * the composition root — never a change to the Gateway, use-cases, or
 * any call site.
 *
 * Per-token cost computed from the provider's own reported usage
 * (never estimated) against Anthropic's published Sonnet 5 pricing —
 * a config constant here, not scattered, so a price change is a
 * one-line edit (SRS FR-18's "configuration data, not hardcoded per
 * call site" convention, applied to cost tracking too).
 */

const MODEL = "claude-sonnet-5";
const MAX_OUTPUT_TOKENS = 1024;
const USD_PER_INPUT_TOKEN = 3 / 1_000_000;
const USD_PER_OUTPUT_TOKEN = 15 / 1_000_000;

export class AnthropicTutorAdapter implements TutorProviderPort {
  readonly providerKey = "anthropic";

  async invoke(input: TutorInvokeInput): Promise<TutorInvokeOutput> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new AiProviderError(this.providerKey, "ANTHROPIC_API_KEY is not configured.");
    }

    const client = new Anthropic({ apiKey });
    const startedAt = Date.now();

    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        system: input.systemPrompt,
        messages: [...input.history.map((turn) => ({ role: turn.role, content: turn.content })), { role: "user" as const, content: input.message }],
      });

      const latencyMs = Date.now() - startedAt;
      const textBlock = response.content.find((block) => block.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new AiProviderError(this.providerKey, "Provider returned no text content.");
      }

      const costUsd = response.usage.input_tokens * USD_PER_INPUT_TOKEN + response.usage.output_tokens * USD_PER_OUTPUT_TOKEN;

      return { reply: textBlock.text, costUsd, latencyMs, providerKey: this.providerKey };
    } catch (error) {
      if (error instanceof AiProviderError) throw error;
      const message = error instanceof Error ? error.message : "Unknown provider error.";
      throw new AiProviderError(this.providerKey, message);
    }
  }
}
