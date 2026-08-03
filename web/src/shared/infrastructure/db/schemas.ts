import { pgSchema } from "drizzle-orm/pg-core";

/**
 * The 11 bounded-context schemas (DDD §1, SAD §9) — one physical Postgres
 * database, schema-per-context, so that a future microservice extraction
 * (SAD §28) is a "move this schema to its own database" operation, not a
 * rewrite. Sprint 1 creates the schemas only; each context's tables land
 * in the sprint that owns them (Sprint Plan §2/§6).
 */
export const identitySchema = pgSchema("identity");
export const academySchema = pgSchema("academy");
export const curriculumSchema = pgSchema("curriculum");
export const assessmentSchema = pgSchema("assessment");
export const learningSchema = pgSchema("learning");
export const instructionSchema = pgSchema("instruction");
export const engagementSchema = pgSchema("engagement");
export const aiSchema = pgSchema("ai");
export const notificationsSchema = pgSchema("notifications");
export const billingSchema = pgSchema("billing");
export const sharedSchema = pgSchema("shared");
