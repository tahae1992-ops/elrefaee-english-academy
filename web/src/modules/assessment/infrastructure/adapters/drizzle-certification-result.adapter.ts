import { and, eq } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { certificationResults, attempts } from "@/modules/assessment/infrastructure/db/tables/assessment";
import type { SkillBreakdownEntry } from "@/modules/assessment/domain/services/score-checkpoint-attempt";
import type { CefrLevel } from "@/modules/assessment/domain/services/score-placement-attempt";
import type {
  CertificationAttemptHistoryEntry,
  CertificationResultRecord,
  CertificationResultRepositoryPort,
  SaveCertificationResultInput,
} from "@/modules/assessment/application/ports/certification-result-repository-port";

function toRecord(row: typeof certificationResults.$inferSelect): CertificationResultRecord {
  return {
    id: row.id,
    attemptId: row.attemptId,
    userId: row.userId,
    cefrLevel: row.cefrLevel,
    scorePercent: row.scorePercent,
    passed: row.passed,
    skillBreakdown: row.skillBreakdown as Record<string, SkillBreakdownEntry>,
    pendingReviewCount: row.pendingReviewCount,
    createdAt: row.createdAt,
  };
}

export class DrizzleCertificationResultAdapter implements CertificationResultRepositoryPort {
  async save(input: SaveCertificationResultInput): Promise<CertificationResultRecord> {
    const [row] = await getDb()
      .insert(certificationResults)
      .values({
        attemptId: input.attemptId,
        userId: input.userId,
        cefrLevel: input.cefrLevel,
        scorePercent: input.scorePercent,
        passed: input.passed,
        skillBreakdown: input.skillBreakdown,
        pendingReviewCount: input.pendingReviewCount,
      })
      .returning();

    return toRecord(row);
  }

  async findByAttemptId(attemptId: string): Promise<CertificationResultRecord | null> {
    const [row] = await getDb().select().from(certificationResults).where(eq(certificationResults.attemptId, attemptId)).limit(1);
    return row ? toRecord(row) : null;
  }

  async findHistoryByUserAndLevel(userId: string, cefrLevel: CefrLevel): Promise<CertificationAttemptHistoryEntry[]> {
    // completedAt comes from the attempt, not created_at on the result
    // row (which is written at the same moment in practice, but the
    // attempt's own completedAt is the authoritative timestamp).
    const rows = await getDb()
      .select({ passed: certificationResults.passed, completedAt: attempts.completedAt })
      .from(certificationResults)
      .innerJoin(attempts, eq(attempts.id, certificationResults.attemptId))
      .where(and(eq(certificationResults.userId, userId), eq(certificationResults.cefrLevel, cefrLevel)));

    return rows.map((row) => ({ passed: row.passed, completedAt: row.completedAt as Date }));
  }
}
