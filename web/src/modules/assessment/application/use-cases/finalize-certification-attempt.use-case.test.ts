import { describe, expect, it, vi } from "vitest";
import { FinalizeCertificationAttemptUseCase } from "./finalize-certification-attempt.use-case";
import { CertificationBlueprintNotFoundError } from "./start-certification-attempt.use-case";
import { AttemptAlreadyCompletedError, AttemptNotOwnedError } from "./submit-response.use-case";
import { IssueCertificateUseCase } from "./issue-certificate.use-case";
import type { AttemptRecord, AttemptRepositoryPort } from "@/modules/assessment/application/ports/attempt-repository-port";
import type { ItemBankPort } from "@/modules/assessment/application/ports/item-bank-port";
import type { CertificationResultRepositoryPort } from "@/modules/assessment/application/ports/certification-result-repository-port";
import type { CertificateRepositoryPort } from "@/modules/assessment/application/ports/certificate-repository-port";
import type { CertificateTemplatePort } from "@/modules/assessment/application/ports/certificate-template-port";

function fakeAttempt(overrides: Partial<AttemptRecord> = {}): AttemptRecord {
  return { id: "attempt-1", userId: "user-1", blueprintId: "certification-blueprint-1", status: "in_progress", assembledItems: [], ...overrides };
}

function fakeItemBank(overrides: Partial<ItemBankPort> = {}): ItemBankPort {
  return {
    getBlueprint: vi.fn(),
    assembleItems: vi.fn(),
    getSpeakingPrompt: vi.fn(),
    getItemForScoring: vi.fn(),
    getCheckpointBlueprint: vi.fn(),
    assembleCheckpointItems: vi.fn(),
    getItemsByIds: vi.fn(),
    getBlueprintMeta: vi.fn().mockResolvedValue({ kind: "certification_exam", unitId: null, cefrLevel: "a1", academyId: "academy-1", passThresholdPercent: 0.7 }),
    getCertificationBlueprint: vi.fn(),
    assembleCertificationItems: vi.fn(),
    ...overrides,
  };
}

function fakeAttempts(overrides: Partial<AttemptRepositoryPort> = {}): AttemptRepositoryPort {
  return {
    create: vi.fn(),
    findById: vi.fn().mockResolvedValue(fakeAttempt()),
    findInProgressByUserAndBlueprint: vi.fn(),
    hasResponseForItem: vi.fn(),
    recordResponse: vi.fn(),
    getResponses: vi.fn().mockResolvedValue([
      { itemId: "g1", isCorrect: true },
      { itemId: "g2", isCorrect: true },
      { itemId: "g3", isCorrect: true },
      { itemId: "speak-1", isCorrect: null },
    ]),
    markCompleted: vi.fn(),
    ...overrides,
  };
}

function fakeCertificationResults(overrides: Partial<CertificationResultRepositoryPort> = {}): CertificationResultRepositoryPort {
  return {
    save: vi.fn().mockResolvedValue({
      id: "result-1",
      attemptId: "attempt-1",
      userId: "user-1",
      cefrLevel: "a1",
      scorePercent: 100,
      passed: true,
      skillBreakdown: {},
      pendingReviewCount: 1,
      createdAt: new Date(),
    }),
    findByAttemptId: vi.fn(),
    findHistoryByUserAndLevel: vi.fn(),
    ...overrides,
  };
}

function fakeCertificates(overrides: Partial<CertificateRepositoryPort> = {}): CertificateRepositoryPort {
  return {
    save: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    existsForUserAndLevel: vi.fn().mockResolvedValue(false),
    findByVerificationCode: vi.fn(),
    ...overrides,
  };
}

function fakeTemplates(overrides: Partial<CertificateTemplatePort> = {}): CertificateTemplatePort {
  return { getDisclaimerText: vi.fn().mockResolvedValue("Certifies {level} mastery."), ...overrides };
}

