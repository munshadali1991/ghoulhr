import { StickySaveBar } from '@/shared/components/ui/StickySaveBar';

/**
 * @param {{
 *   isDirty: boolean,
 *   isUpdating: boolean,
 *   onReset: () => void,
 * }} props
 */
export function EmployeeSettingsSaveBar({ isDirty, isUpdating, onReset }) {
  return (
    <StickySaveBar
      statusText={isDirty ? 'Unsaved changes detected' : 'No unsaved changes'}
      onDiscard={onReset}
      discardLabel="Reset"
      saveType="submit"
      isSaving={isUpdating}
      isDirty={isDirty}
      sticky={false}
    />
  );
}
