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
 *   claimNumber?: string,
 *   isPending?: boolean,
 *   onConfirm: (notes: string) => void,
 *   onCancel: () => void,
 * }} props
 */
export function ApproveExpenseDialog({
  open,
  employeeName,
  claimNumber,
  isPending = false,
  onConfirm,
  onCancel,
}) {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) setNotes('');
  }, [open]);

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Approve expense claim</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={2}
          label="Approver notes (optional)"
          placeholder={
            employeeName && claimNumber
              ? `Notes for ${employeeName}'s claim ${claimNumber}`
              : 'Optional notes for finance / employee'
          }
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
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
          color="success"
          onClick={() => onConfirm(notes.trim())}
          disabled={isPending}
        >
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
}
