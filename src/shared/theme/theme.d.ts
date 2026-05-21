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

  interface CustomPalette {
    brand: BrandTokens;
    login: LoginTokens;
    card: CardTokens;
    surfaces: SurfaceTokens;
  }

  interface Palette {
    custom: CustomPalette;
  }

  interface PaletteOptions {
    custom?: CustomPalette;
  }
}

export type BrandedButtonVariant = 'brand' | 'login' | 'onboarding';

export type AppSnackbarSeverity = 'success' | 'info' | 'warning' | 'error';
