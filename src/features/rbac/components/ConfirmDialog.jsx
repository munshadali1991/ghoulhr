import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { CrudButton } from '@/shared/components/ui/CrudButton';

/**
 * @param {{
 *   open: boolean,
 *   title: string,
 *   message: string,
 *   confirmLabel?: string,
 *   cancelLabel?: string,
 *   confirmColor?: 'primary' | 'error' | 'warning',
 *   isPending?: boolean,
 *   onConfirm: () => void,
 *   onCancel: () => void,
 * }} props
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'primary',
  isPending = false,
  onConfirm,
  onCancel,
}) {
  const isDestructive = confirmColor === 'error';
  const isWarning = confirmColor === 'warning';

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onCancel} disabled={isPending}>
          {cancelLabel}
        </Button>
        {isDestructive || isWarning ? (
          <Button
            variant="contained"
            color={confirmColor}
            onClick={onConfirm}
            disabled={isPending}
          >
            {confirmLabel}
          </Button>
        ) : (
          <CrudButton intent="save" onClick={onConfirm} disabled={isPending}>
            {confirmLabel}
          </CrudButton>
        )}
      </DialogActions>
    </Dialog>
  );
}
