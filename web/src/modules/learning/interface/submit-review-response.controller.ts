import { z } from "zod";
import type { SubmitReviewResponseUseCase, SubmitReviewResponseResult } from "@/modules/learning/application/use-cases/submit-review-response.use-case";
import { ReviewItemNotFoundError } from "@/modules/learning/application/use-cases/submit-review-response.use-case";
import type { ReviewRating } from "@/modules/learning/domain/services/fsrs-scheduler";

export const reviewResponseSchema = z.object({
  vocabularyEntryId: z.string().uuid(),
  // FR-09's validation rule: "must map to one of the scheduler's defined recall-quality buckets (again/hard/good/easy)" — never a binary right/wrong (EDD §16, doc 08 §3.13).
  rating: z.enum(["again", "hard", "good", "easy"]),
  clientEventId: z.string().uuid(),
});

export interface SubmitReviewResponseControllerResult {
  status: number;
  body: unknown;
  result?: SubmitReviewResponseResult;
  rating?: ReviewRating;
}

/** API Spec §6.7: POST /review/responses. */
export async function handleSubmitReviewResponse(
  useCase: SubmitReviewResponseUseCase,
  userId: string,
  body: unknown,
  now: Date,
): Promise<SubmitReviewResponseControllerResult> {
  const parsed = reviewResponseSchema.safeParse(body);
  if (!parsed.success) {
    return { status: 400, body: { error: "VALIDATION_FAILED", message: "Invalid request." } };
  }

  try {
    const result = await useCase.execute(userId, parsed.data.vocabularyEntryId, parsed.data.rating, parsed.data.clientEventId, now);
    return { status: 200, body: result, result, rating: parsed.data.rating };
  } catch (error) {
    if (error instanceof ReviewItemNotFoundError) return { status: 404, body: { error: "NOT_FOUND", message: error.message } };

    console.error("POST /api/v1/review/responses failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not record the review response." } };
  }
}
