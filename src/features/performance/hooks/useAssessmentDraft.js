import { useCallback } from 'react';

const DRAFT_PREFIX = 'ghoulhr_performance_draft';

function draftKey(assessmentId) {
  return `${DRAFT_PREFIX}_${assessmentId || 'default'}`;
}

/**
 * localStorage fallback for unsaved self-assessment answers, keyed per
 * assessment id. Mirrors the onboarding draft pattern.
 */
export function useAssessmentDraft(assessmentId) {
  const saveLocalDraft = useCallback(
    (values) => {
      try {
        localStorage.setItem(
          draftKey(assessmentId),
          JSON.stringify({ savedAt: Date.now(), values }),
        );
        return true;
      } catch {
        return false;
      }
    },
    [assessmentId],
  );

  const loadLocalDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(draftKey(assessmentId));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.values ?? null;
    } catch {
      return null;
    }
  }, [assessmentId]);

  const clearLocalDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey(assessmentId));
    } catch {
      /* ignore */
    }
  }, [assessmentId]);

  return { saveLocalDraft, loadLocalDraft, clearLocalDraft };
}
