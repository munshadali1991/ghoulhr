import { Box, Grid, Typography } from '@mui/material';

/**
 * @param {{
 *   label: string,
 *   required?: boolean,
 *   hint?: string,
 *   children: import('react').ReactNode,
 * }} props
 */
export function FormLabelRow({ label, required, hint, children }) {
  return (
    <Grid
      container
      columnSpacing={{ xs: 0, sm: 3 }}
      rowSpacing={0}
      alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
      sx={{
        py: 2.25,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <Grid size={{ xs: 12, sm: 3, md: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', pt: { sm: 0.75 } }}>
          {label}
          {required ? (
            <Typography component="span" color="error.main" sx={{ ml: 0.25 }} aria-hidden>
              *
            </Typography>
          ) : null}
        </Typography>
        {hint ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.45 }}>
            {hint}
          </Typography>
        ) : null}
      </Grid>
      <Grid size={{ xs: 12, sm: 9, md: 9 }} sx={{ minWidth: { xs: 0, sm: 260 } }}>
        {children}
      </Grid>
    </Grid>
  );
}
