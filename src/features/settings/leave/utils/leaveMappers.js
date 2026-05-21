import { generateUuid, isUuid } from '@/shared/utils/uuid';
import {
  ACCRUAL_TYPES,
  WORKFLOW_BY_PRESET,
  WORKFLOW_PRESETS,
} from '../constants';

export function accrualLabel(value) {
  return ACCRUAL_TYPES.find((a) => a.value === value)?.label ?? value ?? '—';
}

export function workflowLabel(preset) {
  return WORKFLOW_PRESETS.find((p) => p.value === preset)?.label ?? '—';
}

export function workflowChainLabel(preset) {
  return WORKFLOW_PRESETS.find((p) => p.value === (preset || 'MANAGER_HR_ADMIN'))?.chain ?? 'Manager → HR → Admin';
}

export function inferApprovalPreset(requiresApproval, workflow) {
  if (!requiresApproval) return 'NONE';
  const wf = Array.isArray(workflow) ? workflow : [];
  const key = wf.join(',');
  if (key === 'MANAGER,HR,ADMIN') return 'MANAGER_HR_ADMIN';
  if (key === 'MANAGER,HR') return 'MANAGER_HR';
  if (key === 'MANAGER') return 'MANAGER_ONLY';
  return 'MANAGER_HR_ADMIN';
}

/** @param {string} defaultLocationId */
export function createEmptyLeaveRow(defaultLocationId) {
  return {
    id: generateUuid(),
    locationId: defaultLocationId || '',
    name: '',
    code: '',
    description: '',
    leaveCategory: '',
    isPaid: true,
    annualEntitlementDays: 0,
    accrualType: 'MONTHLY',
    allowCarryForward: false,
    maxCarryForwardDays: '',
    encashmentAllowed: false,
    negativeBalanceAllowed: false,
    requiresSupportingDocument: false,
    supportingDocumentAfterDays: 2,
    allowHalfDay: true,
    weekendsCountAsLeave: false,
    holidaysCountAsLeave: false,
    appliesTo: 'ALL_EMPLOYEES',
    approvalWorkflowPreset: 'MANAGER_HR_ADMIN',
    requiresApproval: true,
    isActive: true,
  };
}

/**
 * @param {Record<string, unknown>} row
 * @param {number} idx
 * @param {string} defaultLocId
 */
export function leaveApiToFormRow(row, idx, defaultLocId) {
  const wf = Array.isArray(row.approvalWorkflow) ? row.approvalWorkflow : undefined;
  const preset = inferApprovalPreset(row.requiresApproval !== false, wf);

  return {
    id: row.id,
    locationId: String(
      row.locationId ?? row.location_id ?? row.location?.id ?? defaultLocId ?? '',
    ).trim(),
    name: row.name ?? '',
    code: row.code ?? '',
    description: row.description ?? '',
    leaveCategory: row.leaveCategory ? String(row.leaveCategory) : '',
    isPaid: row.isPaid !== false,
    annualEntitlementDays:
      row.annualEntitlementDays != null ? Number(row.annualEntitlementDays) : 0,
    accrualType: row.accrualType ? String(row.accrualType) : 'MONTHLY',
    allowCarryForward: !!row.allowCarryForward,
    maxCarryForwardDays:
      row.maxCarryForwardDays != null && row.maxCarryForwardDays !== ''
        ? String(row.maxCarryForwardDays)
        : '',
    encashmentAllowed: !!row.encashmentAllowed,
    negativeBalanceAllowed: !!row.negativeBalanceAllowed,
    requiresApproval: row.requiresApproval !== false,
    requiresSupportingDocument: !!row.requiresSupportingDocument,
    supportingDocumentAfterDays:
      row.supportingDocumentAfterDays != null ? Number(row.supportingDocumentAfterDays) : 2,
    allowHalfDay: row.allowHalfDay !== false,
    weekendsCountAsLeave: !!row.weekendsCountAsLeave,
    holidaysCountAsLeave: !!row.holidaysCountAsLeave,
    appliesTo: (() => {
      const raw = row.appliesTo ?? row.applies_to;
      const normalized = raw ? String(raw).trim().toUpperCase() : '';
      if (normalized === 'ALL_BRANCHES') return 'ALL_BRANCHES';
      return 'ALL_EMPLOYEES';
    })(),
    approvalWorkflowPreset: preset,
    isActive: row.isActive !== false,
    sortOrder: row.sortOrder ?? idx,
  };
}

