/**

 * @typedef {import('./authContext').AuthSession} AuthSession

 */



/**

 * @param {AuthSession | null | undefined} session

 * @param {string} moduleCode

 */

export function hasModule(session, moduleCode) {

  return (session?.entitledModules ?? []).includes(moduleCode);

}



/**

 * @param {AuthSession | null | undefined} session

 * @param {string} permissionCode

 */

export function can(session, permissionCode) {

  return (session?.permissions ?? []).includes(permissionCode);

}



/**

 * @param {AuthSession | null | undefined} session

 * @param {string[]} permissionCodes

 */

export function canAny(session, permissionCodes) {

  const perms = session?.permissions ?? [];

  return permissionCodes.some((c) => perms.includes(c));

}



/**

 * @param {AuthSession | null | undefined} session

 * @returns {string}

 */

export function getDefaultLandingPath(session) {
  const hasEss =
    can(session, 'ess.leave:read') ||
    can(session, 'ess.attendance:read') ||
    can(session, 'ess.timesheet:read');
  if (hasEss) return '/home';
  return '/dashboard';
}



/** @deprecated Portal split removed — kept for legacy imports. */

export function hasAdminPortalAccess(session) {

  const perms = session?.permissions ?? [];

  if (perms.includes('platform:super-admin')) return false;

  return perms.some((p) =>

    ['employees:', 'settings.', 'rbac:', 'payroll:'].some((prefix) => p.startsWith(prefix)),

  );

}



/** @deprecated Portal split removed — kept for legacy imports. */

export function isEmployeePortalUser(user, session) {

  void user;

  void session;

  return false;

}


