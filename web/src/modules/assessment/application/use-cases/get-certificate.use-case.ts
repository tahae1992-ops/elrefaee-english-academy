import type { CertificateRecord, CertificateRepositoryPort } from "@/modules/assessment/application/ports/certificate-repository-port";

export class CertificateNotFoundOrNotOwnedError extends Error {
  constructor() {
    super("Certificate not found.");
    this.name = "CertificateNotFoundOrNotOwnedError";
  }
}

/** API Spec §6.6's `GET /certificates/{id}` -- owner-only; a certificate belonging to another user is reported identically to a nonexistent one (same not-found-vs-not-owned discipline as attempts). */
export class GetCertificateUseCase {
  constructor(private readonly certificates: CertificateRepositoryPort) {}

  async execute(id: string, userId: string): Promise<CertificateRecord> {
    const certificate = await this.certificates.findById(id);
    if (!certificate || certificate.userId !== userId) throw new CertificateNotFoundOrNotOwnedError();
    return certificate;
  }
}
