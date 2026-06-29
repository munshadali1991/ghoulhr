import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { Can } from '@/features/auth/components/Can';

/**
 * @param {{
 *   selectedCount: number,
 *   pendingInViewCount: number,
 *   isPending?: boolean,
 *   onApproveSelected: () => void,
 *   onApproveAllPending: () => void,
 * }} props
 */
export function TimesheetBulkApproveBar({
  selectedCount,
  pendingInViewCount,
  isPending = false,
  onApproveSelected,
  onApproveAllPending,
}) {
  if (selectedCount === 0 && pendingInViewCount === 0) return null;

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'sticky',
        bottom: { xs: 8, md: 16 },
        zIndex: 3,
        p: 1.5,
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
      >
        <Typography variant="body2" fontWeight={600}>
          {selectedCount > 0
            ? `${selectedCount} timesheet(s) selected`
            : `${pendingInViewCount} pending in current view`}
        </Typography>
        <Can permission="approvals.timesheet:act">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {selectedCount > 0 ? (
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleOutlineRoundedIcon />}
                disabled={isPending}
                onClick={onApproveSelected}
                fullWidth
              >
                Approve selected ({selectedCount})
              </Button>
            ) : null}
            {pendingInViewCount > 0 ? (
              <Button
                variant={selectedCount > 0 ? 'outlined' : 'contained'}
                color="success"
                disabled={isPending}
                onClick={onApproveAllPending}
                fullWidth
              >
                Approve all pending in range ({pendingInViewCount})
              </Button>
            ) : null}
          </Stack>
        </Can>
      </Stack>
    </Paper>
  );
}
