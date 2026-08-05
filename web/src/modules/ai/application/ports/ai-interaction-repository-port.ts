export interface LogAiInteractionInput {
  userId: string | null;
  module: string;
  providerKey: string;
  promptTemplateId: string | null;
  costUsd: number;
  latencyMs: number;
  flagged: boolean;
}

/** DB Design §3.8's `ai.interactions` — cost/latency/safety log, never prompt/response text. */
export interface AiInteractionRepositoryPort {
  log(input: LogAiInteractionInput): Promise<void>;
}
