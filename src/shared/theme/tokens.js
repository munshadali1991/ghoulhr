/**
 * Design tokens — single source of truth for raw colors and semantic values.
 * Change colors here; map them in createAppTheme.js.
 *
 * @typedef {'light' | 'dark'} ColorScheme
 */

/** Button height / horizontal padding scale (px). Used by MuiButton + BrandedButton. */
export const buttonSizes = {
  small: { height: 32, px: 12 },
  medium: { height: 40, px: 16 },
  large: { height: 48, px: 24 },
};

/** @type {Record<ColorScheme, object>} */
export const tokens = {
  light: {
    palette: {
      primary: {
        main: '#0F172A',
        light: '#1E293B',
        dark: '#020617',
      },
      secondary: {
        main: '#3B82F6',
      },
      success: {
        main: '#10B981',
      },
      warning: {
        main: '#F59E0B',
        light: '#FCD34D',
        dark: '#D97706',
      },
      error: {
        main: '#EF4444',
      },
      background: {
        default: '#F8FAFC',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#0F172A',
        secondary: '#64748B',
      },
      divider: '#E2E8F0',
    },
    brand: {
      gradientStart: '#667eea',
      gradientEnd: '#764ba2',
      gradientPrimary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      gradientLogin: 'linear-gradient(160deg, #3f51e8 0%, #6577ff 100%)',
      gradientLoginButton: 'linear-gradient(120deg, #3f51e8 0%, #6577ff 100%)',
      gradientOnboarding: 'linear-gradient(135deg, #2563eb 0%, #1e3a5f 100%)',
      onBrand: '#FFFFFF',
      onBrandMuted: 'rgba(255, 255, 255, 0.9)',
      chipOnBrand: 'rgba(255, 255, 255, 0.2)',
      chipOnBrandSoft: 'rgba(255, 255, 255, 0.18)',
      decorativeOrb: 'rgba(255, 255, 255, 0.15)',
      decorativeOrbSoft: 'rgba(255, 255, 255, 0.12)',
    },
    login: {
      pageBackground:
        'radial-gradient(1000px 400px at 0% 0%, rgba(99,118,255,0.16), transparent), radial-gradient(800px 400px at 100% 100%, rgba(103,58,183,0.14), transparent)',
      cardBorder: 'rgba(63, 81, 232, 0.14)',
      cardShadow: '0 30px 60px rgba(26, 39, 95, 0.12)',
    },
    card: {
      border: '#E2E8F0',
      shadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    },
    surfaces: {
      draftBarShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)',
      subtle: '#F9FAFB',
      muted: '#F3F4F6',
      inset: 'rgba(0, 0, 0, 0.04)',
      progressTrack: '#E5E7EB',
      wash: '#F9FAFB',
    },
    accent: {
      teal: '#17a2b8',
      response: '#e57373',
      comment: '#66bb6a',
    },
    chart: {
      balance: '#90CAF9',
      consumed: '#EF9A9A',
    },
    attendance: {
      tableHead: '#f0f7ff',
    },
    metrics: {
      strip: '#FFF8E1',
    },
    crud: {
      create: '#10B981',
      view: '#3B82F6',
      update: '#F59E0B',
      delete: '#EF4444',
    },
  },
  dark: {
    palette: {
      primary: {
        main: '#F8FAFC',
        light: '#FFFFFF',
        dark: '#E2E8F0',
      },
      secondary: {
        main: '#60A5FA',
      },
      success: {
        main: '#34D399',
      },
      warning: {
        main: '#FBBF24',
      },
      error: {
        main: '#F87171',
      },
      background: {
        default: '#0F172A',
        paper: '#1E293B',
      },
      text: {
        primary: '#F8FAFC',
        secondary: '#94A3B8',
      },
      divider: '#334155',
    },
    brand: {
      gradientStart: '#818cf8',
      gradientEnd: '#a78bfa',
      gradientPrimary: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
      gradientLogin: 'linear-gradient(160deg, #4f5fd4 0%, #7b8cff 100%)',
      gradientLoginButton: 'linear-gradient(120deg, #4f5fd4 0%, #7b8cff 100%)',
      gradientOnboarding: 'linear-gradient(135deg, #3b82f6 0%, #1e3a5f 100%)',
      onBrand: '#FFFFFF',
      onBrandMuted: 'rgba(255, 255, 255, 0.9)',
      chipOnBrand: 'rgba(255, 255, 255, 0.2)',
      chipOnBrandSoft: 'rgba(255, 255, 255, 0.18)',
      decorativeOrb: 'rgba(255, 255, 255, 0.1)',
      decorativeOrbSoft: 'rgba(255, 255, 255, 0.08)',
    },
    login: {
      pageBackground:
        'radial-gradient(1000px 400px at 0% 0%, rgba(99,118,255,0.12), transparent), radial-gradient(800px 400px at 100% 100%, rgba(103,58,183,0.1), transparent)',
      cardBorder: 'rgba(129, 140, 248, 0.2)',
      cardShadow: '0 30px 60px rgba(0, 0, 0, 0.35)',
    },
    card: {
      border: '#334155',
      shadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
    },
    surfaces: {
      draftBarShadow: '0 -4px 12px rgba(0, 0, 0, 0.25)',
      subtle: '#1E293B',
      muted: '#334155',
      inset: 'rgba(255, 255, 255, 0.06)',
      progressTrack: '#475569',
      wash: '#1E293B',
    },
    accent: {
      teal: '#22d3ee',
      response: '#f87171',
      comment: '#4ade80',
    },
    chart: {
      balance: '#60A5FA',
      consumed: '#F87171',
    },
    attendance: {
      tableHead: '#1e3a5f',
    },
    metrics: {
      strip: '#422006',
    },
    crud: {
      create: '#34D399',
      view: '#60A5FA',
      update: '#FBBF24',
      delete: '#F87171',
    },
  },
};
