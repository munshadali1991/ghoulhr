import { Typography } from '@mui/material';

/** @param {{ children: React.ReactNode }} props */
export function SectionLabel({ children }) {
  return (
    <Typography
      variant="overline"
      sx={{
        display: 'block',
        color: 'text.secondary',
        letterSpacing: '0.08em',
        fontWeight: 600,
        mb: 1.5,
        mt: 0.5,
      }}
    >
      {children}
    </Typography>
  );
}
