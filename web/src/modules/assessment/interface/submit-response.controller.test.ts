import { describe, expect, it, vi } from "vitest";
import { handleSubmitResponse } from "./submit-response.controller";
import { AttemptAlreadyCompletedError, AttemptNotFoundError, AttemptNotOwnedError, ItemAlreadyAnsweredError } from "@/modules/assessment/application/use-cases/submit-response.use-case";
import type { SubmitResponseUseCase } from "@/modules/assessment/application/use-cases/submit-response.use-case";

function fakeUseCase(execute: SubmitResponseUseCase["execute"]): SubmitResponseUseCase {
  return { execute } as unknown as SubmitResponseUseCase;
}

const validItemId = "11111111-1111-4111-8111-111111111111";

describe("handleSubmitResponse", () => {
  it("returns 400 for a malformed request without calling the use case", async () => {
    const execute = vi.fn();
    const { status, body } = await handleSubmitResponse(fakeUseCase(execute), "user-1", "attempt-1", { itemId: "not-a-uuid" });

    expect(status).toBe(400);
    expect(body).toEqual({ error: "VALIDATION_FAILED", message: "Invalid request." });
    expect(execute).not.toHaveBeenCalled();
  });

  it("returns 200 { received: true } on success, never the item's correctness (no running score)", async () => {
    const execute = vi.fn().mockResolvedValue(undefined);
    const { status, body } = await handleSubmitResponse(fakeUseCase(execute), "user-1", "attempt-1", {
      itemId: validItemId,
      responsePayload: { selectedOptionIndex: 0 },
    });

    expect(status).toBe(200);
    expect(body).toEqual({ received: true });
  });

  it("returns the use case's isCorrect/explanation payload when revealCorrectness is true (Unit Checkpoint)", async () => {
    const execute = vi.fn().mockResolvedValue({ isCorrect: true, explanation: "Use 'is' with she/he/it." });
    const { status, body } = await handleSubmitResponse(
      fakeUseCase(execute),
      "user-1",
      "attempt-1",
      { itemId: validItemId, responsePayload: { selectedOptionIndex: 0 } },
      true,
    );

    expect(status).toBe(200);
    expect(body).toEqual({ isCorrect: true, explanation: "Use 'is' with she/he/it." });
    expect(execute).toHaveBeenCalledWith(expect.objectContaining({ revealCorrectness: true }));
  });

  it.each([
    [AttemptNotFoundError, 404],
    [AttemptNotOwnedError, 403],
    [AttemptAlreadyCompletedError, 409],
    [ItemAlreadyAnsweredError, 409],
  ] as const)("maps %s to HTTP %i", async (ErrorClass, expectedStatus) => {
    const execute = vi.fn().mockRejectedValue(new ErrorClass());
    const { status } = await handleSubmitResponse(fakeUseCase(execute), "user-1", "attempt-1", {
      itemId: validItemId,
      responsePayload: {},
    });

    expect(status).toBe(expectedStatus);
  });
});
