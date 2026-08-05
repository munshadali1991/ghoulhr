import { Box } from '@mui/material';
import { StickySaveBar } from '@/shared/components/ui/StickySaveBar';

/**
 * @param {{
 *   hasChanges: boolean,
 *   isSaving: boolean,
 *   onSave: () => void,
 *   onDiscard: () => void,
 *   validationIssues?: string[],
 *   readOnly?: boolean,
 * }} props
 */
export function PerformanceSaveBar({
  hasChanges,
  isSaving,
  onSave,
  onDiscard,
  validationIssues = [],
  readOnly = false,
}) {
  if (readOnly) {
    return null;
  }

  const isValid = validationIssues.length === 0;
  const issueTooltip = validationIssues.length
    ? validationIssues.map((issue, index) => `${index + 1}. ${issue}`).join('\n')
    : '';

  const statusText = hasChanges
    ? isValid
      ? 'You have unsaved changes — save to apply them to new assessments.'
      : `${validationIssues.length} issue${validationIssues.length === 1 ? '' : 's'} to fix before saving.`
    : 'All changes saved.';

  return (
    <StickySaveBar
      statusText={statusText}
      onSave={onSave}
      onDiscard={onDiscard}
      saveLabel="Save master"
      isSaving={isSaving}
      isDirty={hasChanges}
      sticky
      saveTooltip={
        !isValid && hasChanges ? (
          <Box component="span" sx={{ whiteSpace: 'pre-line' }}>
            {issueTooltip}
          </Box>
        ) : undefined
      }
    />
  );
}
