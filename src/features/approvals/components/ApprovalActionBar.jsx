import { Button, Stack } from '@mui/material';
import { Can } from '@/features/auth/components/Can';

/**
 * @param {{
 *   onApprove: () => void,
 *   onSendBack: () => void,
 *   onReject: () => void,
 *   disabled?: boolean,
 * }} props
 */
export function ApprovalActionBar({ onApprove, onSendBack, onReject, disabled }) {
  return (
    <Can permission="approvals.leave:act">
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="flex-end">
        <Button variant="outlined" color="warning" onClick={onSendBack} disabled={disabled}>
          Send back
        </Button>
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
