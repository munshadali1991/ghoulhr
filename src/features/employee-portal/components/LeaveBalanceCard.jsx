import { Box, LinearProgress, Link, Typography } from '@mui/material';
import { PageCard } from '@/shared/components/ui/PageCard';
import { surface } from '@/shared/theme/surfaces';

/**
 * @param {{
 *   balance: import('../types/employeePortal.types').LeaveBalance,
 *   showProgress?: boolean,
 * }} props
 */
export function LeaveBalanceCard({ balance, showProgress }) {
  const pct = balance.granted > 0 ? Math.min(100, (balance.consumed / balance.granted) * 100) : 0;

  return (
    <PageCard sx={{ height: '100%', minWidth: 200, flex: '1 1 200px' }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 1 }}>
          <Typography variant="body2" fontWeight={600} noWrap title={balance.name}>
            {balance.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            Granted: {balance.granted}
          </Typography>
        </Box>
        <Typography variant="h4" fontWeight={700} align="center">
          {balance.balance}
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Balance
        </Typography>
        {showProgress && balance.granted > 0 ? (
          <Box sx={{ mt: 2 }}>
            <Link component="button" variant="body2" underline="hover" sx={{ mb: 1, display: 'block' }}>
              View Details
            </Link>
            <Typography variant="caption" color="text.secondary">
              {balance.consumed} of {balance.granted} Consumed
            </Typography>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                mt: 0.75,
                height: 6,
                borderRadius: 3,
                bgcolor: surface.progressTrack,
                '& .MuiLinearProgress-bar': { bgcolor: 'secondary.main' },
              }}
            />
          </Box>
        ) : null}
      </Box>
    </PageCard>
  );
}
