import { z } from "zod";
import type { SubmitFeedbackUseCase } from "@/modules/feedback/application/use-cases/submit-feedback.use-case";
import { FeedbackMessageInvalidError } from "@/modules/feedback/domain/services/validate-feedback-message";

const schema = z.object({
  category: z.enum(["bug", "suggestion", "other"]),
  message: z.string().trim().min(1).max(2000),
  pageUrl: z.string().max(500).optional(),
});

export async function handleSubmitFeedback(
  useCase: SubmitFeedbackUseCase,
  userId: string,
  rawInput: unknown,
): Promise<{ status: number; body: unknown }> {
  const parsed = schema.safeParse(rawInput);
  if (!parsed.success) {
    return { status: 400, body: { error: "VALIDATION_FAILED", message: "Invalid request." } };
  }

  try {
    await useCase.execute({ userId, ...parsed.data });
    return { status: 201, body: { received: true } };
  } catch (error) {
    if (error instanceof FeedbackMessageInvalidError) {
      return { status: 400, body: { error: "VALIDATION_FAILED", message: error.message } };
    }

    console.error("POST /api/v1/feedback failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not submit your feedback." } };
  }
}
