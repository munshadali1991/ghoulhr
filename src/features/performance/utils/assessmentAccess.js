import {
  ASSESSMENT_STATUS,
  ANSWER_ROLES,
  normalizeSectionRoleCode,
  isManagerClassRole,
  isHrClassRole,
} from '../constants/performanceEnums';

/**
 * Maps API viewer + assessment status to section edit flags and acting role.
 * Supports workflow-aware viewer fields with a legacy fallback.
 *
 * @param {object | undefined} viewer
 * @param {string | undefined} status
 */
export function mapAssessmentViewer(viewer, status) {
  if (!viewer) {
    return {
      actingRole: null,
      employeeEditable: false,
      canManagerReview: false,
      canHrReview: false,
      editableByRole: {},
    };
  }

  if (
    viewer.actingRole !== undefined ||
    viewer.editableEmployee !== undefined ||
    viewer.editableByRole !== undefined
  ) {
    return {
      actingRole: viewer.actingRole ?? null,
      employeeEditable: viewer.editableEmployee ?? false,
      canManagerReview: viewer.editableManager ?? false,
      canHrReview: viewer.editableHr ?? false,
      editableByRole: viewer.editableByRole ?? {},
    };
  }

  const isOwner = viewer.isOwner ?? false;
  const hasManagerAct = viewer.canManagerReview ?? false;
  const hasHrAct = viewer.canHrReview ?? false;

  const employeeEditable =
    isOwner &&
    (status === ASSESSMENT_STATUS.DRAFT || status === ASSESSMENT_STATUS.SUBMITTED);

  const canManagerReview =
    !isOwner && hasManagerAct && status === ASSESSMENT_STATUS.SUBMITTED;

  const canHrReview =
    !isOwner && hasHrAct && status === ASSESSMENT_STATUS.MANAGER_REVIEWED;

  let actingRole = null;
  if (employeeEditable) actingRole = ANSWER_ROLES.EMPLOYEE;
  else if (canManagerReview) actingRole = ANSWER_ROLES.MANAGER;
  else if (canHrReview) actingRole = ANSWER_ROLES.HR_ADMIN;

  const editableByRole = {};
  if (employeeEditable) editableByRole.EMPLOYEE = true;
  if (canManagerReview) {
    editableByRole.MANAGER = true;
    editableByRole.TEAM_LEAD = true;
  }
  if (canHrReview) {
    editableByRole.HR_ADMIN = true;
    editableByRole.HR = true;
  }

  return {
    actingRole,
    employeeEditable,
    canManagerReview,
    canHrReview,
    editableByRole,
  };
}

/**
 * Whether a section is editable for the current viewer.
 * @param {object} section
 * @param {object} perms
 */
export function isSectionEditable(section, perms) {
  const code = normalizeSectionRoleCode(section.role);

  if (perms.editableByRole && Object.keys(perms.editableByRole).length) {
    return Boolean(perms.editableByRole[code] ?? perms.editableByRole[section.role]);
  }

  if (code === 'EMPLOYEE') return perms.employeeEditable;
  if (isManagerClassRole(code)) return perms.canManagerReview;
  if (isHrClassRole(code)) return perms.canHrReview;
  return false;
}
