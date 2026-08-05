import { and, count, desc, eq, gte } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { tutorConversations, tutorMessages } from "@/modules/ai/infrastructure/db/tables/ai";
import type {
  TutorConversationRecord,
  TutorConversationRepositoryPort,
  TutorMessageRecord,
} from "@/modules/ai/application/ports/tutor-conversation-repository-port";

function toConversation(row: typeof tutorConversations.$inferSelect): TutorConversationRecord {
  return { id: row.id, userId: row.userId, lessonId: row.lessonId, startedAt: row.startedAt, lastMessageAt: row.lastMessageAt };
}

function toMessage(row: typeof tutorMessages.$inferSelect): TutorMessageRecord {
  return {
    id: row.id,
    conversationId: row.conversationId,
    role: row.role as TutorMessageRecord["role"],
    content: row.content,
    flagged: row.flagged,
    createdAt: row.createdAt,
  };
}

export class DrizzleTutorConversationAdapter implements TutorConversationRepositoryPort {
  async getOrCreateForUserAndLesson(userId: string, lessonId: string, now: Date): Promise<TutorConversationRecord> {
    const [inserted] = await getDb()
      .insert(tutorConversations)
      .values({ userId, lessonId, startedAt: now, lastMessageAt: now })
      .onConflictDoNothing({ target: [tutorConversations.userId, tutorConversations.lessonId] })
      .returning();

    if (inserted) return toConversation(inserted);

    const [existing] = await getDb()
      .select()
      .from(tutorConversations)
      .where(and(eq(tutorConversations.userId, userId), eq(tutorConversations.lessonId, lessonId)))
      .limit(1);
    if (!existing) throw new Error(`tutor_conversations row for (${userId}, ${lessonId}) unexpectedly missing after a conflicting insert.`);
    return toConversation(existing);
  }

  async listRecentMessages(conversationId: string, limit: number): Promise<TutorMessageRecord[]> {
    const rows = await getDb()
      .select()
      .from(tutorMessages)
      .where(eq(tutorMessages.conversationId, conversationId))
      .orderBy(desc(tutorMessages.createdAt))
      .limit(limit);

    return rows.map(toMessage).reverse();
  }

  async appendMessage(conversationId: string, role: "user" | "assistant", content: string, now: Date): Promise<TutorMessageRecord> {
    const [row] = await getDb().insert(tutorMessages).values({ conversationId, role, content, createdAt: now }).returning();
    return toMessage(row);
  }

  async touchLastMessageAt(conversationId: string, now: Date): Promise<void> {
    await getDb().update(tutorConversations).set({ lastMessageAt: now }).where(eq(tutorConversations.id, conversationId));
  }

  async countUserMessagesSince(userId: string, since: Date): Promise<number> {
    const [{ value }] = await getDb()
      .select({ value: count() })
      .from(tutorMessages)
      .innerJoin(tutorConversations, eq(tutorConversations.id, tutorMessages.conversationId))
      .where(and(eq(tutorConversations.userId, userId), eq(tutorMessages.role, "user"), gte(tutorMessages.createdAt, since)));

    return value;
  }

  async setMessageFlagged(messageId: number, userId: string, flagged: boolean): Promise<TutorMessageRecord | null> {
    const [owned] = await getDb()
      .select({ id: tutorMessages.id })
      .from(tutorMessages)
      .innerJoin(tutorConversations, eq(tutorConversations.id, tutorMessages.conversationId))
      .where(and(eq(tutorMessages.id, messageId), eq(tutorConversations.userId, userId)))
      .limit(1);
    if (!owned) return null;

    const [row] = await getDb().update(tutorMessages).set({ flagged }).where(eq(tutorMessages.id, messageId)).returning();
    return row ? toMessage(row) : null;
  }
}
