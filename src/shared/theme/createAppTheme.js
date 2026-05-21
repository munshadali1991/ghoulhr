import { createTheme } from '@mui/material/styles';
import { tokens } from './tokens';

function buildSchemePalette(schemeTokens) {
  const { palette, brand, login, card, surfaces } = schemeTokens;
  return {
    ...palette,
    custom: {
      brand,
      login,
      card,
      surfaces,
    },
  };
}

/**
 * Creates the application MUI theme with light/dark color schemes and CSS variables.
 * Toggle later via useColorScheme().setMode('dark') — sets data-theme on <html>.
 */
export function createAppTheme() {
  return createTheme({
    cssVariables: {
      colorSchemeSelector: 'data',
    },
    colorSchemes: {
      light: {
        palette: buildSchemePalette(tokens.light),
      },
      dark: {
        palette: buildSchemePalette(tokens.dark),
      },
    },
    defaultColorScheme: 'light',
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
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: 'var(--mui-palette-background-default)',
            color: 'var(--mui-palette-text-primary)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            border: `1px solid ${theme.palette.custom.card.border}`,
            boxShadow: theme.palette.custom.card.shadow,
          }),
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
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  });
}
