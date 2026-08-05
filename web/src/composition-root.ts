import { CheckIdentityModuleHealthUseCase } from "@/modules/identity/application/use-cases/check-identity-module-health.use-case";
import { DrizzleDatabaseHealthAdapter } from "@/modules/identity/infrastructure/adapters/drizzle-database-health.adapter";
import { ListRolesWithPermissionsUseCase } from "@/modules/identity/application/use-cases/list-roles-with-permissions.use-case";
import { RoleResolver } from "@/modules/identity/application/use-cases/resolve-user-permissions.use-case";
import { DrizzleRoleAdapter } from "@/modules/identity/infrastructure/adapters/drizzle-role.adapter";
import { AuthService } from "@/modules/identity/application/use-cases/auth.service";
import { SupabaseAuthAdapter } from "@/modules/identity/infrastructure/adapters/supabase-auth.adapter";
import { DrizzleUserProfileAdapter } from "@/modules/identity/infrastructure/adapters/drizzle-user-profile.adapter";
import { GetDashboardDataUseCase } from "@/modules/identity/application/use-cases/get-dashboard-data.use-case";
import { DrizzleAuditLogAdapter } from "@/modules/identity/infrastructure/adapters/drizzle-audit-log.adapter";
import { DrizzleRefreshTokenAdapter } from "@/modules/identity/infrastructure/adapters/drizzle-refresh-token.adapter";
import { UpdateLearnerLevelUseCase } from "@/modules/identity/application/use-cases/update-learner-level.use-case";
import { StartPlacementAttemptUseCase } from "@/modules/assessment/application/use-cases/start-placement-attempt.use-case";
import { SubmitResponseUseCase } from "@/modules/assessment/application/use-cases/submit-response.use-case";
import { FinalizeAttemptUseCase } from "@/modules/assessment/application/use-cases/finalize-attempt.use-case";
import { GetAttemptStatusUseCase } from "@/modules/assessment/application/use-cases/get-attempt-status.use-case";
import { DrizzleItemBankAdapter } from "@/modules/assessment/infrastructure/adapters/drizzle-item-bank.adapter";
import { DrizzleAttemptAdapter } from "@/modules/assessment/infrastructure/adapters/drizzle-attempt.adapter";
import { DrizzleResultAdapter } from "@/modules/assessment/infrastructure/adapters/drizzle-result.adapter";
import { ListCoursesUseCase } from "@/modules/curriculum/application/use-cases/list-courses.use-case";
import { DrizzleCourseAdapter } from "@/modules/curriculum/infrastructure/adapters/drizzle-course.adapter";
import { GetCourseDetailUseCase } from "@/modules/curriculum/application/use-cases/get-course-detail.use-case";
import { GetUnitDetailUseCase } from "@/modules/curriculum/application/use-cases/get-unit-detail.use-case";
import { GetLessonUseCase } from "@/modules/curriculum/application/use-cases/get-lesson.use-case";
import { ListExercisesForLessonUseCase } from "@/modules/curriculum/application/use-cases/list-exercises-for-lesson.use-case";
import { ScoreExerciseUseCase } from "@/modules/curriculum/application/use-cases/score-exercise.use-case";
import { DrizzleUnitAdapter } from "@/modules/curriculum/infrastructure/adapters/drizzle-unit.adapter";
import { DrizzleLessonAdapter } from "@/modules/curriculum/infrastructure/adapters/drizzle-lesson.adapter";
import { DrizzleExerciseAdapter } from "@/modules/curriculum/infrastructure/adapters/drizzle-exercise.adapter";
import { DrizzleVocabularyEntryAdapter } from "@/modules/curriculum/infrastructure/adapters/drizzle-vocabulary-entry.adapter";
import { EnterCourseUseCase } from "@/modules/learning/application/use-cases/enter-course.use-case";
import { GetLessonProgressUseCase } from "@/modules/learning/application/use-cases/get-lesson-progress.use-case";
import { SaveLessonPositionUseCase } from "@/modules/learning/application/use-cases/save-lesson-position.use-case";
import { CompleteLessonUseCase } from "@/modules/learning/application/use-cases/complete-lesson.use-case";
import { AdvanceEnrollmentUseCase } from "@/modules/learning/application/use-cases/advance-enrollment.use-case";
import { RecordExerciseAttemptUseCase } from "@/modules/learning/application/use-cases/record-exercise-attempt.use-case";
import { QueueVocabularyForReviewUseCase } from "@/modules/learning/application/use-cases/queue-vocabulary-for-review.use-case";
import { GetDueReviewQueueUseCase } from "@/modules/learning/application/use-cases/get-due-review-queue.use-case";
import { SubmitReviewResponseUseCase } from "@/modules/learning/application/use-cases/submit-review-response.use-case";
import { DrizzleEnrollmentAdapter } from "@/modules/learning/infrastructure/adapters/drizzle-enrollment.adapter";
import { DrizzleProgressAdapter } from "@/modules/learning/infrastructure/adapters/drizzle-progress.adapter";
import { DrizzleExerciseAttemptAdapter } from "@/modules/learning/infrastructure/adapters/drizzle-exercise-attempt.adapter";
import { DrizzleVocabularyReviewStateAdapter } from "@/modules/learning/infrastructure/adapters/drizzle-vocabulary-review-state.adapter";
import { AwardXpUseCase } from "@/modules/engagement/application/use-cases/award-xp.use-case";
import { GetXpBalanceUseCase } from "@/modules/engagement/application/use-cases/get-xp-balance.use-case";
import { ListRecentXpTransactionsUseCase } from "@/modules/engagement/application/use-cases/list-recent-xp-transactions.use-case";
import { UpdateStreakUseCase } from "@/modules/engagement/application/use-cases/update-streak.use-case";
import { GetStreakUseCase } from "@/modules/engagement/application/use-cases/get-streak.use-case";
import { ListBadgesUseCase } from "@/modules/engagement/application/use-cases/list-badges.use-case";
import { EvaluateAndAwardBadgesUseCase } from "@/modules/engagement/application/use-cases/evaluate-and-award-badges.use-case";
import { GetDailyGoalProgressUseCase } from "@/modules/engagement/application/use-cases/get-daily-goal-progress.use-case";
import { DrizzleXpAdapter } from "@/modules/engagement/infrastructure/adapters/drizzle-xp.adapter";
import { DrizzleStreakAdapter } from "@/modules/engagement/infrastructure/adapters/drizzle-streak.adapter";
import { DrizzleBadgeAdapter } from "@/modules/engagement/infrastructure/adapters/drizzle-badge.adapter";
import { DrizzleDailyGoalAdapter } from "@/modules/engagement/infrastructure/adapters/drizzle-daily-goal.adapter";
import { SendTutorMessageUseCase } from "@/modules/ai/application/use-cases/send-tutor-message.use-case";
import { GetConversationHistoryUseCase } from "@/modules/ai/application/use-cases/get-conversation-history.use-case";
import { FlagTutorMessageUseCase } from "@/modules/ai/application/use-cases/flag-tutor-message.use-case";
import { AiGateway } from "@/modules/ai/application/services/ai-gateway";
import { AnthropicTutorAdapter } from "@/modules/ai/infrastructure/adapters/anthropic-tutor.adapter";
import { DrizzleTutorConversationAdapter } from "@/modules/ai/infrastructure/adapters/drizzle-tutor-conversation.adapter";
import { DrizzlePromptTemplateAdapter } from "@/modules/ai/infrastructure/adapters/drizzle-prompt-template.adapter";
import { DrizzleAiInteractionAdapter } from "@/modules/ai/infrastructure/adapters/drizzle-ai-interaction.adapter";

