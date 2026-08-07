import { createDrizzleAuditLogAdapter } from "@/composition-root";

/**
 * Phase 17 security audit finding: ownership-violation (403) events
 * were invisible to both the audit trail and Sentry -- every gate
 * that correctly blocked access still left no trace that someone
 * probed another user's resource id. Cross-module orchestration
 * lives here (Route Handler-adjacent, same "not inside either
 * module" pattern the submit route's own comment already
 * establishes), not inside a module's interface layer, since audit
 * logging is a cross-cutting concern no single module owns.
 */
export async function logAccessDenied(actorId: string, action: string, entityType: string, entityId: string): Promise<void> {
  try {
    await createDrizzleAuditLogAdapter().record({ actorId, action, entityType, entityId });
  } catch (error) {
    // The audit trail failing to write must never break the actual
    // request -- the 403 the caller already decided on still applies.
    console.error(`Failed to audit-log access-denied event (${action}):`, error);
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
  }
}
