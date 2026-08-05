import { Box, Grid, Typography } from '@mui/material';

/**
 * @param {{
 *   label: string,
 *   required?: boolean,
 *   hint?: string,
 *   divider?: boolean,
 *   fullWidth?: boolean,
 *   children: import('react').ReactNode,
 * }} props
 */
export function FormLabelRow({
  label,
  required,
  hint,
  divider = true,
  fullWidth = false,
  children,
}) {
  return (
    <Grid
      container
      columnSpacing={{ xs: 0, md: 3 }}
      rowSpacing={{ xs: 1, md: 0 }}
      alignItems="flex-start"
      sx={{
        py: { xs: 1.75, sm: 2.25 },
        px: { xs: 1.5, sm: 2.5 },
        borderBottom: divider ? '1px solid' : 'none',
        borderColor: 'divider',
      }}
    >
      <Grid size={{ xs: 12, md: 3 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            pt: { md: 0.875 },
            lineHeight: 1.4,
          }}
        >
          {label}
          {required ? (
            <Typography component="span" color="error.main" sx={{ ml: 0.25 }} aria-hidden>
              *
            </Typography>
          ) : null}
        </Typography>
        {hint ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 0.5, lineHeight: 1.45, maxWidth: { xs: '100%', md: 220 } }}
          >
            {hint}
          </Typography>
        ) : null}
      </Grid>
      <Grid size={{ xs: 12, md: 9 }} sx={{ minWidth: 0 }}>
        <Box
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', md: fullWidth ? 'none' : 480 },
            minWidth: 0,
            '& .MuiTextField-root': { width: '100%' },
            '& .MuiFormControl-root': { width: '100%' },
            '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
          }}
        >
          {children}
        </Box>
      </Grid>
    </Grid>
  );
}
