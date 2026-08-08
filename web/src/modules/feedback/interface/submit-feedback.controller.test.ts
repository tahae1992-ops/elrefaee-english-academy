import { describe, expect, it, vi } from "vitest";
import { handleSubmitFeedback } from "./submit-feedback.controller";
import { FeedbackMessageInvalidError } from "@/modules/feedback/domain/services/validate-feedback-message";
import type { SubmitFeedbackUseCase } from "@/modules/feedback/application/use-cases/submit-feedback.use-case";

function fakeUseCase(execute: SubmitFeedbackUseCase["execute"]): SubmitFeedbackUseCase {
  return { execute } as unknown as SubmitFeedbackUseCase;
}

describe("handleSubmitFeedback", () => {
  it("returns 400 for a malformed request without calling the use case", async () => {
    const execute = vi.fn();
    const { status, body } = await handleSubmitFeedback(fakeUseCase(execute), "user-1", { category: "not-a-category", message: "hi" });

    expect(status).toBe(400);
    expect(body).toEqual({ error: "VALIDATION_FAILED", message: "Invalid request." });
    expect(execute).not.toHaveBeenCalled();
  });

  it("returns 400 for an empty message", async () => {
    const execute = vi.fn();
    const { status } = await handleSubmitFeedback(fakeUseCase(execute), "user-1", { category: "bug", message: "" });

    expect(status).toBe(400);
    expect(execute).not.toHaveBeenCalled();
  });

  it("returns 201 on success and forwards the userId from the caller, not the request body", async () => {
    const execute = vi.fn().mockResolvedValue(undefined);
    const { status, body } = await handleSubmitFeedback(fakeUseCase(execute), "user-1", {
      category: "suggestion",
      message: "Add dark mode to the exam screen.",
      pageUrl: "/exams/course-1/certification",
    });

    expect(status).toBe(201);
    expect(body).toEqual({ received: true });
    expect(execute).toHaveBeenCalledWith({
      userId: "user-1",
      category: "suggestion",
      message: "Add dark mode to the exam screen.",
      pageUrl: "/exams/course-1/certification",
    });
  });

  it("maps FeedbackMessageInvalidError (a defense-in-depth domain re-check) to 400", async () => {
    const execute = vi.fn().mockRejectedValue(new FeedbackMessageInvalidError());
    const { status, body } = await handleSubmitFeedback(fakeUseCase(execute), "user-1", { category: "bug", message: "valid at the Zod layer" });

    expect(status).toBe(400);
    expect(body).toEqual({ error: "VALIDATION_FAILED", message: new FeedbackMessageInvalidError().message });
  });
});
