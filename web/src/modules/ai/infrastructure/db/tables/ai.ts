import { sql } from "drizzle-orm";
import { bigint, boolean, index, integer, numeric, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { aiSchema } from "@/shared/infrastructure/db/schemas";
import { userProfiles } from "@/modules/identity/infrastructure/db/tables/identity";
import { lessons } from "@/modules/curriculum/infrastructure/db/tables/curriculum";

/**
 * AI Tutor slice — the first tables in the `ai` schema (declared empty
 * since Sprint 1). Built to DB Design §3.8's documented tables
 * (`prompt_templates`, `interactions`) exactly, plus two genuinely new
 * tables the doc explicitly calls for but never designs: §3.8's own
 * text states "full conversational content is retained only in a
 * separate, short-retention store" without specifying that store's
 * schema — `tutor_conversations`/`tutor_messages` fill that named gap,
 * same disclosed-addition pattern as `learning.exercise_attempts`
 * before it.
 *
 * `provider_configs` (DB Design §3.8's canary-rollout support table)
 * is deliberately not built — this slice ships one real provider
 * adapter, not a traffic-weighted rollout mechanism; SAD §7.2 frames
 * canary rollout as what happens when *swapping* providers, which
 * isn't in scope until a second adapter exists.
 */
export const promptTemplates = aiSchema.table(
  "prompt_templates",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    module: varchar("module", { length: 40 }).notNull(),
    version: integer("version").notNull(),
    templateBody: text("template_body").notNull(),
    createdBy: uuid("created_by").references(() => userProfiles.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("prompt_templates_module_version_unique").on(table.module, table.version)],
);

/**
 * SAD §7.4: "session-scoped conversation history stored server-side."
 * One ongoing thread per (learner, lesson) — lazily created on first
 * message, same pattern as `engagement.streaks`/`daily_goals` — rather
 * than a thread-picker UI no doc asks for; doc 08 §3.11's chat panel
 * always reopens the same conversation for that lesson.
 */
export const tutorConversations = aiSchema.table(
  "tutor_conversations",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfiles.id),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("tutor_conversations_user_lesson_unique").on(table.userId, table.lessonId)],
);

export const tutorMessages = aiSchema.table(
  "tutor_messages",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => tutorConversations.id),
    // 'user' | 'assistant' — enforced application-side only, matching this codebase's existing convention for similar small enums.
    role: varchar("role", { length: 20 }).notNull(),
    content: text("content").notNull(),
    // doc 08 §3.11's "[Flag for instructor]" learner-initiated action — distinct from the Gateway's own moderation flag on `ai.interactions`.
    flagged: boolean("flagged").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("tutor_messages_conversation_idx").on(table.conversationId, table.createdAt)],
);

/**
 * DB Design §3.8's `ai.interactions` — the Gateway's cost/latency/
 * safety log, built to the documented schema exactly. Deliberately
 * carries no prompt/response text (that lives in `tutor_messages`) —
 * this table is retained indefinitely for cost/audit purposes per the
 * doc's own stated privacy resolution.
 */
export const aiInteractions = aiSchema.table(
  "interactions",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    userId: uuid("user_id").references(() => userProfiles.id),
    module: varchar("module", { length: 40 }).notNull(),
    providerKey: varchar("provider_key", { length: 40 }).notNull(),
    promptTemplateId: uuid("prompt_template_id").references(() => promptTemplates.id),
    costUsd: numeric("cost_usd", { precision: 10, scale: 6, mode: "number" }).notNull(),
    latencyMs: integer("latency_ms").notNull(),
    flagged: boolean("flagged").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("ai_interactions_module_created_idx").on(table.module, table.createdAt)],
);
