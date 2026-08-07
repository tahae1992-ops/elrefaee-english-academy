import { describe, expect, it, vi } from "vitest";
import { CertificateNotFoundError, VerifyCertificateUseCase } from "./verify-certificate.use-case";
import type { CertificateRepositoryPort } from "@/modules/assessment/application/ports/certificate-repository-port";

function fakeCertificates(overrides: Partial<CertificateRepositoryPort> = {}): CertificateRepositoryPort {
  return {
    save: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    existsForUserAndLevel: vi.fn(),
    findByVerificationCode: vi.fn(),
    ...overrides,
  };
}

describe("VerifyCertificateUseCase", () => {
  it("returns the minimal-disclosure verification payload for an active certificate", async () => {
    const issuedAt = new Date("2026-08-01T00:00:00Z");
    const certificates = fakeCertificates({
      findByVerificationCode: vi.fn().mockResolvedValue({
        cefrLevel: "a1",
        issuer: "Elrefaee English Academy",
        issuedAt,
        disclaimerText: "Certifies A1 mastery.",
        status: "active",
        holderDisplayName: "Sara",
      }),
    });

    const result = await new VerifyCertificateUseCase(certificates).execute("ABCDEFGHJKMN");

    expect(result).toEqual({
      valid: true,
      cefrLevel: "a1",
      issuer: "Elrefaee English Academy",
      issuedAt,
      disclaimerText: "Certifies A1 mastery.",
      holderDisplayName: "Sara",
    });
  });

  it("returns valid:false with reason revoked for a revoked certificate, not a 404", async () => {
    const certificates = fakeCertificates({
      findByVerificationCode: vi.fn().mockResolvedValue({
        cefrLevel: "a1",
        issuer: "Elrefaee English Academy",
        issuedAt: new Date(),
        disclaimerText: "Certifies A1 mastery.",
        status: "revoked",
        holderDisplayName: "Sara",
      }),
    });

    const result = await new VerifyCertificateUseCase(certificates).execute("ABCDEFGHJKMN");

    expect(result).toEqual({ valid: false, reason: "revoked" });
  });

  it("throws CertificateNotFoundError for an unknown code (indistinguishable from any other invalid code)", async () => {
    const certificates = fakeCertificates({ findByVerificationCode: vi.fn().mockResolvedValue(null) });

    await expect(new VerifyCertificateUseCase(certificates).execute("NOPE")).rejects.toThrow(CertificateNotFoundError);
  });
});
