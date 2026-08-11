import { and, avg, count, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/shared/infrastructure/db/client";
import { userProfiles } from "@/modules/identity/infrastructure/db/tables/identity";
import { enrollments, progressRecords, activityEvents } from "@/modules/learning/infrastructure/db/tables/learning";
import { grades } from "@/modules/assessment/infrastructure/db/tables/assessment";
import { units, lessons, contentItems } from "@/modules/curriculum/infrastructure/db/tables/curriculum";
import type { RosterRepositoryPort } from "@/modules/instruction/application/ports/roster-repository-port";
import {
  computeRosterStatus,
  type LessonProgressCounts,
  type RecentActivityEntry,
  type RecentGradeEntry,
  type StudentDetail,
  type StudentRosterEntry,
  type TopicPerformance,
} from "@/modules/instruction/domain/services/roster";

const RECENT_LIMIT = 15;
const TOPIC_LIMIT = 3;

async function getLessonCountsForCourse(courseId: string): Promise<number> {
  const [row] = await getDb()
    .select({ value: count() })
    .from(lessons)
    .innerJoin(units, eq(units.id, lessons.unitId))
    .where(eq(units.courseId, courseId));
  return row?.value ?? 0;
}

async function getProgressStatusCounts(userId: string, courseId: string): Promise<{ completed: number; inProgress: number }> {
  const rows = await getDb()
    .select({ status: progressRecords.status, value: count() })
    .from(progressRecords)
    .innerJoin(lessons, eq(lessons.id, progressRecords.lessonId))
    .innerJoin(units, eq(units.id, lessons.unitId))
    .where(and(eq(progressRecords.userId, userId), eq(units.courseId, courseId)))
    .groupBy(progressRecords.status);

  const completed = rows.find((row) => row.status === "completed")?.value ?? 0;
  const inProgress = rows.find((row) => row.status === "in_progress")?.value ?? 0;
  return { completed, inProgress };
}

export class DrizzleRosterAdapter implements RosterRepositoryPort {
  async listRosterEntries(studentIds: string[]): Promise<StudentRosterEntry[]> {
    if (studentIds.length === 0) return [];
    const now = new Date();

    const profiles = await getDb()
      .select({ id: userProfiles.id, displayName: userProfiles.displayName, currentLevel: userProfiles.currentLevel })
      .from(userProfiles)
      .where(inArray(userProfiles.id, studentIds));

    const enrollmentRows = await getDb()
      .select({ userId: enrollments.userId, currentCourseId: enrollments.currentCourseId })
      .from(enrollments)
      .where(inArray(enrollments.userId, studentIds));
    const courseByUser = new Map(enrollmentRows.map((row) => [row.userId, row.currentCourseId]));

    const completedRows = await getDb()
      .select({ userId: progressRecords.userId, value: count() })
      .from(progressRecords)
      .where(and(inArray(progressRecords.userId, studentIds), eq(progressRecords.status, "completed")))
      .groupBy(progressRecords.userId);
    const completedByUser = new Map(completedRows.map((row) => [row.userId, row.value]));

    const gradeRows = await getDb()
      .select({ userId: grades.userId, averagePercentage: sql<string>`avg(${grades.percentage})` })
      .from(grades)
      .where(inArray(grades.userId, studentIds))
      .groupBy(grades.userId);
    const averageByUser = new Map(gradeRows.map((row) => [row.userId, Math.round(Number(row.averagePercentage) * 100) / 100]));

    const activityRows = await getDb()
      .select({ userId: activityEvents.userId, lastActivity: sql<Date>`max(${activityEvents.createdAt})` })
      .from(activityEvents)
      .where(inArray(activityEvents.userId, studentIds))
      .groupBy(activityEvents.userId);
    const lastActivityByUser = new Map(activityRows.map((row) => [row.userId, new Date(row.lastActivity)]));

    // Lesson totals only need computing once per distinct course, not per student.
    const distinctCourseIds = [...new Set([...courseByUser.values()].filter((id): id is string => id !== null))];
    const totalLessonsByCourse = new Map<string, number>(
      await Promise.all(distinctCourseIds.map(async (courseId) => [courseId, await getLessonCountsForCourse(courseId)] as const)),
    );

    return profiles.map((profile): StudentRosterEntry => {
      const courseId = courseByUser.get(profile.id) ?? null;
      const totalLessons = courseId ? (totalLessonsByCourse.get(courseId) ?? 0) : 0;
      const completedLessonsCount = completedByUser.get(profile.id) ?? 0;
      const lastActivityAt = lastActivityByUser.get(profile.id) ?? null;

      return {
        studentId: profile.id,
        displayName: profile.displayName,
        currentLevel: profile.currentLevel,
        progressPercentage: totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 10000) / 100 : null,
        completedLessonsCount,
        averageScorePercentage: averageByUser.get(profile.id) ?? null,
        lastActivityAt,
        status: computeRosterStatus(lastActivityAt, now),
      };
    });
  }

  async getStudentDetail(studentId: string): Promise<StudentDetail | null> {
    const [profile] = await getDb()
      .select({ id: userProfiles.id, displayName: userProfiles.displayName, currentLevel: userProfiles.currentLevel })
      .from(userProfiles)
      .where(eq(userProfiles.id, studentId))
      .limit(1);
    if (!profile) return null;

    const [enrollment] = await getDb()
      .select({ currentCourseId: enrollments.currentCourseId })
      .from(enrollments)
      .where(eq(enrollments.userId, studentId))
      .limit(1);

    let lessonCounts: LessonProgressCounts = { completed: 0, inProgress: 0, notStarted: 0, total: 0 };
    let progressPercentage: number | null = null;
    if (enrollment?.currentCourseId) {
      const total = await getLessonCountsForCourse(enrollment.currentCourseId);
      const { completed, inProgress } = await getProgressStatusCounts(studentId, enrollment.currentCourseId);
      lessonCounts = { completed, inProgress, notStarted: Math.max(total - completed - inProgress, 0), total };
      progressPercentage = total > 0 ? Math.round((completed / total) * 10000) / 100 : null;
    }

    const [gradeSummary] = await getDb()
      .select({ averagePercentage: avg(grades.percentage), totalGrades: count() })
      .from(grades)
      .where(eq(grades.userId, studentId));

    const recentGradeRows = await getDb()
      .select({
        gradeType: grades.gradeType,
        lessonId: grades.lessonId,
        score: grades.score,
        maxScore: grades.maxScore,
        percentage: grades.percentage,
        createdAt: grades.createdAt,
      })
      .from(grades)
      .where(eq(grades.userId, studentId))
      .orderBy(desc(grades.createdAt))
      .limit(RECENT_LIMIT);
    const recentGrades: RecentGradeEntry[] = recentGradeRows.map((row) => ({ ...row, lessonId: row.lessonId ?? null }));

    const recentActivityRows = await getDb()
      .select({ eventType: activityEvents.eventType, lessonId: activityEvents.lessonId, createdAt: activityEvents.createdAt })
      .from(activityEvents)
      .where(eq(activityEvents.userId, studentId))
      .orderBy(desc(activityEvents.createdAt))
      .limit(RECENT_LIMIT);
    const recentActivity: RecentActivityEntry[] = recentActivityRows.map((row) => ({ ...row, lessonId: row.lessonId ?? null }));

    const { weakAreas, strongAreas } = await this.getTopicPerformance(studentId);

    return {
      studentId: profile.id,
      displayName: profile.displayName,
      currentLevel: profile.currentLevel,
      progressPercentage,
      lessons: lessonCounts,
      averageScorePercentage: gradeSummary?.averagePercentage !== null && gradeSummary?.averagePercentage !== undefined
        ? Math.round(Number(gradeSummary.averagePercentage) * 100) / 100
        : null,
      totalGrades: gradeSummary?.totalGrades ?? 0,
      recentGrades,
      recentActivity,
      lastActivityAt: recentActivity[0]?.createdAt ?? null,
      weakAreas,
      strongAreas,
    };
  }

  private async getTopicPerformance(studentId: string): Promise<{ weakAreas: TopicPerformance[]; strongAreas: TopicPerformance[] }> {
    const rows = await getDb()
      .select({
        lessonId: grades.lessonId,
        averagePercentage: sql<string>`avg(${grades.percentage})`,
        title: contentItems.payload,
      })
      .from(grades)
      .innerJoin(lessons, eq(lessons.id, grades.lessonId))
      .innerJoin(contentItems, eq(contentItems.id, lessons.contentItemId))
      .where(eq(grades.userId, studentId))
      .groupBy(grades.lessonId, contentItems.payload);

    const performance: TopicPerformance[] = rows
      .filter((row): row is typeof row & { lessonId: string } => row.lessonId !== null)
      .map((row) => ({
        lessonId: row.lessonId,
        lessonTitle: (row.title as { title?: string })?.title ?? "Untitled lesson",
        averagePercentage: Math.round(Number(row.averagePercentage) * 100) / 100,
      }));

    const sorted = [...performance].sort((a, b) => a.averagePercentage - b.averagePercentage);
    return {
      weakAreas: sorted.slice(0, TOPIC_LIMIT),
      strongAreas: sorted.slice(-TOPIC_LIMIT).reverse(),
    };
  }
}
