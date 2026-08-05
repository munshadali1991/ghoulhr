import { Stack } from '@mui/material';
import { CrudButton } from '@/shared/components/ui/CrudButton';

/**
 * @param {{
 *   editable: boolean,
 *   isSaving: boolean,
 *   canSubmit: boolean,
 *   onSubmit: () => void,
 * }} props
 */
export function TimesheetDayActions({
  editable,
  isSaving,
  canSubmit,
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
      <CrudButton
        intent="save"
        onClick={onSubmit}
        disabled={isSaving || !canSubmit}
        fullWidth
        sx={{ display: { sm: 'inline-flex' }, width: { sm: 'auto' } }}
      >
        Submit timesheet
      </CrudButton>
    </Stack>
  );
}
