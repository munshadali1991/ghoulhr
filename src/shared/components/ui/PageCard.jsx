import { Card } from '@mui/material';

/**
 * Standard bordered surface card (theme-driven border + shadow).
 * @param {import('@mui/material').CardProps} props
 */
export function PageCard({ elevation = 0, sx, ...props }) {
  return (
    <Card
      elevation={elevation}
      sx={[
        {
          border: '1px solid',
          borderColor: 'divider',
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...props}
    />
  );
}
