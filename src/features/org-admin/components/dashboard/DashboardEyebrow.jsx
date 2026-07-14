import { Stack, Typography } from '@mui/material';

/**
 * Uppercase card eyebrow for HR dashboard widgets.
 * @param {{ icon?: import('react').ReactNode, children: import('react').ReactNode, sx?: object }} props
 */
export function DashboardEyebrow({ icon, children, sx }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        mb: 2,
        ...sx,
      }}
    >
      {icon ? (
        <Typography
          component="span"
          sx={{ display: 'inline-flex', color: 'text.disabled', '& > svg': { fontSize: 16 } }}
        >
          {icon}
        </Typography>
      ) : null}
      <Typography
        component="p"
        sx={{
          m: 0,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: 'text.secondary',
        }}
      >
        {children}
      </Typography>
    </Stack>
  );
}
