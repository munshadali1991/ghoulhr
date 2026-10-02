import { Alert, Snackbar } from '@mui/material';

const DEFAULT_ANCHOR = { vertical: 'bottom', horizontal: 'right' };

/**
 * @param {{
 *   open: boolean;
 *   message: string;
 *   severity?: import('../../theme/theme').AppSnackbarSeverity;
 *   onClose: () => void;
 *   anchorOrigin?: import('@mui/material').SnackbarProps['anchorOrigin'];
 *   filled?: boolean;
 *   autoHideDuration?: number;
 *   icon?: import('react').ReactNode;
 *   sx?: import('@mui/material').SxProps;
 * }} props
 */
export function AppSnackbar({
  open,
  message,
  severity = 'success',
  onClose,
  anchorOrigin = DEFAULT_ANCHOR,
  filled = false,
  autoHideDuration = 4000,
  icon,
  sx,
}) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      sx={sx}
    >
      <Alert
        severity={severity}
        variant={filled ? 'filled' : 'standard'}
        onClose={onClose}
        icon={icon}
        sx={{ width: '100%', ...(filled ? { boxShadow: 3 } : {}) }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
