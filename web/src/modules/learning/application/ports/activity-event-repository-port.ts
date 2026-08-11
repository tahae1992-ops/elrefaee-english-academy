export type ActivityEventType =
  | "lesson_started"
  | "lesson_completed"
  | "section_viewed"
  | "video_started"
  | "video_completed"
  | "vocabulary_viewed"
  | "exercise_started"
  | "exercise_completed"
  | "quiz_started"
  | "quiz_completed"
  | "answer_submitted";

export interface RecordActivityEventInput {
  userId: string;
  eventType: ActivityEventType;
  lessonId?: string;
  materialId?: string;
  exerciseId?: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityEvent extends RecordActivityEventInput {
  id: string;
  createdAt: Date;
}

export interface ActivityEventRepositoryPort {
  record(input: RecordActivityEventInput): Promise<ActivityEvent>;
  /** Teacher dashboard's activity timeline — most recent first. */
  listRecentForUser(userId: string, limit: number): Promise<ActivityEvent[]>;
  /** Teacher dashboard's "last activity" column across a whole roster in one query. */
  getLastActivityForUsers(userIds: string[]): Promise<Map<string, Date>>;
  /** Pre-A1 blueprint (Rev. 3) — meaningful lesson completion: the distinct block indexes this user has a real `section_viewed` event for, in this lesson. Read by `computeLessonCompletionGaps` before a lesson is allowed to be marked complete. */
  listViewedBlockIndexes(userId: string, lessonId: string): Promise<number[]>;
}
