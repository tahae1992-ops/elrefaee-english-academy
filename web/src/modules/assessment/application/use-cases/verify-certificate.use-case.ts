import type { CertificateRepositoryPort, CertificateVerificationRecord } from "@/modules/assessment/application/ports/certificate-repository-port";

export type VerifyCertificateResult =
  | ({ valid: true } & Omit<CertificateVerificationRecord, "status">)
  | { valid: false; reason: "revoked" };

export class CertificateNotFoundError extends Error {
  constructor() {
    super("No certificate exists for this verification code.");
    this.name = "CertificateNotFoundError";
  }
}

/**
 * API Spec §7.4's public, unauthenticated `GET
 * /certificates/verify/{code}`. An unknown code and a genuinely
 * invalid one are both 404s (via CertificateNotFoundError) --
 * deliberately indistinguishable from each other at the response
 * level, to avoid leaking which codes are "almost valid" to an
 * enumeration attempt. A revoked certificate is different: the code
 * did exist, so it returns 200 { valid: false, reason: "revoked" },
 * not a 404.
 */
export class VerifyCertificateUseCase {
  constructor(private readonly certificates: CertificateRepositoryPort) {}

  async execute(code: string): Promise<VerifyCertificateResult> {
    const record = await this.certificates.findByVerificationCode(code);
    if (!record) throw new CertificateNotFoundError();

    if (record.status === "revoked") {
      return { valid: false, reason: "revoked" };
    }

    return {
      valid: true,
      cefrLevel: record.cefrLevel,
      issuer: record.issuer,
      issuedAt: record.issuedAt,
      disclaimerText: record.disclaimerText,
      holderDisplayName: record.holderDisplayName,
    };
  }
}
