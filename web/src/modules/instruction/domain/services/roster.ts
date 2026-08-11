export type CefrLevel = "pre_a1" | "a1" | "a2" | "b1" | "b2" | "c1";

/**
 * Phase 21, Goal 2 — the teacher-facing read models. Deliberately no
 * "email" field: `identity.user_profiles` has no email column at all
 * (DDD §3.1 — email lives only in Supabase's own `auth.users`, which
 * this codebase never bulk-queries); `displayName` is the identifier
 * already used everywhere else a student is shown in this app
 * (TopNav, Dashboard), so it's the one used here too rather than
 * introducing a new bulk-PII lookup just for this screen.
 */

export type RosterStatus = "active" | "inactive";

export interface StudentRosterEntry {
  studentId: string;
  displayName: string;
  currentLevel: CefrLevel | null;
  progressPercentage: number | null;
  completedLessonsCount: number;
  averageScorePercentage: number | null;
  lastActivityAt: Date | null;
  status: RosterStatus;
}

export interface LessonProgressCounts {
  completed: number;
  inProgress: number;
  notStarted: number;
  total: number;
}

export interface TopicPerformance {
  lessonId: string;
  lessonTitle: string;
  averagePercentage: number;
}

export interface RecentActivityEntry {
  eventType: string;
  lessonId: string | null;
  createdAt: Date;
}

export interface RecentGradeEntry {
  gradeType: string;
  lessonId: string | null;
  score: number;
  maxScore: number;
  percentage: number;
  createdAt: Date;
}

export interface StudentDetail {
  studentId: string;
  displayName: string;
  currentLevel: CefrLevel | null;
  progressPercentage: number | null;
  lessons: LessonProgressCounts;
  averageScorePercentage: number | null;
  totalGrades: number;
  recentGrades: RecentGradeEntry[];
  recentActivity: RecentActivityEntry[];
  lastActivityAt: Date | null;
  weakAreas: TopicPerformance[];
  strongAreas: TopicPerformance[];
}

/**
 * A learner counts as "active" if any activity event landed in the
 * last 14 days — a plain, explainable threshold, not a tuned/opaque
 * one. Teachers see the exact last-activity timestamp too, so this
 * label is a convenience, not the only signal.
 */
const ACTIVE_WINDOW_DAYS = 14;

export function computeRosterStatus(lastActivityAt: Date | null, now: Date): RosterStatus {
  if (!lastActivityAt) return "inactive";
  const daysSince = (now.getTime() - lastActivityAt.getTime()) / (1000 * 60 * 60 * 24);
  return daysSince <= ACTIVE_WINDOW_DAYS ? "active" : "inactive";
}
