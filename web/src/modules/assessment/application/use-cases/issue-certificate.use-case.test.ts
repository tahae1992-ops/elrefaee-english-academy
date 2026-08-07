import { describe, expect, it, vi } from "vitest";
import { CertificateTemplateMissingError, IssueCertificateUseCase } from "./issue-certificate.use-case";
import type { CertificateRepositoryPort } from "@/modules/assessment/application/ports/certificate-repository-port";
import type { CertificateTemplatePort } from "@/modules/assessment/application/ports/certificate-template-port";

function fakeCertificates(overrides: Partial<CertificateRepositoryPort> = {}): CertificateRepositoryPort {
  return {
    save: vi.fn().mockResolvedValue({
      id: "cert-1",
      userId: "user-1",
      academyId: "academy-1",
      cefrLevel: "a1",
      resultId: "result-1",
      issuer: "Elrefaee English Academy",
      verificationCode: "ABCDEFGHJKMN",
      disclaimerText: "Certifies A1 mastery.",
      locale: "en",
      status: "active",
      issuedAt: new Date(),
    }),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    existsForUserAndLevel: vi.fn(),
    findByVerificationCode: vi.fn(),
    ...overrides,
  };
}

function fakeTemplates(overrides: Partial<CertificateTemplatePort> = {}): CertificateTemplatePort {
  return { getDisclaimerText: vi.fn().mockResolvedValue("Certifies {level} mastery."), ...overrides };
}

describe("IssueCertificateUseCase", () => {
  it("freezes the disclaimer template with the level interpolated, in English regardless of caller locale", async () => {
    const certificates = fakeCertificates();
    const templates = fakeTemplates();

    await new IssueCertificateUseCase(certificates, templates).execute({ userId: "user-1", academyId: "academy-1", cefrLevel: "a1", resultId: "result-1" });

    expect(templates.getDisclaimerText).toHaveBeenCalledWith("en");
    expect(certificates.save).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", academyId: "academy-1", cefrLevel: "a1", resultId: "result-1", disclaimerText: "Certifies A1 mastery.", locale: "en" }),
    );
  });

  it("throws CertificateTemplateMissingError when no disclaimer template exists for the issuance locale", async () => {
    const certificates = fakeCertificates();
    const templates = fakeTemplates({ getDisclaimerText: vi.fn().mockResolvedValue(null) });

    await expect(
      new IssueCertificateUseCase(certificates, templates).execute({ userId: "user-1", academyId: "academy-1", cefrLevel: "a1", resultId: "result-1" }),
    ).rejects.toThrow(CertificateTemplateMissingError);
    expect(certificates.save).not.toHaveBeenCalled();
  });

  it("retries with a fresh verification code on a save collision", async () => {
    const templates = fakeTemplates();
    let attemptCount = 0;
    const certificates = fakeCertificates({
      save: vi.fn().mockImplementation(() => {
        attemptCount += 1;
        if (attemptCount === 1) throw new Error("unique constraint violation");
        return Promise.resolve({
          id: "cert-1",
          userId: "user-1",
          academyId: "academy-1",
          cefrLevel: "a1",
          resultId: "result-1",
          issuer: "Elrefaee English Academy",
          verificationCode: "SOMEOTHERCODE",
          disclaimerText: "Certifies A1 mastery.",
          locale: "en",
          status: "active",
          issuedAt: new Date(),
        });
      }),
    });

    const result = await new IssueCertificateUseCase(certificates, templates).execute({
      userId: "user-1",
      academyId: "academy-1",
      cefrLevel: "a1",
      resultId: "result-1",
    });

    expect(attemptCount).toBe(2);
    expect(result.verificationCode).toBe("SOMEOTHERCODE");
  });
});
