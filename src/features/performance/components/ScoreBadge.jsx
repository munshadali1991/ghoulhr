import { Box, Typography } from '@mui/material';

/**
 * Live aggregate KPI score shown in the control bar.
 * @param {{ score: number, answered?: number, total?: number, compact?: boolean }} props
 */
export function ScoreBadge({ score, answered, total, compact = false }) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 0.75,
        px: 1.25,
        py: 0.25,
        borderRadius: 1,
        bgcolor: 'rgba(255,255,255,0.18)',
        color: 'common.white',
      }}
    >
      <Typography variant={compact ? 'body2' : 'subtitle2'} sx={{ fontWeight: 600 }}>
        Score:
      </Typography>
      <Typography variant={compact ? 'subtitle2' : 'h6'} sx={{ fontWeight: 800, lineHeight: 1 }}>
        {Number(score ?? 0).toFixed(score % 1 === 0 ? 0 : 2)}
      </Typography>
      {typeof answered === 'number' && typeof total === 'number' ? (
        <Typography variant="caption" sx={{ opacity: 0.85 }}>
          ({answered}/{total} rated)
        </Typography>
      ) : null}
    </Box>
  );
}
