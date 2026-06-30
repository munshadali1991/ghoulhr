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
 *   mode?: 'reject' | 'sendBack',
 *   employeeName?: string,
 *   isPending?: boolean,
 *   onConfirm: (reason: string) => void,
 *   onCancel: () => void,
 * }} props
 */
export function RejectLeaveDialog({
  open,
  mode = 'reject',
  employeeName,
  isPending = false,
  onConfirm,
  onCancel,
}) {
  const [reason, setReason] = useState('');
  const isSendBack = mode === 'sendBack';

  useEffect(() => {
    if (!open) {
      setReason('');
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm(reason.trim());
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{isSendBack ? 'Send back for correction' : 'Reject leave request'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={3}
          label={isSendBack ? 'Correction notes' : 'Reason (optional)'}
          placeholder={
            isSendBack
              ? 'Please correct and resubmit your leave request...'
              : employeeName
                ? `Why are you rejecting ${employeeName}'s leave request?`
                : 'Why are you rejecting this leave request?'
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
          onClick={handleConfirm}
          disabled={isPending}
        >
          {isSendBack ? 'Send back' : 'Reject'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
