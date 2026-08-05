import { createHash } from "node:crypto";

/**
 * Derives a stable, UUID-formatted idempotency key from an arbitrary
 * seed string — used to award XP for activities that can be safely
 * re-triggered (e.g. revisiting an already-completed lesson, retrying
 * an exercise already answered correctly once) without re-awarding XP
 * a second time. `xp_transactions.source_event_id` is a `uuid` column;
 * Postgres accepts any correctly-hyphenated 32-hex-digit string
 * regardless of RFC version/variant bits, so a deterministic hash
 * formatted this way is a valid, storable idempotency key — this is
 * not a security-sensitive hash, so SHA-256's collision resistance is
 * far more than the requirement.
 */
export function deterministicEventId(seed: string): string {
  const hex = createHash("sha256").update(seed).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
