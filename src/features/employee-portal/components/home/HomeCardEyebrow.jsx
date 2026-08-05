import { Stack, Typography } from '@mui/material';

/**
 * Uppercase card eyebrow for employee home widgets.
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
      <Typography variant="overline" component="p" color="text.secondary" sx={{ m: 0, letterSpacing: '0.05em' }}>
        {children}
      </Typography>
    </Stack>
  );
}
