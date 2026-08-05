/**
 * SAD §7.1/§7.2's AI Gateway contract: "a single internal service...
 * fronting all AI-touching functionality," where "each module defines
 * its own typed input/output contract" and "a provider adapter
 * implements that contract for a specific vendor." This file is that
 * contract for the `tutor` module — the domain layer owns the shape,
 * the infrastructure layer's adapter(s) implement it, matching this
 * codebase's established Port pattern everywhere else.
 */

export type AiModule = "tutor";

export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

export interface TutorInvokeInput {
  systemPrompt: string;
  history: ConversationTurn[];
  message: string;
}

export interface TutorInvokeOutput {
  reply: string;
  /** For ai.interactions' cost_usd column — the adapter computes this from the provider's own token-usage response, not estimated. */
  costUsd: number;
  latencyMs: number;
  providerKey: string;
}

/** Thrown by a provider adapter on any failure (timeout, API error, missing credentials) — the Gateway catches this to drive SRS §7.6's fallback/unavailable logic. Never thrown for a successful-but-refused model response (that's a normal TutorInvokeOutput whose reply declines). */
export class AiProviderError extends Error {
  constructor(
    public readonly providerKey: string,
    message: string,
  ) {
    super(message);
    this.name = "AiProviderError";
  }
}

/** Every configured provider for a module has failed (or none is configured) — SRS FR-12's Exception Flow: "learner sees an explicit 'tutor unavailable, try again shortly' state." */
export class AiUnavailableError extends Error {
  constructor(module: AiModule) {
    super(`AI module '${module}' is unavailable — every configured provider failed.`);
    this.name = "AiUnavailableError";
  }
}
