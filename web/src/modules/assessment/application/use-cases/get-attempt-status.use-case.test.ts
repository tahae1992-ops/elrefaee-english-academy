import { describe, expect, it, vi } from "vitest";
import { GetAttemptStatusUseCase } from "./get-attempt-status.use-case";
import { AttemptNotFoundError } from "./submit-response.use-case";
import type { AttemptRecord, AttemptRepositoryPort } from "@/modules/assessment/application/ports/attempt-repository-port";
import type { ItemBankPort } from "@/modules/assessment/application/ports/item-bank-port";
import type { ResultRepositoryPort } from "@/modules/assessment/application/ports/result-repository-port";
import type { CheckpointResultRepositoryPort } from "@/modules/assessment/application/ports/checkpoint-result-repository-port";
import type { CertificationResultRepositoryPort } from "@/modules/assessment/application/ports/certification-result-repository-port";

function fakeAttempt(overrides: Partial<AttemptRecord> = {}): AttemptRecord {
  return { id: "attempt-1", userId: "user-1", blueprintId: "blueprint-1", status: "completed", assembledItems: [], ...overrides };
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
    getResponses: vi.fn(),
    markCompleted: vi.fn(),
    ...overrides,
  };
}

function fakeCertificationResults(overrides: Partial<CertificationResultRepositoryPort> = {}): CertificationResultRepositoryPort {
  return { save: vi.fn(), findByAttemptId: vi.fn(), findHistoryByUserAndLevel: vi.fn(), ...overrides };
}

describe("GetAttemptStatusUseCase", () => {
  it("returns the placement result for a placement-kind attempt", async () => {
    const itemBank = fakeItemBank({
      getBlueprintMeta: vi.fn().mockResolvedValue({ kind: "placement", unitId: null, cefrLevel: null, academyId: "academy-1", passThresholdPercent: 0.7 }),
    });
    const attempts = fakeAttempts();
    const results: ResultRepositoryPort = {
      save: vi.fn(),
      findByAttemptId: vi.fn().mockResolvedValue({ id: "r1", attemptId: "attempt-1", userId: "user-1", skillLevels: { grammar: "b1" }, overallLevel: "b1", createdAt: new Date() }),
    };
    const checkpointResults: CheckpointResultRepositoryPort = { save: vi.fn(), findByAttemptId: vi.fn(), findPassedUnitIds: vi.fn() };
    const certificationResults = fakeCertificationResults();

    const status = await new GetAttemptStatusUseCase(attempts, itemBank, results, checkpointResults, certificationResults).execute("attempt-1", "user-1");

    expect(status).toEqual({ status: "completed", kind: "placement", result: { skillLevels: { grammar: "b1" }, overallLevel: "b1" } });
    expect(checkpointResults.findByAttemptId).not.toHaveBeenCalled();
    expect(certificationResults.findByAttemptId).not.toHaveBeenCalled();
  });

  it("returns the checkpoint result for a unit_checkpoint-kind attempt", async () => {
    const itemBank = fakeItemBank({
      getBlueprintMeta: vi.fn().mockResolvedValue({ kind: "unit_checkpoint", unitId: "unit-1", cefrLevel: null, academyId: "academy-1", passThresholdPercent: 0.7 }),
    });
    const attempts = fakeAttempts();
    const results: ResultRepositoryPort = { save: vi.fn(), findByAttemptId: vi.fn() };
    const checkpointResults: CheckpointResultRepositoryPort = {
      save: vi.fn(),
      findByAttemptId: vi.fn().mockResolvedValue({ id: "cr1", attemptId: "attempt-1", userId: "user-1", unitId: "unit-1", scorePercent: 83, passed: true, skillBreakdown: {}, createdAt: new Date() }),
      findPassedUnitIds: vi.fn(),
    };
    const certificationResults = fakeCertificationResults();

    const status = await new GetAttemptStatusUseCase(attempts, itemBank, results, checkpointResults, certificationResults).execute("attempt-1", "user-1");

    expect(status).toEqual({ status: "completed", kind: "unit_checkpoint", result: { scorePercent: 83, passed: true, skillBreakdown: {} } });
    expect(results.findByAttemptId).not.toHaveBeenCalled();
  });

  it("returns the certification result for a certification_exam-kind attempt", async () => {
    const itemBank = fakeItemBank({
      getBlueprintMeta: vi.fn().mockResolvedValue({ kind: "certification_exam", unitId: null, cefrLevel: "a1", academyId: "academy-1", passThresholdPercent: 0.7 }),
    });
    const attempts = fakeAttempts();
    const results: ResultRepositoryPort = { save: vi.fn(), findByAttemptId: vi.fn() };
    const checkpointResults: CheckpointResultRepositoryPort = { save: vi.fn(), findByAttemptId: vi.fn(), findPassedUnitIds: vi.fn() };
    const certificationResults = fakeCertificationResults({
      findByAttemptId: vi.fn().mockResolvedValue({
        id: "cert-r1",
        attemptId: "attempt-1",
        userId: "user-1",
        cefrLevel: "a1",
        scorePercent: 89,
        passed: true,
        skillBreakdown: {},
        pendingReviewCount: 1,
        createdAt: new Date(),
      }),
    });

    const status = await new GetAttemptStatusUseCase(attempts, itemBank, results, checkpointResults, certificationResults).execute("attempt-1", "user-1");

    expect(status).toEqual({
      status: "completed",
      kind: "certification_exam",
      result: { scorePercent: 89, passed: true, skillBreakdown: {}, pendingReviewCount: 1 },
    });
    expect(results.findByAttemptId).not.toHaveBeenCalled();
    expect(checkpointResults.findByAttemptId).not.toHaveBeenCalled();
  });

  it("throws AttemptNotFoundError when the attempt doesn't exist", async () => {
    const itemBank = fakeItemBank();
    const attempts = fakeAttempts({ findById: vi.fn().mockResolvedValue(null) });
    const results: ResultRepositoryPort = { save: vi.fn(), findByAttemptId: vi.fn() };
    const checkpointResults: CheckpointResultRepositoryPort = { save: vi.fn(), findByAttemptId: vi.fn(), findPassedUnitIds: vi.fn() };
    const certificationResults = fakeCertificationResults();

    await expect(
      new GetAttemptStatusUseCase(attempts, itemBank, results, checkpointResults, certificationResults).execute("attempt-1", "user-1"),
    ).rejects.toThrow(AttemptNotFoundError);
  });
});
