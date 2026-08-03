/**
 * SAD §8 RoleResolver's pure core — zero I/O, the class of logic SRS
 * §3 targets for ≥80% coverage. Given the role keys a user holds and
 * the platform's role->permission map, computes their effective,
 * deduplicated permission set.
 */
export function resolvePermissions(
  roleKeys: readonly string[],
  rolePermissionMap: ReadonlyMap<string, readonly string[]>,
): Set<string> {
  const resolved = new Set<string>();
  for (const roleKey of roleKeys) {
    for (const permissionKey of rolePermissionMap.get(roleKey) ?? []) {
      resolved.add(permissionKey);
    }
  }
  return resolved;
}
