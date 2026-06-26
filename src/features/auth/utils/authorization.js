/**
 * @typedef {import('@/app/providers/authContext').AuthSession} AuthSession
 * @typedef {import('@/features/auth/config/accessRegistry').TabAccessDef} TabAccessDef
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
 * @param {string[]} permissionCodes
 */
export function canAll(session, permissionCodes) {
  const perms = session?.permissions ?? [];
  return permissionCodes.every((c) => perms.includes(c));
}

/**
 * Check read permission — accepts full code or resource prefix.
 * @param {AuthSession | null | undefined} session
 * @param {string} resourceOrCode - e.g. 'settings.leave' or 'settings.leave:read'
 */
export function canRead(session, resourceOrCode) {
  const code = resourceOrCode.includes(':') ? resourceOrCode : `${resourceOrCode}:read`;
  return can(session, code);
}

/**
 * Check write permission — accepts full code or resource prefix.
 * @param {AuthSession | null | undefined} session
 * @param {string} resourceOrCode - e.g. 'settings.leave' or 'settings.leave:write'
 */
export function canWrite(session, resourceOrCode) {
  const code = resourceOrCode.includes(':') ? resourceOrCode : `${resourceOrCode}:write`;
  return can(session, code);
}

/**
 * @param {AuthSession | null | undefined} session
 * @param {TabAccessDef} tabDef
 */
export function canAccessTab(session, tabDef) {
  if (!tabDef?.read) return false;
  return can(session, tabDef.read);
}

/**
 * @param {AuthSession | null | undefined} session
 * @param {TabAccessDef} tabDef
 */
export function canWriteTab(session, tabDef) {
  if (!canAccessTab(session, tabDef)) return false;
  if (tabDef.write) return can(session, tabDef.write);
  if (tabDef.actions) {
    return Object.values(tabDef.actions).some((code) => can(session, code));
  }
  return false;
}

/**
 * @param {AuthSession | null | undefined} session
 * @param {TabAccessDef[]} tabs
 * @returns {TabAccessDef[]}
 */
export function getAllowedTabs(session, tabs) {
  return (tabs ?? []).filter((tab) => canAccessTab(session, tab));
}

/**
 * @param {AuthSession | null | undefined} session
 * @param {TabAccessDef[]} tabs
 * @returns {string | null}
 */
export function getFirstAllowedTabKey(session, tabs) {
  return getAllowedTabs(session, tabs)[0]?.key ?? null;
}

import { getDefaultDashboardPath } from '@/features/auth/config/dashboardRegistry';

/**
 * @param {AuthSession | null | undefined} session
 * @returns {string}
 */
export function getDefaultLandingPath(session) {
  return getDefaultDashboardPath(session);
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
