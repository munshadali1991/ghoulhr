import { Card, CardContent } from '@mui/material';

/**
 * Gradient hero / welcome banner card.
 * @param {import('@mui/material').CardProps & { children: import('react').ReactNode }} props
 */
export function HeroBanner({ children, sx, ...cardProps }) {
  return (
    <Card
      elevation={0}
      sx={[
        {
          border: '1px solid',
          borderColor: 'divider',
          mb: 2,
          background: (theme) => theme.palette.custom.brand.gradientPrimary,
          color: (theme) => theme.palette.custom.brand.onBrand,
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...cardProps}
    >
      <CardContent>{children}</CardContent>
    </Card>
  );
}
