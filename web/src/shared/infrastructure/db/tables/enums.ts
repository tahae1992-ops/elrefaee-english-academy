import { sharedSchema } from "@/shared/infrastructure/db/schemas";

/**
 * DDD §2's shared domain enums — "defined once, reused everywhere." A
 * Postgres enum type is schema-scoped exactly like a table, so this
 * lives under `shared` rather than being redeclared per bounded
 * context: a `cefr_level` typo stays a compile-time error everywhere
 * it's used (identity now; curriculum, assessment, learning later),
 * not just in whichever module happened to declare it first.
 */
export const cefrLevel = sharedSchema.enum("cefr_level", [
  "pre_a1",
  "a1",
  "a2",
  "b1",
  "b2",
  "c1",
]);
