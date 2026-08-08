export const FEEDBACK_MESSAGE_MIN_LENGTH = 1;
export const FEEDBACK_MESSAGE_MAX_LENGTH = 2000;

export class FeedbackMessageInvalidError extends Error {
  constructor() {
    super(`Feedback message must be between ${FEEDBACK_MESSAGE_MIN_LENGTH} and ${FEEDBACK_MESSAGE_MAX_LENGTH} characters.`);
    this.name = "FeedbackMessageInvalidError";
  }
}

/** Phase 19's "feedback instrumentation" — the one business rule involved: a non-empty, bounded-length message. Everything else (category enum, auth) is validated at the Interface layer's own boundary. */
export function validateFeedbackMessage(message: string): string {
  const trimmed = message.trim();
  if (trimmed.length < FEEDBACK_MESSAGE_MIN_LENGTH || trimmed.length > FEEDBACK_MESSAGE_MAX_LENGTH) {
    throw new FeedbackMessageInvalidError();
  }
  return trimmed;
}