/**
 * The single composition point that wires Infrastructure implementations
 * into Application use cases via their port interfaces (SAD §6.1's
 * Dependency Injection rule). Route Handlers (Interface layer) import
 * from here — never from a module's infrastructure directly.
 *
 * As new modules land, each gets its own factory here, following this
 * same shape.
 */
export function createIdentityHealthUseCase(): CheckIdentityModuleHealthUseCase {
  const databaseHealthAdapter = new DrizzleDatabaseHealthAdapter();
  return new CheckIdentityModuleHealthUseCase(databaseHealthAdapter);
}

export function createListRolesUseCase(): ListRolesWithPermissionsUseCase {
  const roleRepository = new DrizzleRoleAdapter();
  return new ListRolesWithPermissionsUseCase(roleRepository);
}

export function createRoleResolver(): RoleResolver {
  const roleRepository = new DrizzleRoleAdapter();
  return new RoleResolver(roleRepository);
}

export function createAuthService(): AuthService {
  const authProvider = new SupabaseAuthAdapter();
  const userProfileRepository = new DrizzleUserProfileAdapter();
  const roleRepository = new DrizzleRoleAdapter();
  const auditLog = new DrizzleAuditLogAdapter();
  const refreshTokens = new DrizzleRefreshTokenAdapter();
  return new AuthService(authProvider, userProfileRepository, roleRepository, auditLog, refreshTokens);
}

