import { Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

/**
 * Standard load / form / success / warning alerts for settings forms.
 *
 * @param {{
 *   loadError?: { message?: string } | null;
 *   loadErrorMessage?: string;
 *   formError?: string | null;
 *   onDismissFormError?: () => void;
 *   successMessage?: string | null;
 *   successIcon?: import('react').ReactNode;
 *   warning?: import('react').ReactNode;
 *   warningIcon?: import('react').ReactNode;
 *   dense?: boolean;
 * }} props
 */
export function FormStatusAlerts({
  loadError,
  loadErrorMessage = 'Failed to load settings. Please try again.',
  formError,
  onDismissFormError,
  successMessage,
  successIcon = <CheckCircleIcon fontSize="inherit" />,
  warning,
  warningIcon,
  dense = false,
}) {
  const mb = dense ? 2 : 3;

  return (
    <>
      {loadError ? (
        <Alert severity="error" sx={{ mb }}>
          {loadError.message || loadErrorMessage}
        </Alert>
      ) : null}

      {formError ? (
        <Alert
          severity="error"
          sx={{ mb }}
          onClose={onDismissFormError}
        >
          {formError}
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert severity="success" sx={{ mb }} icon={successIcon}>
          {successMessage}
        </Alert>
      ) : null}

      {warning ? (
        <Alert severity="warning" sx={{ mb }} icon={warningIcon}>
          {warning}
        </Alert>
      ) : null}
    </>
  );
}