/**
 * @param {Array<Record<string, unknown>>} leaves
 * @param {string} defaultLocId
 */
export function leavesApiToFormRows(leaves, defaultLocId) {
  if (!Array.isArray(leaves) || leaves.length === 0) return [];
  return leaves.map((row, idx) => leaveApiToFormRow(row, idx, defaultLocId));
}

/**
 * @param {Array<{ id?: string, name?: string }>} locations
 */
export function getSavedLocations(locations) {
  return (Array.isArray(locations) ? locations : []).filter(
    (l) => l.id && String(l.name || '').trim(),
  );
}

/**
 * @param {{ leaves: ReturnType<typeof createEmptyLeaveRow>[] }} formData
 * @param {number} savedLocationCount
 * @returns {{ message: string, index?: number } | null}
 */
export function validateLeaveForm(formData, savedLocationCount) {
  if (savedLocationCount === 0) {
    return { message: 'Add at least one location under Locations before defining leave policies.' };
  }

  for (let i = 0; i < formData.leaves.length; i += 1) {
    const row = formData.leaves[i];
    if (!row.name || !String(row.name).trim()) {
      return { message: `Leave name is required (policy ${i + 1}).`, index: i };
    }
    if (!isUuid(String(row.id || ''))) {
      return { message: `Invalid id on row ${i + 1}`, index: i };
    }
    if (!isUuid(String(row.locationId || ''))) {
      return {
        message: `Location is required for "${String(row.name).trim() || 'leave type'}".`,
        index: i,
      };
    }
  }

  return null;
}

/**
 * @param {{ leaves: ReturnType<typeof createEmptyLeaveRow>[] }} formData
 */
export function leavesFormToPayload(formData) {
  return {
    leaves: formData.leaves.map((row, idx) => {
      const maxRaw = row.maxCarryForwardDays;
      const maxNum = maxRaw === '' || maxRaw == null ? undefined : Number(maxRaw);
      const preset = row.approvalWorkflowPreset || 'MANAGER_HR_ADMIN';
      const wf = WORKFLOW_BY_PRESET[preset] || WORKFLOW_BY_PRESET.MANAGER_HR_ADMIN;
      const docAfter =
        row.requiresSupportingDocument &&
        row.supportingDocumentAfterDays != null &&
        !Number.isNaN(Number(row.supportingDocumentAfterDays))
          ? Math.round(Number(row.supportingDocumentAfterDays))
          : undefined;

      return {
        id: String(row.id).trim(),
        locationId: String(row.locationId).trim(),
        name: String(row.name).trim(),
        code: row.code?.trim() || undefined,
        description: row.description?.trim() || undefined,
        leaveCategory: row.leaveCategory?.trim() || undefined,
        accrualType: row.accrualType?.trim() || 'MONTHLY',
        encashmentAllowed: !!row.encashmentAllowed,
        negativeBalanceAllowed: !!row.negativeBalanceAllowed,
        supportingDocumentAfterDays: docAfter,
        weekendsCountAsLeave: !!row.weekendsCountAsLeave,
        holidaysCountAsLeave: !!row.holidaysCountAsLeave,
        appliesTo: row.appliesTo?.trim() === 'ALL_BRANCHES' ? 'ALL_BRANCHES' : 'ALL_EMPLOYEES',
        approvalWorkflow: wf.approvalWorkflow,
        isPaid: !!row.isPaid,
        annualEntitlementDays: Number(row.annualEntitlementDays) || 0,
        allowCarryForward: !!row.allowCarryForward,
        maxCarryForwardDays: Number.isFinite(maxNum) ? maxNum : undefined,
        requiresApproval: wf.requiresApproval,
        requiresSupportingDocument: !!row.requiresSupportingDocument,
        allowHalfDay: !!row.allowHalfDay,
        isActive: !!row.isActive,
        sortOrder: idx,
      };
    }),
  };
}

/**
 * @param {Array<Record<string, unknown>>} leaves
 * @param {string} defaultLocId
 * @param {number} savedLocationCount
 */
export function buildInitialLeaveRows(leaves, defaultLocId, savedLocationCount) {
  const list =
    leaves.length > 0
      ? leavesApiToFormRows(leaves, defaultLocId)
      : savedLocationCount > 0
        ? [createEmptyLeaveRow(defaultLocId)]
        : [];

  return list.length > 0 ? list : [createEmptyLeaveRow('')];
}
