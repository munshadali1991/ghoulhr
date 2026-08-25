/**
 * Rich permission previews for the RBAC role matrix eye icon.
 * Codes without an entry fall back to catalog description in the dialog.
 *
 * @typedef {{
 *   code: string,
 *   title: string,
 *   kind: string,
 *   location: string,
 *   summary: string,
 *   placementHint?: string,
 *   previewKind?: 'team-on-leave' | 'track' | 'who-is-in' | 'employee-swipes' | 'generic',
 *   scopeNote?: string,
 * }} PermissionPreviewDef
 */

/** @type {Record<string, PermissionPreviewDef>} */
export const PERMISSION_PREVIEW_BY_CODE = {
  'dashboard.ess.team-on-leave:read': {
    code: 'dashboard.ess.team-on-leave:read',
    title: 'Team On Leave',
    kind: 'Dashboard card + Leave page',
    location: 'Employee home + /leave/team-on-leave',
    summary:
      'Home card shows who is on approved leave today and this month. Full Leave → Team On Leave page charts leave and restricted holidays by day with click-to-breakdown, list view, and CSV export.',
    placementHint: 'ESS home widget; Leave submenu → Team On Leave',
    previewKind: 'team-on-leave',
    scopeNote:
      'Self: empty roster. Team: direct reports. Department: same department. Organization: entire org. The viewer is never listed.',
  },
  'dashboard.ess.track:read': {
    code: 'dashboard.ess.track:read',
    title: 'Track',
    kind: 'Dashboard card',
    location: 'Employee Dashboard (/home)',
    summary:
      'Shows the signed-in employee’s own PENDING leave applications. Empty state when nothing is waiting; otherwise a compact list with leave type, dates, and day count.',
    placementHint: 'ESS home row with Track card (6 columns on desktop)',
    previewKind: 'track',
    scopeNote: 'Always own records only (Self).',
  },
  'dashboard.ess.who-is-in:read': {
    code: 'dashboard.ess.who-is-in:read',
    title: 'Who is in?',
    kind: 'Dashboard card + Attendance page',
    location: 'Employee home + /attendance/who-is-in',
    summary:
      'Shows Not Yet In, Late Arrivals, and On Time for people in your access scope. Full page adds Out of Office and a from–to date range.',
    placementHint: 'ESS home widget; Attendance submenu → Who is in',
    previewKind: 'who-is-in',
    scopeNote:
      'Self: empty. Team: assigned reporting-manager employees only. Organization (Org Admin / HR): everyone.',
  },
  'ess.attendance.swipes:read': {
    code: 'ess.attendance.swipes:read',
    title: 'Employee Swipes',
    kind: 'Attendance page',
    location: 'Attendance → Employee Swipes (/attendance/swipes)',
    summary:
      'Lists web sign-in and sign-out punches for people in your access scope. Table shows name, swipe time, shift, and received time. Door/Address stays blank (no biometric). Detail panel shows Web sign in/out.',
    placementHint: 'Attendance submenu → Employee Swipes',
    previewKind: 'employee-swipes',
    scopeNote:
      'Self: empty. Team: assigned reporting-manager employees only. Organization (Org Admin / HR): everyone.',
  },
};

/**
 * @param {string} code
 * @param {{ description?: string, resource?: string, actionLabel?: string } | null | undefined} perm
 * @returns {PermissionPreviewDef}
 */
export function resolvePermissionPreview(code, perm) {
  const rich = PERMISSION_PREVIEW_BY_CODE[code];
  if (rich) return rich;

  const resource = perm?.resource ?? String(code).split(':')[0];
  return {
    code,
    title: resource.replace(/\./g, ' / ').replace(/-/g, ' '),
    kind: 'Permission',
    location: 'Application',
    summary: perm?.description ?? 'No additional preview is available for this permission.',
    previewKind: 'generic',
  };
}
