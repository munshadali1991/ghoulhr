import { Box, Stack, Typography } from '@mui/material';
import { ScoreBadge } from './ScoreBadge';

export const CONTROL_BAR_TEAL = '#17a2b8';

/** Offset below the fixed tenant AppBar (72px) so the bar sticks just under it. */
const STICKY_TOP = 72;

/**
 * Sticky teal control bar: active assessment title + live score on the left,
 * the action cluster floated right.
 * @param {{
 *   title: string,
 *   score: number,
 *   answered?: number,
 *   total?: number,
 *   actions?: import('react').ReactNode,
 * }} props
 */
export function AssessmentHeaderBar({ title, score, answered, total, actions }) {
  return (
    <Box
      className="assessment-control-bar"
      sx={{
        position: { md: 'sticky' },
        top: { md: STICKY_TOP },
        zIndex: (theme) => theme.zIndex.appBar - 1,
        px: { xs: 1.5, sm: 2.5 },
        py: 1.5,
        borderRadius: 1,
        bgcolor: CONTROL_BAR_TEAL,
        color: 'common.white',
        boxShadow: 2,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={{ xs: 0.75, sm: 2 }}
          sx={{ minWidth: 0 }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
            Assessment: {title}
          </Typography>
          <ScoreBadge score={score} answered={answered} total={total} />
        </Stack>
        <Box className="assessment-actions-print-hide" sx={{ width: { xs: '100%', md: 'auto' } }}>
          {actions}
        </Box>
      </Stack>
    </Box>
  );
}
