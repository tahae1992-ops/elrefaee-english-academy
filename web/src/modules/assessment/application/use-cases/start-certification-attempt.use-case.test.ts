import { describe, expect, it, vi } from "vitest";
import { CertificationBlueprintNotFoundError, CertificationCooldownError, StartCertificationAttemptUseCase } from "./start-certification-attempt.use-case";
import type { AssessmentItem, CertificationBlueprint, ItemBankPort } from "@/modules/assessment/application/ports/item-bank-port";
import type { AttemptRecord, AttemptRepositoryPort } from "@/modules/assessment/application/ports/attempt-repository-port";
import type { CertificationResultRepositoryPort } from "@/modules/assessment/application/ports/certification-result-repository-port";

const blueprint: CertificationBlueprint = {
  id: "certification-blueprint-1",
  academyId: "academy-1",
  cefrLevel: "a1",
  itemCount: 9,
  passThresholdPercent: 0.7,
  gradedSkills: ["listening", "reading", "grammar", "vocabulary"],
  timeLimitMinutes: 20,
  cooldownDays: 14,
  maxFailuresBeforeEscalation: 3,
};

function item(id: string): AssessmentItem {
  return { id, skill: "grammar", cefrLevel: "a1", itemType: "multiple_choice", prompt: {} };
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
    getBlueprintMeta: vi.fn(),
    getCertificationBlueprint: vi.fn().mockResolvedValue(blueprint),
    assembleCertificationItems: vi.fn().mockResolvedValue([item("i1"), item("i2")]),
    ...overrides,
  };
}

function fakeAttempts(overrides: Partial<AttemptRepositoryPort> = {}): AttemptRepositoryPort {
  return {
    create: vi.fn().mockResolvedValue({ id: "attempt-1", userId: "user-1", blueprintId: blueprint.id, status: "in_progress", assembledItems: ["i1", "i2"] } satisfies AttemptRecord),
    findById: vi.fn(),
    findInProgressByUserAndBlueprint: vi.fn().mockResolvedValue(null),
    hasResponseForItem: vi.fn(),
    recordResponse: vi.fn(),
    getResponses: vi.fn(),
    markCompleted: vi.fn(),
    ...overrides,
  };
}

function fakeCertificationResults(overrides: Partial<CertificationResultRepositoryPort> = {}): CertificationResultRepositoryPort {
  return { save: vi.fn(), findByAttemptId: vi.fn(), findHistoryByUserAndLevel: vi.fn().mockResolvedValue([]), ...overrides };
}

describe("StartCertificationAttemptUseCase", () => {
  it("assembles the level's certification items and creates a new attempt when there's no history", async () => {
    const itemBank = fakeItemBank();
    const attempts = fakeAttempts();
    const certificationResults = fakeCertificationResults();

    const result = await new StartCertificationAttemptUseCase(itemBank, attempts, certificationResults).execute({ userId: "user-1", cefrLevel: "a1" });

    expect(itemBank.assembleCertificationItems).toHaveBeenCalledWith("a1", 9);
    expect(attempts.create).toHaveBeenCalledWith({ userId: "user-1", blueprintId: blueprint.id, assembledItemIds: ["i1", "i2"] });
    expect(result).toEqual({ attemptId: "attempt-1", items: [item("i1"), item("i2")], timeLimitMinutes: 20 });
  });

  it("resumes an existing in-progress attempt instead of creating a duplicate", async () => {
    const existing: AttemptRecord = { id: "existing-attempt", userId: "user-1", blueprintId: blueprint.id, status: "in_progress", assembledItems: ["i1", "i2"] };
    const itemBank = fakeItemBank({ getItemsByIds: vi.fn().mockResolvedValue([item("i1"), item("i2")]) });
    const attempts = fakeAttempts({ findInProgressByUserAndBlueprint: vi.fn().mockResolvedValue(existing) });
    const certificationResults = fakeCertificationResults();

    const result = await new StartCertificationAttemptUseCase(itemBank, attempts, certificationResults).execute({ userId: "user-1", cefrLevel: "a1" });

    expect(attempts.create).not.toHaveBeenCalled();
    expect(certificationResults.findHistoryByUserAndLevel).not.toHaveBeenCalled();
    expect(result.attemptId).toBe("existing-attempt");
  });

  it("throws CertificationBlueprintNotFoundError when the level has no certification exam configured", async () => {
    const itemBank = fakeItemBank({ getCertificationBlueprint: vi.fn().mockResolvedValue(null) });
    const attempts = fakeAttempts();
    const certificationResults = fakeCertificationResults();

    await expect(
      new StartCertificationAttemptUseCase(itemBank, attempts, certificationResults).execute({ userId: "user-1", cefrLevel: "a1" }),
    ).rejects.toThrow(CertificationBlueprintNotFoundError);
  });

  it("throws CertificationCooldownError when the most recent attempt failed within the cooldown window", async () => {
    const itemBank = fakeItemBank();
    const attempts = fakeAttempts();
    const certificationResults = fakeCertificationResults({
      findHistoryByUserAndLevel: vi.fn().mockResolvedValue([{ passed: false, completedAt: new Date() }]),
    });

    await expect(
      new StartCertificationAttemptUseCase(itemBank, attempts, certificationResults).execute({ userId: "user-1", cefrLevel: "a1" }),
    ).rejects.toThrow(CertificationCooldownError);
    expect(attempts.create).not.toHaveBeenCalled();
  });

  it("allows a new attempt once the cooldown has elapsed", async () => {
    const itemBank = fakeItemBank();
    const attempts = fakeAttempts();
    const longAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
    const certificationResults = fakeCertificationResults({
      findHistoryByUserAndLevel: vi.fn().mockResolvedValue([{ passed: false, completedAt: longAgo }]),
    });

    const result = await new StartCertificationAttemptUseCase(itemBank, attempts, certificationResults).execute({ userId: "user-1", cefrLevel: "a1" });

    expect(result.attemptId).toBe("attempt-1");
  });
});
