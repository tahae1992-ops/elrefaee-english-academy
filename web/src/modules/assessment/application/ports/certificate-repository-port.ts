import type { CefrLevel } from "@/modules/assessment/domain/services/score-placement-attempt";

export interface SaveCertificateInput {
  userId: string;
  academyId: string;
  cefrLevel: CefrLevel;
  resultId: string;
  verificationCode: string;
  disclaimerText: string;
  locale: string;
}

export interface CertificateRecord extends SaveCertificateInput {
  id: string;
  issuer: string;
  status: "active" | "revoked";
  issuedAt: Date;
}

/** API Spec §7.4's public verification response -- deliberately minimal disclosure, no email/user id. */
export interface CertificateVerificationRecord {
  cefrLevel: CefrLevel;
  issuer: string;
  issuedAt: Date;
  disclaimerText: string;
  status: "active" | "revoked";
  holderDisplayName: string;
}

export interface CertificateRepositoryPort {
  save(input: SaveCertificateInput): Promise<CertificateRecord>;
  findById(id: string): Promise<CertificateRecord | null>;
  findByUserId(userId: string): Promise<CertificateRecord[]>;
  /** Re-certification policy (PRD §15 item 2, resolved for MVP as "first pass is permanent" -- see FinalizeCertificationAttemptUseCase): a certificate already exists for this level means a later pass doesn't reissue one. */
  existsForUserAndLevel(userId: string, cefrLevel: CefrLevel): Promise<boolean>;
  /** The public, unauthenticated verification endpoint's read path (SRS FR-11 / API Spec §7.4) -- joins through to the holder's display name only, never the full profile. */
  findByVerificationCode(code: string): Promise<CertificateVerificationRecord | null>;
}
