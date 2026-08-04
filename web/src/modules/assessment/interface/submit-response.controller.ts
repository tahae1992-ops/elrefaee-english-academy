import { z } from "zod";
import type { SubmitResponseUseCase } from "@/modules/assessment/application/use-cases/submit-response.use-case";
import {
  AttemptAlreadyCompletedError,
  AttemptNotFoundError,
  AttemptNotOwnedError,
  ItemAlreadyAnsweredError,
} from "@/modules/assessment/application/use-cases/submit-response.use-case";

const schema = z.object({
  itemId: z.string().uuid(),
  responsePayload: z.record(z.string(), z.unknown()),
});

export async function handleSubmitResponse(
  useCase: SubmitResponseUseCase,
  userId: string,
  attemptId: string,
  rawInput: unknown,
): Promise<{ status: number; body: unknown }> {
  const parsed = schema.safeParse(rawInput);
  if (!parsed.success) {
    return { status: 400, body: { error: "VALIDATION_FAILED", message: "Invalid request." } };
  }

  try {
    // Deliberately no `isCorrect` in the response — doc 09 §5.3's rule
    // against showing a running score during Stage 2.
    await useCase.execute({ attemptId, userId, ...parsed.data });
    return { status: 200, body: { received: true } };
  } catch (error) {
    if (error instanceof AttemptNotFoundError) return { status: 404, body: { error: "NOT_FOUND", message: error.message } };
    if (error instanceof AttemptNotOwnedError) return { status: 403, body: { error: "FORBIDDEN", message: error.message } };
    if (error instanceof AttemptAlreadyCompletedError) return { status: 409, body: { error: "CONFLICT", message: error.message } };
    if (error instanceof ItemAlreadyAnsweredError) return { status: 409, body: { error: "CONFLICT", message: error.message } };

    console.error("POST /api/v1/assessment-attempts/[id]/responses failed:", error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
    return { status: 500, body: { error: "INTERNAL", message: "Could not record your answer." } };
  }
}
