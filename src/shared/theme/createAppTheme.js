import { createTheme } from '@mui/material/styles';
import { buttonSizes, tokens } from './tokens';

function buildSchemePalette(schemeTokens) {
  const { palette, brand, login, card, surfaces, accent, chart, attendance, metrics, crud } =
    schemeTokens;
  return {
    ...palette,
    custom: {
      brand,
      login,
      card,
      surfaces,
      accent,
      chart,
      attendance,
      metrics,
      crud,
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
    // Custom app tokens (not part of MUI palette)
    appButtonSizes: buttonSizes,
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
        defaultProps: {
          size: 'medium',
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
          },
          sizeSmall: {
            height: buttonSizes.small.height,
            paddingLeft: buttonSizes.small.px,
            paddingRight: buttonSizes.small.px,
          },
          sizeMedium: {
            height: buttonSizes.medium.height,
            paddingLeft: buttonSizes.medium.px,
            paddingRight: buttonSizes.medium.px,
          },
          sizeLarge: {
            height: buttonSizes.large.height,
            paddingLeft: buttonSizes.large.px,
            paddingRight: buttonSizes.large.px,
          },
        },
      },
      MuiIconButton: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            '&.MuiTableCell-paddingCheckbox': {
              width: 48,
            },
          },
          body: {
            '&.table-actions-cell': {
              width: 1,
              whiteSpace: 'nowrap',
              paddingLeft: 8,
              paddingRight: 8,
            },
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
