import { getDb } from "@/shared/infrastructure/db/client";
import { auditLog } from "@/shared/infrastructure/db/tables/audit-log";
import type { AuditLogEntry, AuditLogPort } from "@/shared/application/ports/audit-log-port";

export class DrizzleAuditLogAdapter implements AuditLogPort {
  async record(entry: AuditLogEntry): Promise<void> {
    await getDb().insert(auditLog).values({
      actorId: entry.actorId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      after: entry.after,
    });
  }
}
