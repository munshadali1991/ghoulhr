import { Box, Typography } from '@mui/material';

export function SettingsField({ label, description, required, error, children, helperText }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        {required && (
          <Typography component="span" color="error">
            *
          </Typography>
        )}
      </Box>
      {children}
      {(description || helperText || error) && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            color: error ? 'error.main' : 'text.secondary',
          }}
        >
          {error || description || helperText}
        </Typography>
      )}
    </Box>
  );
}
