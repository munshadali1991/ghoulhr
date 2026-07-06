import { Box } from '@mui/material';

/**
 * @param {{ left: import('react').ReactNode, main: import('react').ReactNode }} props
 */
export function FormBuilderLayout({ left, main }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '280px 1fr' },
        gap: 2,
        alignItems: 'start',
        minHeight: 480,
      }}
    >
      <Box sx={{ minHeight: 360 }}>{left}</Box>
      <Box sx={{ minWidth: 0 }}>{main}</Box>
    </Box>
  );
}
