import type { UserProfileRepositoryPort } from "@/modules/identity/application/ports/user-profile-repository-port";
import type { RoleResolver } from "@/modules/identity/application/use-cases/resolve-user-permissions.use-case";

export interface DashboardData {
  displayName: string;
  permissionKeys: string[];
}

/**
 * The Dashboard slice's read model — combines the profile
 * (UserProfileRepositoryPort) with the resolved permission set
 * (RoleResolver, SAD §8) rather than duplicating either. Mirrors the
 * API Spec's `GET /users/me` shape (§6.2), not yet exposed as its own
 * REST route.
 */
export class GetDashboardDataUseCase {
  constructor(
    private readonly userProfiles: UserProfileRepositoryPort,
    private readonly roleResolver: RoleResolver,
  ) {}

  async execute(userId: string): Promise<DashboardData | null> {
    const profile = await this.userProfiles.findById(userId);
    if (!profile) {
      return null;
    }

    const permissions = await this.roleResolver.resolveForUser(userId);
    return {
      displayName: profile.displayName,
      permissionKeys: [...permissions].sort(),
    };
  }
}
