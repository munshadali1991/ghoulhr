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
export function RejectExpenseDialog({
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
    if (!open) setReason('');
  }, [open]);

  const trimmed = reason.trim();
  const canConfirm = trimmed.length >= 3;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>
        {isSendBack ? 'Send back for correction' : 'Reject expense claim'}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          required
          multiline
          minRows={3}
          label={isSendBack ? 'Correction notes' : 'Rejection reason'}
          placeholder={
            isSendBack
              ? 'Please correct and resubmit your expense claim...'
              : employeeName
                ? `Why are you rejecting ${employeeName}'s claim?`
                : 'Why are you rejecting this claim?'
          }
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={isPending}
          error={reason.length > 0 && !canConfirm}
          helperText={
            reason.length > 0 && !canConfirm
              ? 'Enter at least 3 characters'
              : 'Required'
          }
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
          onClick={() => onConfirm(trimmed)}
          disabled={isPending || !canConfirm}
        >
          {isSendBack ? 'Send back' : 'Reject'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
