import { useCallback, useState } from 'react';

/**
 * @returns {{
 *   snackbar: { open: boolean; message: string; severity: import('../theme/theme').AppSnackbarSeverity };
 *   show: (message: string, severity?: import('../theme/theme').AppSnackbarSeverity) => void;
 *   close: () => void;
 * }}
 */
export function useAppSnackbar() {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const show = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const close = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return { snackbar, show, close };
}
