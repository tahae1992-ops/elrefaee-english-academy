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
 * login attempt (success and failure) logged here.
 */
export interface AuditLogPort {
  record(entry: AuditLogEntry): Promise<void>;
}
