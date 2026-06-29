import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

/**
 * @param {{
 *   open: boolean,
 *   employeeName?: string,
 *   workDate?: string,
 *   isPending?: boolean,
 *   onConfirm: () => void,
 *   onCancel: () => void,
 * }} props
 */
export function ApproveTimesheetDialog({
  open,
  employeeName,
  workDate,
  isPending = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Approve timesheet</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {employeeName && workDate
            ? `Approve ${employeeName}'s timesheet for ${workDate}?`
            : 'Approve this timesheet day?'}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onConfirm} disabled={isPending}>
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
}
