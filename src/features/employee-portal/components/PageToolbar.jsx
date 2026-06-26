import { Box, Stack } from '@mui/material';

/**
 * Side-by-side button row for PageToolbar (equal width on mobile).
 * @param {{ children: import('react').ReactNode }} props
 */
export function ToolbarButtonGroup({ children }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        width: { xs: '100%', sm: 'auto' },
        '& > .MuiButton-root': {
          flex: { xs: 1, sm: 'none' },
          width: { sm: 'auto' },
        },
      }}
    >
      {children}
    </Stack>
  );
}

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
      {left ?? children ? <Box sx={{ minWidth: 0 }}>{left ?? children}</Box> : null}
      {right ? (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 2, sm: 1 }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          flexWrap="wrap"
          useFlexGap
          sx={{
            width: { xs: '100%', sm: 'auto' },
            ml: { xs: 0, sm: 'auto' },
            '& > .MuiButton-root': {
              width: { xs: '100%', sm: 'auto' },
            },
            '& > .MuiFormControl-root': {
              width: { xs: '100%', sm: 'auto' },
            },
            '& > .MuiStack-root': {
              width: { xs: '100%', sm: 'auto' },
            },
          }}
        >
          {right}
        </Stack>
      ) : null}
    </Stack>
  );
}