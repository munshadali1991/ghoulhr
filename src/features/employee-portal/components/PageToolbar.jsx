import { Box, Stack } from '@mui/material';

/**
 * @param {{ left?: import('react').ReactNode, right?: import('react').ReactNode, children?: import('react').ReactNode }} props
 */
export function PageToolbar({ left, right, children }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: 2 }}
    >
      <Box>{left ?? children}</Box>
      {right ? <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">{right}</Stack> : null}
    </Stack>
  );
}
