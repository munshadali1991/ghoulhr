import { useMediaQuery, useTheme } from '@mui/material';

/** True below MUI `md` breakpoint (900px). */
export function useIsMobileLayout() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('md'));
}
