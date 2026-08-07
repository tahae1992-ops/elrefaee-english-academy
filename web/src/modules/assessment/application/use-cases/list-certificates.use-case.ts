import type { CertificateRecord, CertificateRepositoryPort } from "@/modules/assessment/application/ports/certificate-repository-port";

/** API Spec §6.6's `GET /certificates` -- the learner's own certificates only. */
export class ListCertificatesUseCase {
  constructor(private readonly certificates: CertificateRepositoryPort) {}

  async execute(userId: string): Promise<CertificateRecord[]> {
    return this.certificates.findByUserId(userId);
  }
}
