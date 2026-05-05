import { createTheme } from '@mui/material';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0F172A', // Slate 900
      light: '#1E293B', // Slate 800
      dark: '#020617', // Slate 950
    },
    secondary: {
      main: '#3B82F6', // Blue 500
    },
    success: {
      main: '#10B981', // Emerald 500
    },
    warning: {
      main: '#F59E0B', // Amber 500
    },
    error: {
      main: '#EF4444', // Red 500
    },
    background: {
      default: '#F8FAFC', // Slate 50
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B', // Slate 500
    },
    divider: '#E2E8F0', // Slate 200
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    h4: { fontWeight: 600, letterSpacing: '-0.02em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 500 },
    body2: { lineHeight: 1.6 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});
