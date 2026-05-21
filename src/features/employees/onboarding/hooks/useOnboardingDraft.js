import { useCallback } from 'react';
import { DRAFT_STORAGE_PREFIX, normalizeGender } from '../constants';

function draftKey(organizationId) {
  return `${DRAFT_STORAGE_PREFIX}_${organizationId || 'default'}`;
}

export function useOnboardingDraft(organizationId, getValues, reset) {
  const saveDraftNow = useCallback(() => {
    try {
      const raw = JSON.stringify({ savedAt: Date.now(), values: getValues() });
      localStorage.setItem(draftKey(organizationId), raw);
      return true;
    } catch {
      return false;
    }
  }, [organizationId, getValues]);

  const loadDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(draftKey(organizationId));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.values ?? null;
    } catch {
      return null;
    }
  }, [organizationId]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey(organizationId));
    } catch {
      /* ignore */
    }
  }, [organizationId]);

  const resumeDraft = useCallback(() => {
    const values = loadDraft();
    if (!values) return false;
    reset({
      ...values,
      basic: { ...(values.basic || {}), gender: normalizeGender(values.basic?.gender) },
    });
    return true;
  }, [loadDraft, reset]);

  return { saveDraftNow, loadDraft, clearDraft, resumeDraft };
}
