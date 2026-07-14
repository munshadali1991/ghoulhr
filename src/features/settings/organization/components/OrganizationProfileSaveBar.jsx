import { StickySaveBar } from '@/shared/components/ui/StickySaveBar';

/**
 * @param {{
 *   hasChanges: boolean,
 *   isSaving: boolean,
 *   onSave: () => void,
 *   onDiscard: () => void,
 * }} props
 */
export function OrganizationProfileSaveBar({ hasChanges, isSaving, onSave, onDiscard }) {
  return (
    <StickySaveBar
      statusText={hasChanges ? 'You have unsaved changes' : 'No unsaved changes'}
      onSave={onSave}
      onDiscard={onDiscard}
      isSaving={isSaving}
      isDirty={hasChanges}
      sticky={false}
    />
  );
}
