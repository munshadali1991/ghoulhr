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
 *   leaveType?: string,
 *   isPending?: boolean,
 *   onConfirm: (notes: string) => void,
 *   onCancel: () => void,
 * }} props
 */
export function ApproveLeaveDialog({
  open,
  employeeName,
  leaveType,
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
      <DialogTitle>Approve leave request</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={2}
          label="Approver notes (optional)"
          placeholder={
            employeeName && leaveType
              ? `Notes for ${employeeName}'s ${leaveType} request`
              : 'Optional notes for the employee'
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
        <Button variant="contained" onClick={() => onConfirm(notes.trim())} disabled={isPending}>
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
}
