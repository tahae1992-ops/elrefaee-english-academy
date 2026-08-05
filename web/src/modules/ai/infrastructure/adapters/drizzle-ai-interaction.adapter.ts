import { getDb } from "@/shared/infrastructure/db/client";
import { aiInteractions } from "@/modules/ai/infrastructure/db/tables/ai";
import type { AiInteractionRepositoryPort, LogAiInteractionInput } from "@/modules/ai/application/ports/ai-interaction-repository-port";

export class DrizzleAiInteractionAdapter implements AiInteractionRepositoryPort {
  async log(input: LogAiInteractionInput): Promise<void> {
    await getDb().insert(aiInteractions).values({
      userId: input.userId,
      module: input.module,
      providerKey: input.providerKey,
      promptTemplateId: input.promptTemplateId,
      costUsd: input.costUsd,
      latencyMs: input.latencyMs,
      flagged: input.flagged,
    });
  }
}
