import { scoreCheckpointAttempt } from "@/modules/assessment/domain/services/score-checkpoint-attempt";
import type { ItemBankPort } from "@/modules/assessment/application/ports/item-bank-port";
import type { AttemptRepositoryPort } from "@/modules/assessment/application/ports/attempt-repository-port";
import type { CertificationResultRepositoryPort } from "@/modules/assessment/application/ports/certification-result-repository-port";
import type { CertificateRepositoryPort, CertificateRecord } from "@/modules/assessment/application/ports/certificate-repository-port";
import {
  AttemptAlreadyCompletedError,
  AttemptNotFoundError,
  AttemptNotOwnedError,
} from "@/modules/assessment/application/use-cases/submit-response.use-case";
import { CertificationBlueprintNotFoundError } from "@/modules/assessment/application/use-cases/start-certification-attempt.use-case";
import { IssueCertificateUseCase } from "@/modules/assessment/application/use-cases/issue-certificate.use-case";

export interface FinalizeCertificationAttemptInput {
  attemptId: string;
  userId: string;
}

export interface FinalizeCertificationAttemptResult {
  scorePercent: number;
  passed: boolean;
  skillBreakdown: Record<string, { correct: number; total: number }>;
  pendingReviewCount: number;
  cefrLevel: string;
  /** Only set when this pass issued a brand-new certificate -- null on a passing re-attempt after the level was already certified (re-certification policy, see issue-certificate.use-case.ts). */
  certificate: CertificateRecord | null;
}

/**
 * API Spec §8.1's sequence diagram: "If result.passed && level-end
 * blueprint -> CertificateIssued event." No real event bus exists at
 * this MVP scope (SAD's event-driven issuance is the target
 * architecture; this use-case calls IssueCertificateUseCase directly
 * in the same request as scoring, which is observably identical to a
 * same-process synchronous event handler -- the disclosed
 * simplification is "no message broker," not "no decoupling of
 * concerns," since issuance logic still lives in its own use-case).
 */
export class FinalizeCertificationAttemptUseCase {
  constructor(
    private readonly itemBank: ItemBankPort,
    private readonly attempts: AttemptRepositoryPort,
    private readonly certificationResults: CertificationResultRepositoryPort,
    private readonly certificates: CertificateRepositoryPort,
    private readonly issueCertificate: IssueCertificateUseCase,
  ) {}

  async execute(input: FinalizeCertificationAttemptInput): Promise<FinalizeCertificationAttemptResult> {
    const attempt = await this.attempts.findById(input.attemptId);
    if (!attempt) throw new AttemptNotFoundError();
    if (attempt.userId !== input.userId) throw new AttemptNotOwnedError();
    if (attempt.status !== "in_progress") throw new AttemptAlreadyCompletedError();

    const meta = await this.itemBank.getBlueprintMeta(attempt.blueprintId);
    if (!meta || meta.kind !== "certification_exam" || !meta.cefrLevel) throw new CertificationBlueprintNotFoundError();

    const responses = await this.attempts.getResponses(input.attemptId);
    const gradedResponses = responses.filter((response) => response.isCorrect !== null);
    const pendingReviewCount = responses.length - gradedResponses.length;

    const itemMetas = await Promise.all(gradedResponses.map((response) => this.itemBank.getItemForScoring(response.itemId)));

    const graded = [];
    for (let i = 0; i < gradedResponses.length; i++) {
      const itemMeta = itemMetas[i];
      if (!itemMeta) continue;
      graded.push({ skill: itemMeta.skill, isCorrect: gradedResponses[i].isCorrect as boolean });
    }

    const score = scoreCheckpointAttempt(graded, meta.passThresholdPercent);

    const result = await this.certificationResults.save({
      attemptId: input.attemptId,
      userId: input.userId,
      cefrLevel: meta.cefrLevel,
      scorePercent: score.scorePercent,
      passed: score.passed,
      skillBreakdown: score.skillBreakdown,
      pendingReviewCount,
    });
    await this.attempts.markCompleted(input.attemptId);

    let certificate: CertificateRecord | null = null;
    if (score.passed) {
      const alreadyCertified = await this.certificates.existsForUserAndLevel(input.userId, meta.cefrLevel);
      if (!alreadyCertified) {
        certificate = await this.issueCertificate.execute({
          userId: input.userId,
          academyId: meta.academyId,
          cefrLevel: meta.cefrLevel,
          resultId: result.id,
        });
      }
    }

    return { ...score, pendingReviewCount, cefrLevel: meta.cefrLevel, certificate };
  }
}
