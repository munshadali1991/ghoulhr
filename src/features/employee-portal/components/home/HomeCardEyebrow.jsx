import { Stack, Typography } from '@mui/material';

/**
 * Design.md-style uppercase card eyebrow for employee home widgets.
 * @param {{ icon?: import('react').ReactNode, children: import('react').ReactNode, sx?: object }} props
 */
export function HomeCardEyebrow({ icon, children, sx }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        mb: 2.25,
        ...sx,
      }}
    >
      {icon ? (
        <Typography component="span" sx={{ display: 'inline-flex', color: 'text.disabled', '& > svg': { fontSize: 16 } }}>
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