export function createGetDashboardDataUseCase(): GetDashboardDataUseCase {
  const userProfileRepository = new DrizzleUserProfileAdapter();
  return new GetDashboardDataUseCase(userProfileRepository, createRoleResolver());
}

export function createUpdateLearnerLevelUseCase(): UpdateLearnerLevelUseCase {
  return new UpdateLearnerLevelUseCase(new DrizzleUserProfileAdapter());
}

export function createStartPlacementAttemptUseCase(): StartPlacementAttemptUseCase {
  return new StartPlacementAttemptUseCase(new DrizzleItemBankAdapter(), new DrizzleAttemptAdapter());
}

export function createSubmitResponseUseCase(): SubmitResponseUseCase {
  return new SubmitResponseUseCase(new DrizzleItemBankAdapter(), new DrizzleAttemptAdapter());
}

export function createFinalizeAttemptUseCase(): FinalizeAttemptUseCase {
  return new FinalizeAttemptUseCase(
    new DrizzleItemBankAdapter(),
    new DrizzleAttemptAdapter(),
    new DrizzleResultAdapter(),
  );
}

export function createGetAttemptStatusUseCase(): GetAttemptStatusUseCase {
  return new GetAttemptStatusUseCase(new DrizzleAttemptAdapter(), new DrizzleResultAdapter());
}

export function createListCoursesUseCase(): ListCoursesUseCase {
  return new ListCoursesUseCase(new DrizzleCourseAdapter());
}

export function createGetCourseDetailUseCase(): GetCourseDetailUseCase {
  return new GetCourseDetailUseCase(new DrizzleCourseAdapter(), new DrizzleUnitAdapter());
}

export function createGetUnitDetailUseCase(): GetUnitDetailUseCase {
  return new GetUnitDetailUseCase(new DrizzleUnitAdapter(), new DrizzleCourseAdapter(), new DrizzleLessonAdapter());
}

export function createGetLessonUseCase(): GetLessonUseCase {
  return new GetLessonUseCase(new DrizzleLessonAdapter(), new DrizzleExerciseAdapter(), new DrizzleVocabularyEntryAdapter());
}

export function createListExercisesForLessonUseCase(): ListExercisesForLessonUseCase {
  return new ListExercisesForLessonUseCase(new DrizzleLessonAdapter(), new DrizzleExerciseAdapter());
}

export function createScoreExerciseUseCase(): ScoreExerciseUseCase {
  return new ScoreExerciseUseCase(new DrizzleExerciseAdapter());
}

export function createRecordExerciseAttemptUseCase(): RecordExerciseAttemptUseCase {
  return new RecordExerciseAttemptUseCase(new DrizzleExerciseAttemptAdapter());
}

export function createEnterCourseUseCase(): EnterCourseUseCase {
  return new EnterCourseUseCase(new DrizzleEnrollmentAdapter());
}

export function createGetLessonProgressUseCase(): GetLessonProgressUseCase {
  return new GetLessonProgressUseCase(new DrizzleProgressAdapter());
}

export function createSaveLessonPositionUseCase(): SaveLessonPositionUseCase {
  return new SaveLessonPositionUseCase(new DrizzleProgressAdapter());
}

export function createCompleteLessonUseCase(): CompleteLessonUseCase {
  return new CompleteLessonUseCase(new DrizzleProgressAdapter());
}

export function createAdvanceEnrollmentUseCase(): AdvanceEnrollmentUseCase {
  return new AdvanceEnrollmentUseCase(new DrizzleEnrollmentAdapter());
}

