import { ASSESSMENT_STATUS } from '@/features/performance/constants/performanceEnums';
import { isSectionEditable } from '@/features/performance/utils/assessmentAccess';

const MANAGER_CLASS = new Set(['MANAGER', 'TEAM_LEAD']);
const HR_CLASS = new Set(['HR_ADMIN', 'ORG_ADMIN']);

function normalizeRole(code) {
  if (code === 'HR') return 'HR_ADMIN';
  return code ?? '';
}

function previewStatusForRole(roleCode) {
  const role = normalizeRole(roleCode);
  if (role === 'EMPLOYEE') return ASSESSMENT_STATUS.DRAFT;
  if (MANAGER_CLASS.has(role)) return ASSESSMENT_STATUS.SUBMITTED;
  if (HR_CLASS.has(role)) return ASSESSMENT_STATUS.MANAGER_REVIEWED;
  return ASSESSMENT_STATUS.SUBMITTED;
}

function canEditSectionForRole(sectionRoleCode, { isOwner, actorRoleCodes, status }) {
  const role = normalizeRole(sectionRoleCode);

  if (role === 'EMPLOYEE') {
    return (
      isOwner &&
      (status === ASSESSMENT_STATUS.DRAFT || status === ASSESSMENT_STATUS.SUBMITTED)
    );
  }

  if (isOwner) return false;
  if (!actorRoleCodes.includes(role)) return false;

  if (MANAGER_CLASS.has(role)) {
    return status === ASSESSMENT_STATUS.SUBMITTED;
  }

  if (HR_CLASS.has(role)) {
    return status === ASSESSMENT_STATUS.MANAGER_REVIEWED;
  }

  return (
    status === ASSESSMENT_STATUS.SUBMITTED ||
    status === ASSESSMENT_STATUS.MANAGER_REVIEWED
  );
}

/** Build editableByRole map for builder preview as a given RBAC role. */
export function buildPreviewPermissions(roleCode, sections = []) {
  const role = normalizeRole(roleCode);
  const status = previewStatusForRole(role);
  const isOwner = role === 'EMPLOYEE';
  const actorRoleCodes = [role];

  const uniqueRoles = [
    ...new Set((sections ?? []).map((s) => normalizeRole(s.role)).filter(Boolean)),
  ];

  const editableByRole = {};
  for (const sectionRole of uniqueRoles) {
    editableByRole[sectionRole] = canEditSectionForRole(sectionRole, {
      isOwner,
      actorRoleCodes,
      status,
    });
  }

  return {
    editableByRole,
    employeeEditable: Boolean(editableByRole.EMPLOYEE),
    canManagerReview: uniqueRoles.some(
      (code) => MANAGER_CLASS.has(code) && editableByRole[code],
    ),
    canHrReview: uniqueRoles.some((code) => HR_CLASS.has(code) && editableByRole[code]),
    previewStatus: status,
  };
}

/** Convert builder form values into a snapshot-like schema for preview rendering. */
export function formValuesToPreviewSchema(values, rbacRoles = []) {
  const roleName = (code) =>
    rbacRoles.find((r) => r.code === code)?.name ?? code;

  let questionNumber = 0;

  return {
    ratingOptions: (values.ratingOptions ?? [])
      .filter((o) => o?.isActive !== false)
      .map((o) => ({
        label: o.label,
        weight: o.weight,
      })),
    sections: (values.sections ?? [])
      .filter((s) => s?.isActive !== false)
      .map((section) => ({
        key: section.key,
        title: section.title,
        banner: section.banner || section.title,
        role: section.role === 'HR' ? 'HR_ADMIN' : section.role,
        filledByRoleName: roleName(section.role),
        scored: Boolean(section.scored),
        isActive: section.isActive !== false,
        questions: (section.questions ?? [])
          .filter((q) => q?.isActive !== false)
          .map((question) => {
            questionNumber += 1;
            const type = question.type === 'narrative' ? 'textarea' : question.type;
            const options =
              type === 'rating'
                ? (values.ratingOptions ?? [])
                    .filter((o) => o?.isActive !== false)
                    .map((o) => o.label)
                    .filter(Boolean)
                : question.options;

            return {
              key: question.key,
              number: questionNumber,
              label: question.label || 'Untitled question',
              type,
              options,
              allowComment: Boolean(question.allowComment),
              required: question.required !== false,
              helperText: question.helperText,
              placeholder: question.placeholder,
              isActive: true,
            };
          }),
      })),
  };
}

export { isSectionEditable };
