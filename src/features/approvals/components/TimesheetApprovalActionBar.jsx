import { Button, Stack } from '@mui/material';
import { Can } from '@/features/auth/components/Can';

/**
 * @param {{
 *   onApprove: () => void,
 *   onReject: () => void,
 *   disabled?: boolean,
 * }} props
 */
export function TimesheetApprovalActionBar({ onApprove, onReject, disabled }) {
  return (
    <Can permission="approvals.timesheet:act">
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="flex-end">
        <Button variant="outlined" color="error" onClick={onReject} disabled={disabled}>
          Reject
        </Button>
        <Button variant="contained" onClick={onApprove} disabled={disabled}>
          Approve
        </Button>
      </Stack>
    </Can>
  );
}
