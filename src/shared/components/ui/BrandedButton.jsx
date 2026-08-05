/**
 * Contained button using brand gradient tokens.
 * Use ONLY for auth / onboarding / marketing surfaces.
 * For in-app CRUD (Add, Save, Edit, Delete) use CrudButton instead.
 *
 * @param {{ brandVariant?: 'brand' | 'login' | 'onboarding' } & import('@mui/material').ButtonProps} props
 */
import { Button } from '@mui/material';
import { buttonSizes } from '@/shared/theme/tokens';

const GRADIENT_BY_VARIANT = {
  brand: (theme) => theme.palette.custom.brand.gradientPrimary,
  login: (theme) => theme.palette.custom.brand.gradientLoginButton,
  onboarding: (theme) => theme.palette.custom.brand.gradientOnboarding,
};

export function BrandedButton({
  brandVariant = 'brand',
  size = 'medium',
  sx,
  ...props
}) {
  const resolveGradient = GRADIENT_BY_VARIANT[brandVariant] ?? GRADIENT_BY_VARIANT.brand;
  const sizeToken = buttonSizes[size] ?? buttonSizes.medium;

  const { variant: _ignoredVariant, ...rest } = props;

  return (
    <Button
      variant="contained"
      size={size}
      sx={[
        {
          fontWeight: 600,
          height: sizeToken.height,
          px: `${sizeToken.px}px`,
          background: resolveGradient,
          color: (theme) => theme.palette.custom.brand.onBrand,
          boxShadow: 'none',
          '&:hover': {
            background: resolveGradient,
            filter: 'brightness(0.95)',
            boxShadow: 'none',
          },
          '&.Mui-disabled': {
            background: resolveGradient,
            color: (theme) => theme.palette.custom.brand.onBrand,
            opacity: 0.5,
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...rest}
    />
  );
}
