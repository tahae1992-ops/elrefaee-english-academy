import type { FlagTutorMessageUseCase } from "@/modules/ai/application/use-cases/flag-tutor-message.use-case";
import { TutorMessageNotFoundError } from "@/modules/ai/application/use-cases/flag-tutor-message.use-case";

export interface FlagTutorMessageControllerResult {
  status: number;
  body: unknown;
}

/** doc 08 §3.11's "[Flag for instructor]" action. */
export async function handleFlagTutorMessage(useCase: FlagTutorMessageUseCase, userId: string, messageId: number): Promise<FlagTutorMessageControllerResult> {
  try {
    const message = await useCase.execute(userId, messageId);
    return { status: 200, body: message };
  } catch (error) {
    if (error instanceof TutorMessageNotFoundError) return { status: 404, body: { error: "NOT_FOUND", message: error.message } };

    console.error("POST /api/v1/ai/tutor/messages/[id]/flag failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not flag this message." } };
  }
}
