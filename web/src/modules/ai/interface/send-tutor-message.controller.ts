import { z } from "zod";
import type { SendTutorMessageUseCase, SendTutorMessageResult } from "@/modules/ai/application/use-cases/send-tutor-message.use-case";
import { TutorRateLimitExceededError } from "@/modules/ai/application/use-cases/send-tutor-message.use-case";
import { AiUnavailableError } from "@/modules/ai/domain/services/gateway-types";
import type { TutorPromptContext } from "@/modules/ai/domain/services/tutor-prompt";

// FR-12's validation rule: "Input length capped (e.g., 2,000 characters) to bound cost/abuse." `promptContext` is deliberately NOT part of the client-facing schema — it's server-resolved (see src/lib/build-tutor-lesson-context.ts) from real lesson/learner data, never trusted from the request body (a client-supplied CEFR level or "target vocabulary" would be a prompt-injection vector into the system prompt).
export const sendTutorMessageRequestSchema = z.object({
  lessonId: z.string().uuid(),
  message: z.string().trim().min(1).max(2000),
});

export interface SendTutorMessageControllerResult {
  status: number;
  body: unknown;
  result?: SendTutorMessageResult;
}

/** API Spec §6.9: POST /ai/tutor/messages. */
export async function handleSendTutorMessage(
  useCase: SendTutorMessageUseCase,
  userId: string,
  lessonId: string,
  message: string,
  promptContext: TutorPromptContext,
  now: Date,
): Promise<SendTutorMessageControllerResult> {
  try {
    const result = await useCase.execute(userId, lessonId, message, promptContext, now);
    return { status: 200, body: result, result };
  } catch (error) {
    if (error instanceof TutorRateLimitExceededError) return { status: 429, body: { error: "RATE_LIMIT_EXCEEDED", message: error.message } };
    if (error instanceof AiUnavailableError) {
      return { status: 503, body: { error: "AI_UNAVAILABLE", message: "Tutor is temporarily unavailable, try again shortly." } };
    }

    // PromptTemplateNotFoundError shouldn't happen once seeded (migration 0028) — falls through to the generic 500 below, logged either way.
    console.error("POST /api/v1/ai/tutor/messages failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not reach the tutor." } };
  }
}
