import { Box, Skeleton, Typography } from '@mui/material';
import { surface } from '@/shared/theme/surfaces';

/**
 * @param {{
 *   balance: string | number | null | undefined,
 *   loading?: boolean,
 *   active?: boolean,
 * }} props
 */
export function LeavePreviewSummary({ balance, loading, active }) {
  const hasBalance = balance != null && balance !== '';
  const balanceDisplay = loading ? null : active && hasBalance ? balance : active ? '—' : '—';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        p: 2.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: surface.subtle,
        height: '100%',
        minHeight: { xs: 88, lg: 'auto' },
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={600}
        sx={{ letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block' }}
      >
        Remaining balance
      </Typography>
      {loading ? (
        <Skeleton variant="text" width={56} height={40} sx={{ mt: 0.5 }} />
      ) : (
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ mt: 0.5, lineHeight: 1.2, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
        >
          {balanceDisplay}
          {hasBalance && !loading ? (
            <Typography component="span" variant="body1" color="text.secondary" fontWeight={500} sx={{ ml: 0.75 }}>
              days
            </Typography>
          ) : null}
        </Typography>
      )}
      {active && !loading && hasBalance ? (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
          Available after pending requests
        </Typography>
      ) : null}
    </Box>
  );
}
