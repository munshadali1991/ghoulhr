import { StickySaveBar } from '@/shared/components/ui/StickySaveBar';

/**
 * @param {{
 *   isDirty: boolean,
 *   isUpdating: boolean,
 *   canSave: boolean,
 * }} props
 */
export function LocationsSaveBar({ isDirty, isUpdating, canSave }) {
  return (
    <StickySaveBar
      statusText={isDirty ? 'You have unsaved changes.' : 'All changes are saved.'}
      saveType="submit"
      hideDiscard
      isSaving={isUpdating}
      isDirty={isDirty}
      canSave={canSave}
      sticky
    />
  );
}
