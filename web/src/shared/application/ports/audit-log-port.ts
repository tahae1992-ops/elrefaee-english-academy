export interface AuditLogEntry {
  /** Null for a failed attempt — identity isn't established yet (API Spec §7.1). */
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  after?: Record<string, unknown>;
}

/**
 * DDD §5.6's immutable audit trail — API Spec §7.1 requires every
 * login attempt logged here; Phase 17's security audit extended this
 * to ownership-violation (403) events across every module, which is
 * why this port moved from identity's own application layer to
 * `shared` (SAD §4: a module's application/infrastructure is private
 * to that module, but `shared` is the deliberate common-utility
 * exception, same precedent as the Phase 14 rate limiter).
 */
export interface AuditLogPort {
  record(entry: AuditLogEntry): Promise<void>;
}
