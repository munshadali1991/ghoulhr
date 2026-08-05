import { createTheme } from '@mui/material/styles';
import { buttonSizes, responsiveFontSize, tokens, typographyScale } from './tokens';

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
      h4: {
        ...responsiveFontSize(typographyScale.h4),
        fontWeight: 600,
        letterSpacing: '-0.02em',
        lineHeight: 1.25,
      },
      h5: {
        ...responsiveFontSize(typographyScale.h5),
        fontWeight: 600,
        letterSpacing: '-0.01em',
        lineHeight: 1.25,
      },
      h6: {
        ...responsiveFontSize(typographyScale.h6),
        fontWeight: 600,
        letterSpacing: '-0.01em',
        lineHeight: 1.3,
      },
      subtitle1: {
        ...responsiveFontSize(typographyScale.subtitle1),
        fontWeight: 500,
      },
      subtitle2: {
        ...responsiveFontSize(typographyScale.subtitle2),
        fontWeight: 600,
        lineHeight: 1.35,
      },
      body1: {
        ...responsiveFontSize(typographyScale.body1),
      },
      body2: {
        ...responsiveFontSize(typographyScale.body2),
        lineHeight: 1.6,
      },
      caption: {
        ...responsiveFontSize(typographyScale.caption),
        lineHeight: 1.4,
      },
      overline: {
        ...responsiveFontSize(typographyScale.overline),
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        lineHeight: 1.4,
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: 500,
        textTransform: 'none',
      },
      // Custom variants — use with Typography variant="metric" | "metricLarge" | "micro"
      metric: {
        ...responsiveFontSize(typographyScale.metric),
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.1,
      },
      metricLarge: {
        ...responsiveFontSize(typographyScale.metricLarge),
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.1,
        letterSpacing: '0.01em',
      },
      micro: {
        ...responsiveFontSize(typographyScale.micro),
        lineHeight: 1.3,
        color: 'inherit',
      },
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
      MuiTypography: {
        defaultProps: {
          variantMapping: {
            metric: 'p',
            metricLarge: 'p',
            micro: 'span',
          },
        },
      },
    },
  });
}
