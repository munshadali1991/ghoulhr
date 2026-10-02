import { Stack, Typography } from '@mui/material';
import { CrudButton } from '@/shared/components/ui/CrudButton';

/**
 * Sticky-on-mobile submit bar for expense claims (mirrors TimesheetDayActions).
 * @param {{
 *   editable: boolean,
 *   isSaving: boolean,
 *   canSubmit: boolean,
 *   onSubmit: () => void,
 *   helperText?: string,
 * }} props
 */
export function ExpenseClaimActions({
  editable,
  isSaving,
  canSubmit,
  onSubmit,
  helperText,
}) {
  if (!editable) return null;

  return (
    <Stack
      spacing={1}
      alignItems={{ xs: 'stretch', sm: 'flex-end' }}
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
        Submit for approval
      </CrudButton>
      {helperText ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: { sm: 'right' } }}>
          {helperText}
        </Typography>
      ) : null}
    </Stack>
  );
}