describe("FinalizeCertificationAttemptUseCase", () => {
  it("scores only graded responses, excludes free-text ones from the count, and issues a certificate on a first pass", async () => {
    const itemBank = fakeItemBank({
      getItemForScoring: vi.fn().mockResolvedValue({ skill: "grammar", cefrLevel: "a1", itemType: "multiple_choice", scoringKey: null }),
    });
    const attempts = fakeAttempts();
    const certificationResults = fakeCertificationResults();
    const certificates = fakeCertificates();
    const issueCertificate = new IssueCertificateUseCase(certificates, fakeTemplates());

    const result = await new FinalizeCertificationAttemptUseCase(itemBank, attempts, certificationResults, certificates, issueCertificate).execute({
      attemptId: "attempt-1",
      userId: "user-1",
    });

    expect(result.scorePercent).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.pendingReviewCount).toBe(1);
    expect(result.cefrLevel).toBe("a1");
    expect(attempts.markCompleted).toHaveBeenCalledWith("attempt-1");
    expect(certificationResults.save).toHaveBeenCalledWith(expect.objectContaining({ pendingReviewCount: 1 }));
    expect(certificates.save).toHaveBeenCalledWith(expect.objectContaining({ userId: "user-1", cefrLevel: "a1", resultId: "result-1" }));
    expect(result.certificate).not.toBeNull();
  });

  it("does not issue a second certificate for a level the learner is already certified for", async () => {
    const itemBank = fakeItemBank({
      getItemForScoring: vi.fn().mockResolvedValue({ skill: "grammar", cefrLevel: "a1", itemType: "multiple_choice", scoringKey: null }),
    });
    const attempts = fakeAttempts();
    const certificationResults = fakeCertificationResults();
    const certificates = fakeCertificates({ existsForUserAndLevel: vi.fn().mockResolvedValue(true) });
    const issueCertificate = new IssueCertificateUseCase(certificates, fakeTemplates());

    const result = await new FinalizeCertificationAttemptUseCase(itemBank, attempts, certificationResults, certificates, issueCertificate).execute({
      attemptId: "attempt-1",
      userId: "user-1",
    });

    expect(result.passed).toBe(true);
    expect(certificates.save).not.toHaveBeenCalled();
    expect(result.certificate).toBeNull();
  });

  it("does not issue a certificate on a failing attempt", async () => {
    const itemBank = fakeItemBank({
      getItemForScoring: vi.fn().mockResolvedValue({ skill: "grammar", cefrLevel: "a1", itemType: "multiple_choice", scoringKey: null }),
    });
    const attempts = fakeAttempts({
      getResponses: vi.fn().mockResolvedValue([
        { itemId: "g1", isCorrect: false },
        { itemId: "g2", isCorrect: false },
      ]),
    });
    const certificationResults = fakeCertificationResults({
      save: vi.fn().mockResolvedValue({
        id: "result-1",
        attemptId: "attempt-1",
        userId: "user-1",
        cefrLevel: "a1",
        scorePercent: 0,
        passed: false,
        skillBreakdown: {},
        pendingReviewCount: 0,
        createdAt: new Date(),
      }),
    });
    const certificates = fakeCertificates();
    const issueCertificate = new IssueCertificateUseCase(certificates, fakeTemplates());

    const result = await new FinalizeCertificationAttemptUseCase(itemBank, attempts, certificationResults, certificates, issueCertificate).execute({
      attemptId: "attempt-1",
      userId: "user-1",
    });

    expect(result.passed).toBe(false);
    expect(certificates.save).not.toHaveBeenCalled();
    expect(result.certificate).toBeNull();
  });

  it("throws AttemptNotOwnedError rather than scoring another user's attempt", async () => {
    const itemBank = fakeItemBank();
    const attempts = fakeAttempts({ findById: vi.fn().mockResolvedValue(fakeAttempt({ userId: "someone-else" })) });
    const certificationResults = fakeCertificationResults();
    const certificates = fakeCertificates();
    const issueCertificate = new IssueCertificateUseCase(certificates, fakeTemplates());

    await expect(
      new FinalizeCertificationAttemptUseCase(itemBank, attempts, certificationResults, certificates, issueCertificate).execute({
        attemptId: "attempt-1",
        userId: "user-1",
      }),
    ).rejects.toThrow(AttemptNotOwnedError);
  });

  it("throws AttemptAlreadyCompletedError when the attempt is no longer in progress", async () => {
    const itemBank = fakeItemBank();
    const attempts = fakeAttempts({ findById: vi.fn().mockResolvedValue(fakeAttempt({ status: "completed" })) });
    const certificationResults = fakeCertificationResults();
    const certificates = fakeCertificates();
    const issueCertificate = new IssueCertificateUseCase(certificates, fakeTemplates());

    await expect(
      new FinalizeCertificationAttemptUseCase(itemBank, attempts, certificationResults, certificates, issueCertificate).execute({
        attemptId: "attempt-1",
        userId: "user-1",
      }),
    ).rejects.toThrow(AttemptAlreadyCompletedError);
  });

  it("throws CertificationBlueprintNotFoundError if the attempt's blueprint isn't a certification kind", async () => {
    const itemBank = fakeItemBank({
      getBlueprintMeta: vi.fn().mockResolvedValue({ kind: "unit_checkpoint", unitId: "unit-1", cefrLevel: null, academyId: "academy-1", passThresholdPercent: 0.7 }),
    });
    const attempts = fakeAttempts();
    const certificationResults = fakeCertificationResults();
    const certificates = fakeCertificates();
    const issueCertificate = new IssueCertificateUseCase(certificates, fakeTemplates());

    await expect(
      new FinalizeCertificationAttemptUseCase(itemBank, attempts, certificationResults, certificates, issueCertificate).execute({
        attemptId: "attempt-1",
        userId: "user-1",
      }),
    ).rejects.toThrow(CertificationBlueprintNotFoundError);
  });
});
