import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { certificates } from "@/modules/assessment/infrastructure/db/tables/assessment";
import { userProfiles } from "@/modules/identity/infrastructure/db/tables/identity";
import type {
  CertificateRecord,
  CertificateRepositoryPort,
  CertificateVerificationRecord,
  SaveCertificateInput,
} from "@/modules/assessment/application/ports/certificate-repository-port";

function toRecord(row: typeof certificates.$inferSelect): CertificateRecord {
  return {
    id: row.id,
    userId: row.userId,
    academyId: row.academyId,
    cefrLevel: row.cefrLevel,
    resultId: row.resultId,
    issuer: row.issuer,
    verificationCode: row.verificationCode,
    disclaimerText: row.disclaimerText,
    locale: row.locale,
    status: row.status as CertificateRecord["status"],
    issuedAt: row.issuedAt,
  };
}

export class DrizzleCertificateAdapter implements CertificateRepositoryPort {
  async save(input: SaveCertificateInput): Promise<CertificateRecord> {
    const [row] = await getDb()
      .insert(certificates)
      .values({
        userId: input.userId,
        academyId: input.academyId,
        cefrLevel: input.cefrLevel,
        resultId: input.resultId,
        verificationCode: input.verificationCode,
        disclaimerText: input.disclaimerText,
        locale: input.locale,
      })
      .returning();

    return toRecord(row);
  }

  async findById(id: string): Promise<CertificateRecord | null> {
    const [row] = await getDb().select().from(certificates).where(eq(certificates.id, id)).limit(1);
    return row ? toRecord(row) : null;
  }

  async findByUserId(userId: string): Promise<CertificateRecord[]> {
    const rows = await getDb().select().from(certificates).where(eq(certificates.userId, userId)).orderBy(desc(certificates.issuedAt));
    return rows.map(toRecord);
  }

  async existsForUserAndLevel(userId: string, cefrLevel: SaveCertificateInput["cefrLevel"]): Promise<boolean> {
    const [row] = await getDb()
      .select({ id: certificates.id })
      .from(certificates)
      .where(and(eq(certificates.userId, userId), eq(certificates.cefrLevel, cefrLevel)))
      .limit(1);
    return row !== undefined;
  }

  async findByVerificationCode(code: string): Promise<CertificateVerificationRecord | null> {
    // Joined here (rather than a second lookup) since the public
    // verification endpoint needs the holder's display name and
    // nothing else from their profile -- one round trip, minimal
    // disclosure by construction (no email/user id ever selected).
    const [row] = await getDb()
      .select({
        cefrLevel: certificates.cefrLevel,
        issuer: certificates.issuer,
        issuedAt: certificates.issuedAt,
        disclaimerText: certificates.disclaimerText,
        status: certificates.status,
        holderDisplayName: userProfiles.displayName,
      })
      .from(certificates)
      .innerJoin(userProfiles, eq(userProfiles.id, certificates.userId))
      .where(eq(certificates.verificationCode, code))
      .limit(1);

    if (!row) return null;
    return {
      cefrLevel: row.cefrLevel,
      issuer: row.issuer,
      issuedAt: row.issuedAt,
      disclaimerText: row.disclaimerText,
      status: row.status as "active" | "revoked",
      holderDisplayName: row.holderDisplayName,
    };
  }
}
