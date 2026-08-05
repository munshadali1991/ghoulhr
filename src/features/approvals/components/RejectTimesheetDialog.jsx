import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

/**
 * @param {{
 *   open: boolean,
 *   employeeName?: string,
 *   isPending?: boolean,
 *   onConfirm: (reason: string) => void,
 *   onCancel: () => void,
 * }} props
 */
export function RejectTimesheetDialog({
  open,
  employeeName,
  isPending = false,
  onConfirm,
  onCancel,
}) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) {
      setReason('');
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Reject timesheet</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={3}
          label="Reason (optional)"
          placeholder={
            employeeName
              ? `Why are you rejecting ${employeeName}'s timesheet?`
              : 'Why are you rejecting this timesheet?'
          }
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={isPending}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => onConfirm(reason.trim())}
          disabled={isPending}
        >
          Reject
        </Button>
      </DialogActions>
    </Dialog>
  );
}
