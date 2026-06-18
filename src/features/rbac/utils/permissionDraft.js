import { DEFAULT_ACCESS_SCOPE } from '@/features/rbac/constants/accessScopes';

/**
 * Count permission differences between saved and draft states.
 * @param {Array<{ permissionCode: string, accessScope: string }>} saved
 * @param {Array<{ permissionCode: string, accessScope: string }>} draft
 */
export function countPermissionDraftChanges(saved, draft) {
  const savedMap = new Map(saved.map((p) => [p.permissionCode, p.accessScope]));
  const draftMap = new Map(draft.map((p) => [p.permissionCode, p.accessScope]));
  const allCodes = new Set([...savedMap.keys(), ...draftMap.keys()]);
  let changes = 0;

  for (const code of allCodes) {
    const inSaved = savedMap.has(code);
    const inDraft = draftMap.has(code);
    if (inSaved !== inDraft) {
      changes += 1;
      continue;
    }
    if (inSaved && inDraft && savedMap.get(code) !== draftMap.get(code)) {
      changes += 1;
    }
  }

  return changes;
}

/**
 * @param {Array<{ permissionCode: string, accessScope: string }>} [draftPermissions]
 * @param {import('@/features/rbac/types/rbac.types').RbacRoleDetail | undefined} roleDetail
 */
export function permissionsFromDetail(roleDetail) {
  return (roleDetail?.permissions ?? []).map((p) => ({
    permissionCode: p.code,
    accessScope: p.accessScope ?? DEFAULT_ACCESS_SCOPE,
  }));
}
