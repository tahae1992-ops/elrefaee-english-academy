import type { CefrLevel } from "@/modules/assessment/domain/services/score-placement-attempt";

export interface SaveResultInput {
  attemptId: string;
  userId: string;
  skillLevels: Record<string, CefrLevel>;
  overallLevel: CefrLevel;
}

export interface ResultRecord extends SaveResultInput {
  id: string;
  createdAt: Date;
}

export interface ResultRepositoryPort {
  save(input: SaveResultInput): Promise<ResultRecord>;
  findByAttemptId(attemptId: string): Promise<ResultRecord | null>;
}
