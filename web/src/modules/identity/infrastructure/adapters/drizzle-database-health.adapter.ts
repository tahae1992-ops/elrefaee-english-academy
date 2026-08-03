import { sql } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import type { DatabaseHealthPort } from "@/modules/identity/application/ports/database-health-port";

/**
 * Infrastructure layer — the concrete implementation of the
 * DatabaseHealthPort, using the shared Postgres connection (SAD §6.1's
 * repository-pattern rule: Application code never imports Drizzle
 * directly, only this adapter does).
 */
export class DrizzleDatabaseHealthAdapter implements DatabaseHealthPort {
  async ping(): Promise<boolean> {
    try {
      await getDb().execute(sql`select 1`);
      return true;
    } catch {
      // A connectivity failure is an expected, handled outcome here, not
      // an exception to propagate — the use case (Application layer)
      // decides what an unreachable database *means* for the response.
      return false;
    }
  }
}
