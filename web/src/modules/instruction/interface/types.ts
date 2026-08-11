// Re-exported so UI code stays within the arch-check boundary rule
// (only a module's interface layer is importable from outside it).
export type {
  StudentRosterEntry,
  StudentDetail,
  LessonProgressCounts,
  TopicPerformance,
  RecentActivityEntry,
  RecentGradeEntry,
  RosterStatus,
  CefrLevel,
} from "@/modules/instruction/domain/services/roster";
export { NotAuthorizedForStudentError } from "@/modules/instruction/application/use-cases/get-student-detail.use-case";
