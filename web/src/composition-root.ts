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
import { CheckPracticeAnswerUseCase } from "@/modules/curriculum/application/use-cases/check-practice-answer.use-case";
import { DrizzleUnitAdapter } from "@/modules/curriculum/infrastructure/adapters/drizzle-unit.adapter";
import { DrizzleLessonAdapter } from "@/modules/curriculum/infrastructure/adapters/drizzle-lesson.adapter";
import { EnterCourseUseCase } from "@/modules/learning/application/use-cases/enter-course.use-case";
import { GetLessonProgressUseCase } from "@/modules/learning/application/use-cases/get-lesson-progress.use-case";
import { SaveLessonPositionUseCase } from "@/modules/learning/application/use-cases/save-lesson-position.use-case";
import { CompleteLessonUseCase } from "@/modules/learning/application/use-cases/complete-lesson.use-case";
import { AdvanceEnrollmentUseCase } from "@/modules/learning/application/use-cases/advance-enrollment.use-case";
import { DrizzleEnrollmentAdapter } from "@/modules/learning/infrastructure/adapters/drizzle-enrollment.adapter";
import { DrizzleProgressAdapter } from "@/modules/learning/infrastructure/adapters/drizzle-progress.adapter";

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
  return new GetLessonUseCase(new DrizzleLessonAdapter());
}

export function createCheckPracticeAnswerUseCase(): CheckPracticeAnswerUseCase {
  return new CheckPracticeAnswerUseCase(new DrizzleLessonAdapter());
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
