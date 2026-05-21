import { Button } from '@mui/material';

const GRADIENT_BY_VARIANT = {
  brand: (theme) => theme.palette.custom.brand.gradientPrimary,
  login: (theme) => theme.palette.custom.brand.gradientLoginButton,
  onboarding: (theme) => theme.palette.custom.brand.gradientOnboarding,
};

/**
 * Contained button using brand gradient tokens.
 * @param {{ brandVariant?: 'brand' | 'login' | 'onboarding' } & import('@mui/material').ButtonProps} props
 */
export function BrandedButton({ brandVariant = 'brand', sx, ...props }) {
  const resolveGradient = GRADIENT_BY_VARIANT[brandVariant] ?? GRADIENT_BY_VARIANT.brand;

  return (
    <Button
      variant="contained"
      sx={[
        {
          fontWeight: 600,
          background: resolveGradient,
          color: (theme) => theme.palette.custom.brand.onBrand,
          '&:hover': {
            background: resolveGradient,
            filter: 'brightness(0.95)',
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...props}
    />
  );
}
