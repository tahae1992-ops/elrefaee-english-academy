import type { GetDueReviewQueueUseCase } from "@/modules/learning/application/use-cases/get-due-review-queue.use-case";
import type { DueReviewQueue } from "@/modules/learning/application/use-cases/get-due-review-queue.use-case";

export interface GetDueReviewQueueControllerResult {
  status: number;
  body: unknown;
  queue?: DueReviewQueue;
}

/** API Spec §6.7: GET /review/due. Just resolves scheduler state — resolving each item into displayable vocabulary content is cross-module, done by the Route Handler via src/lib/resolve-due-review-queue.ts. */
export async function handleGetDueReviewQueue(useCase: GetDueReviewQueueUseCase, userId: string, now: Date, limit: number): Promise<GetDueReviewQueueControllerResult> {
  try {
    const queue = await useCase.execute(userId, now, limit);
    return { status: 200, body: queue, queue };
  } catch (error) {
    console.error("GET /api/v1/review/due failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not load the review queue." } };
  }
}
