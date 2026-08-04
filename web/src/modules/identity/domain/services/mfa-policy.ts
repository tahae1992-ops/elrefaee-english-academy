/**
 * Blueprint §15 / SRS §12.1: MFA is mandatory for these roles (the
 * highest-value targets), optional-but-encouraged for Student. Pure
 * domain rule — zero I/O, matches identity.roles' seeded keys.
 */
const MFA_REQUIRED_ROLE_KEYS = new Set([
  "instructor",
  "content_reviewer",
  "curriculum_designer",
  "academy_admin",
  "super_admin",
]);

export function requiresMfa(roleKeys: readonly string[]): boolean {
  return roleKeys.some((key) => MFA_REQUIRED_ROLE_KEYS.has(key));
}
