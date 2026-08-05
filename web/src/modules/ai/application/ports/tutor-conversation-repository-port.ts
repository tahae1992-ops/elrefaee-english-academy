export interface TutorConversationRecord {
  id: string;
  userId: string;
  lessonId: string;
  startedAt: Date;
  lastMessageAt: Date;
}

export interface TutorMessageRecord {
  id: number;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  flagged: boolean;
  createdAt: Date;
}

export interface TutorConversationRepositoryPort {
  /** Idempotent — one ongoing conversation per (user, lesson), lazily created (mirrors `vocabulary_review_state`/`streaks`'s createInitial pattern). */
  getOrCreateForUserAndLesson(userId: string, lessonId: string, now: Date): Promise<TutorConversationRecord>;
  /** Oldest-first, capped at `limit` — SAD §7.4's "rolling window of the last N turns kept verbatim." */
  listRecentMessages(conversationId: string, limit: number): Promise<TutorMessageRecord[]>;
  appendMessage(conversationId: string, role: "user" | "assistant", content: string, now: Date): Promise<TutorMessageRecord>;
  touchLastMessageAt(conversationId: string, now: Date): Promise<void>;
  /** FR-12's "input length capped... to bound cost/abuse" extended to a per-day message count — SRS §6.4b's per-user AI rate limit. */
  countUserMessagesSince(userId: string, since: Date): Promise<number>;
  /** Ownership-checked — returns null if the message doesn't belong to this user, never flags someone else's message. */
  setMessageFlagged(messageId: number, userId: string, flagged: boolean): Promise<TutorMessageRecord | null>;
}
