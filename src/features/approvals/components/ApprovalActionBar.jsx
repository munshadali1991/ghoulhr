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
export function ApprovalActionBar({
  onApprove,
  onSendBack,
  onReject,
  disabled,
  permission = 'approvals.leave:act',
  showSendBack = true,
}) {
  return (
    <Can permission={permission}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="flex-end">
        {showSendBack ? (
          <Button variant="outlined" color="warning" onClick={onSendBack} disabled={disabled}>
            Send back
          </Button>
        ) : null}
        <Button variant="outlined" color="error" onClick={onReject} disabled={disabled}>
          Reject
        </Button>
        <Button variant="contained" color="success" onClick={onApprove} disabled={disabled}>
          Approve
        </Button>
      </Stack>
    </Can>
  );
}