/** Exposed directly (not just via use-case factories) — the Route Handler that orchestrates unit-advance needs a repository instance to compose calls the other factories don't expose (see api/v1/lessons/[id]/complete/route.ts). */
export function createDrizzleUnitAdapter(): DrizzleUnitAdapter {
  return new DrizzleUnitAdapter();
}

export function createDrizzleLessonAdapter(): DrizzleLessonAdapter {
  return new DrizzleLessonAdapter();
}

/** Exposed directly (not just via use-case factories) — src/lib/resolve-due-review-queue.ts's cross-module orchestration needs a repository instance to resolve due items' vocabulary content. */
export function createDrizzleVocabularyEntryAdapter(): DrizzleVocabularyEntryAdapter {
  return new DrizzleVocabularyEntryAdapter();
}

export function createQueueVocabularyForReviewUseCase(): QueueVocabularyForReviewUseCase {
  return new QueueVocabularyForReviewUseCase(new DrizzleVocabularyReviewStateAdapter());
}

export function createGetDueReviewQueueUseCase(): GetDueReviewQueueUseCase {
  return new GetDueReviewQueueUseCase(new DrizzleVocabularyReviewStateAdapter());
}

export function createSubmitReviewResponseUseCase(): SubmitReviewResponseUseCase {
  return new SubmitReviewResponseUseCase(new DrizzleVocabularyReviewStateAdapter());
}

export function createAwardXpUseCase(): AwardXpUseCase {
  return new AwardXpUseCase(new DrizzleXpAdapter());
}

export function createGetXpBalanceUseCase(): GetXpBalanceUseCase {
  return new GetXpBalanceUseCase(new DrizzleXpAdapter());
}

export function createListRecentXpTransactionsUseCase(): ListRecentXpTransactionsUseCase {
  return new ListRecentXpTransactionsUseCase(new DrizzleXpAdapter());
}

export function createUpdateStreakUseCase(): UpdateStreakUseCase {
  return new UpdateStreakUseCase(new DrizzleStreakAdapter());
}

export function createGetStreakUseCase(): GetStreakUseCase {
  return new GetStreakUseCase(new DrizzleStreakAdapter());
}

export function createListBadgesUseCase(): ListBadgesUseCase {
  return new ListBadgesUseCase(new DrizzleBadgeAdapter());
}

export function createEvaluateAndAwardBadgesUseCase(): EvaluateAndAwardBadgesUseCase {
  return new EvaluateAndAwardBadgesUseCase(new DrizzleBadgeAdapter());
}

export function createGetDailyGoalProgressUseCase(): GetDailyGoalProgressUseCase {
  return new GetDailyGoalProgressUseCase(new DrizzleDailyGoalAdapter(), new DrizzleXpAdapter());
}

/** Exposed directly (not just via use-case factories) — src/lib/build-learner-stats-snapshot.ts's cross-module orchestration needs repository instances the other factories don't expose. */
export function createDrizzleProgressAdapter(): DrizzleProgressAdapter {
  return new DrizzleProgressAdapter();
}

export function createDrizzleExerciseAttemptAdapter(): DrizzleExerciseAttemptAdapter {
  return new DrizzleExerciseAttemptAdapter();
}

export function createDrizzleVocabularyReviewStateAdapter(): DrizzleVocabularyReviewStateAdapter {
  return new DrizzleVocabularyReviewStateAdapter();
}

export function createDrizzleXpAdapter(): DrizzleXpAdapter {
  return new DrizzleXpAdapter();
}

/** No secondary provider adapter is configured for this slice (SAD §7.6's fallback is conditional on "where one exists") — the Gateway itself already supports one via its optional third constructor argument, wired here the moment a second adapter is added. */
function createAiGateway(): AiGateway {
  return new AiGateway(new AnthropicTutorAdapter(), new DrizzleAiInteractionAdapter());
}

export function createSendTutorMessageUseCase(): SendTutorMessageUseCase {
  return new SendTutorMessageUseCase(new DrizzleTutorConversationAdapter(), new DrizzlePromptTemplateAdapter(), createAiGateway());
}

export function createGetConversationHistoryUseCase(): GetConversationHistoryUseCase {
  return new GetConversationHistoryUseCase(new DrizzleTutorConversationAdapter());
}

export function createFlagTutorMessageUseCase(): FlagTutorMessageUseCase {
  return new FlagTutorMessageUseCase(new DrizzleTutorConversationAdapter());
}
