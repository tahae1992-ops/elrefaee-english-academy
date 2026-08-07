import type { CertificateRepositoryPort, CertificateRecord } from "@/modules/assessment/application/ports/certificate-repository-port";
import type { CertificateTemplatePort } from "@/modules/assessment/application/ports/certificate-template-port";
import type { CefrLevel } from "@/modules/assessment/domain/services/score-placement-attempt";
import { generateVerificationCode } from "@/modules/assessment/domain/services/generate-verification-code";

export interface IssueCertificateInput {
  userId: string;
  academyId: string;
  cefrLevel: CefrLevel;
  resultId: string;
}

export class CertificateTemplateMissingError extends Error {
  constructor() {
    super("No certificate disclaimer template is configured for this locale.");
    this.name = "CertificateTemplateMissingError";
  }
}

const ISSUANCE_LOCALE = "en";
const MAX_CODE_COLLISION_RETRIES = 3;

/**
 * Master Blueprint §8 / SRS FR-11's issuance side effect, split out
 * from FinalizeCertificationAttemptUseCase as its own use-case per
 * SAD §17's documented `CertificationService.issueCertificate`
 * public interface. Always issues in English regardless of the
 * learner's app locale (a1 MVP simplification, not an oversight --
 * see the report for why) -- shared.certificate_templates already
 * has an Arabic row ready for whenever locale-aware issuance and its
 * own legal sign-off land together.
 */
export class IssueCertificateUseCase {
  constructor(
    private readonly certificates: CertificateRepositoryPort,
    private readonly templates: CertificateTemplatePort,
  ) {}

  async execute(input: IssueCertificateInput): Promise<CertificateRecord> {
    const template = await this.templates.getDisclaimerText(ISSUANCE_LOCALE);
    if (!template) throw new CertificateTemplateMissingError();

    const disclaimerText = template.replace("{level}", input.cefrLevel.toUpperCase());

    let lastError: unknown;
    for (let attempt = 0; attempt < MAX_CODE_COLLISION_RETRIES; attempt++) {
      try {
        return await this.certificates.save({
          userId: input.userId,
          academyId: input.academyId,
          cefrLevel: input.cefrLevel,
          resultId: input.resultId,
          verificationCode: generateVerificationCode(),
          disclaimerText,
          locale: ISSUANCE_LOCALE,
        });
      } catch (error) {
        // A verification-code collision is astronomically unlikely
        // (32^12 keyspace) but not provably impossible -- retry with
        // a freshly generated code rather than surfacing a 500 for a
        // transient uniqueness conflict the caller can't fix.
        lastError = error;
      }
    }
    throw lastError;
  }
}
