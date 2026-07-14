import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onConfirm: () => void,
 * }} props
 */
export function NavigationConfirmDialog({ open, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Discard unsaved changes?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          You have unsaved changes to the performance master. Leave without saving?
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Stay</Button>
        <Button color="error" variant="contained" onClick={onConfirm}>
          Leave without saving
        </Button>
      </DialogActions>
    </Dialog>
  );
}
