/**
 * Generates an immutable, human-readable snapshot of the actor
 * executing an action for audit logging and change history tracking.
 * Example format: "Jane Doe (@jane.doe) [ADMIN]"
 */
export function buildActorSnapshot(user?: any): string | null {
  if (!user) return null;

  const firstName = (user.firstName || '').trim();
  const lastName = (user.lastName || '').trim();
  const fullName = `${firstName} ${lastName}`.trim();

  const identifier = (user.username || user.email || user.id || 'unknown').trim();

  let role = 'USER';
  if (user.isRoot) {
    role = 'ROOT';
  } else if (user.role) {
    role = user.role;
  } else if (Array.isArray(user.userRoles) && user.userRoles.length > 0) {
    role = user.userRoles[0]?.role?.name || user.userRoles[0]?.role?.code || 'USER';
  }

  return `${fullName ? fullName + ' ' : ''}(@${identifier}) [${role}]`.trim();
}
