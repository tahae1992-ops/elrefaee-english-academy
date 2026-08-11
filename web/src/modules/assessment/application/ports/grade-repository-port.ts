export type GradeType = "exercise" | "quiz" | "lesson" | "assessment";

export interface RecordGradeInput {
  userId: string;
  gradeType: GradeType;
  /** The exercise/quiz-block/lesson content_item id this grade is for. */
  referenceId: string;
  lessonId?: string;
  score: number;
  maxScore: number;
}

export interface Grade extends RecordGradeInput {
  id: string;
  percentage: number;
  attemptNumber: number;
  createdAt: Date;
}

export interface StudentGradeSummary {
  averagePercentage: number | null;
  totalGrades: number;
  recentGrades: Grade[];
}

/**
 * Phase 21 — the real gradebook Goal 2 asked for, distinct from (and
 * fed by) exercise_attempts/checkpoint_results — those record *what
 * happened*, this is the durable, teacher-facing *scored outcome*.
 * Students never get a write path here (no `update`/`delete` in this
 * port at all) — only a teacher-edit flow, if one is ever built, would
 * add one, and it would go through `assessment.grade_overrides` for
 * the audit trail, never a silent update.
 */
export interface GradeRepositoryPort {
  /** attemptNumber is derived server-side (count of this user's prior grades for this referenceId, + 1) — never client-supplied. */
  record(input: RecordGradeInput): Promise<Grade>;
  listRecentForUser(userId: string, limit: number): Promise<Grade[]>;
  getSummaryForUser(userId: string): Promise<StudentGradeSummary>;
  /** Teacher roster's "average score" column across a whole roster in one query. */
  getAveragePercentageForUsers(userIds: string[]): Promise<Map<string, number>>;
}
