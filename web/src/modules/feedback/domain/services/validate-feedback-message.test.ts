import { describe, expect, it } from "vitest";
import { FeedbackMessageInvalidError, validateFeedbackMessage } from "./validate-feedback-message";

describe("validateFeedbackMessage", () => {
  it("returns the trimmed message when valid", () => {
    expect(validateFeedbackMessage("  Found a bug  ")).toBe("Found a bug");
  });

  it("throws on an empty message", () => {
    expect(() => validateFeedbackMessage("")).toThrow(FeedbackMessageInvalidError);
  });

  it("throws on a whitespace-only message", () => {
    expect(() => validateFeedbackMessage("   ")).toThrow(FeedbackMessageInvalidError);
  });

  it("throws on a message over the max length", () => {
    expect(() => validateFeedbackMessage("a".repeat(2001))).toThrow(FeedbackMessageInvalidError);
  });

  it("accepts a message at exactly the max length", () => {
    const message = "a".repeat(2000);
    expect(validateFeedbackMessage(message)).toBe(message);
  });
});
