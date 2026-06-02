import { Stack } from '@mui/material';
import { BrandedButton } from '@/shared/components/ui/BrandedButton';

/**
 * @param {{
 *   editable: boolean,
 *   isSaving: boolean,
 *   canSubmit: boolean,
 *   onSaveDraft: () => void,
 *   onSubmit: () => void,
 * }} props
 */
export function TimesheetDayActions({
  editable,
  isSaving,
  canSubmit,
  onSaveDraft,
  onSubmit,
}) {
  if (!editable) return null;

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      justifyContent="flex-end"
      sx={{
        position: { xs: 'sticky', sm: 'static' },
        bottom: { xs: 0, sm: 'auto' },
        py: { xs: 2, sm: 0 },
        bgcolor: { xs: 'background.default', sm: 'transparent' },
        borderTop: { xs: 1, sm: 0 },
        borderColor: 'divider',
        mt: 2,
      }}
    >
      <BrandedButton
        variant="outlined"
        onClick={onSaveDraft}
        disabled={isSaving}
        fullWidth
        sx={{ display: { sm: 'inline-flex' }, width: { sm: 'auto' } }}
      >
        Save as draft
      </BrandedButton>
      <BrandedButton
        onClick={onSubmit}
        disabled={isSaving || !canSubmit}
        fullWidth
        sx={{ display: { sm: 'inline-flex' }, width: { sm: 'auto' } }}
      >
        Submit timesheet
      </BrandedButton>
    </Stack>
  );
}
