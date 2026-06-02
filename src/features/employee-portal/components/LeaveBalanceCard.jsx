import { Box, LinearProgress, Link, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageCard } from '@/shared/components/ui/PageCard';
import { surface } from '@/shared/theme/surfaces';

/**
 * @param {{
 *   balance: import('../types/employeePortal.types').LeaveBalance,
 *   year: number,
 *   showProgress?: boolean,
 * }} props
 */
export function LeaveBalanceCard({ balance, year, showProgress }) {
  const navigate = useNavigate();
  const pct = balance.granted > 0 ? Math.min(100, (balance.consumed / balance.granted) * 100) : 0;

  const goToDetail = () => {
    navigate(`/leave/balances/${balance.id}?year=${year}`);
  };

  return (
    <PageCard
      sx={{
        height: '100%',
        minWidth: 200,
        flex: '1 1 200px',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 4 },
      }}
      onClick={goToDetail}
    >
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
        <Box sx={{ mt: 2 }}>
          <Link
            component="button"
            variant="body2"
            underline="hover"
            sx={{ mb: 1, display: 'block' }}
            onClick={(e) => {
              e.stopPropagation();
              goToDetail();
            }}
          >
            View Details
          </Link>
          {showProgress && balance.granted > 0 ? (
            <>
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
            </>
          ) : null}
        </Box>
      </Box>
    </PageCard>
  );
}
