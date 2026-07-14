import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface BrandTokens {
    gradientStart: string;
    gradientEnd: string;
    gradientPrimary: string;
    gradientLogin: string;
    gradientLoginButton: string;
    gradientOnboarding: string;
    onBrand: string;
    onBrandMuted: string;
    chipOnBrand: string;
    chipOnBrandSoft: string;
    decorativeOrb: string;
    decorativeOrbSoft: string;
  }

  interface LoginTokens {
    pageBackground: string;
    cardBorder: string;
    cardShadow: string;
  }

  interface CardTokens {
    border: string;
    shadow: string;
  }

  interface SurfaceTokens {
    draftBarShadow: string;
    subtle: string;
    muted: string;
    inset: string;
    progressTrack: string;
    wash: string;
  }

  interface AccentTokens {
    teal: string;
    response: string;
    comment: string;
  }

  interface ChartTokens {
    balance: string;
    consumed: string;
  }

  interface AttendanceTokens {
    tableHead: string;
  }

  interface MetricsTokens {
    strip: string;
  }

  interface CrudTokens {
    create: string;
    view: string;
    update: string;
    delete: string;
  }

  interface CustomPalette {
    brand: BrandTokens;
    login: LoginTokens;
    card: CardTokens;
    surfaces: SurfaceTokens;
    accent: AccentTokens;
    chart: ChartTokens;
    attendance: AttendanceTokens;
    metrics: MetricsTokens;
    crud: CrudTokens;
  }

  interface Palette {
    custom: CustomPalette;
  }

  interface PaletteOptions {
    custom?: CustomPalette;
  }

  interface ButtonSizeToken {
    height: number;
    px: number;
  }

  interface Theme {
    appButtonSizes: {
      small: ButtonSizeToken;
      medium: ButtonSizeToken;
      large: ButtonSizeToken;
    };
  }

  interface ThemeOptions {
    appButtonSizes?: {
      small: ButtonSizeToken;
      medium: ButtonSizeToken;
      large: ButtonSizeToken;
    };
  }
}

export type BrandedButtonVariant = 'brand' | 'login' | 'onboarding';

export type AppSnackbarSeverity = 'success' | 'info' | 'warning' | 'error';
