import {
  Box,
  Link,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { PageCard } from '@/shared/components/ui/PageCard';
import trackEmptyImg from '../../assets/track-empty.png';

const MAX_VISIBLE = 5;
const PENDING_PATH = '/leave/apply?tab=pending';

/**
 * @param {import('../../types/employeePortal.types').LeaveRequest} request
 */
function formatDateRange(request) {
  const start = dayjs(request.duration?.startDate);
  const end = dayjs(request.duration?.endDate);
  if (!start.isValid()) return '—';
  if (!end.isValid() || start.isSame(end, 'day')) {
    return start.format('DD MMM YYYY');
  }
  if (start.isSame(end, 'month')) {
    return `${start.format('DD')}–${end.format('DD MMM YYYY')}`;
  }
  return `${start.format('DD MMM')} – ${end.format('DD MMM YYYY')}`;
}

/**
 * ESS home Track card: own PENDING leave applications.
 * @param {{
 *   requests?: import('../../types/employeePortal.types').LeaveRequest[],
 *   isLoading?: boolean,
 *   error?: Error | null,
 * }} props
 */
export function TrackPendingLeaveCard({
  requests = [],
  isLoading = false,
  error = null,
}) {
  const navigate = useNavigate();
  const openPending = () => navigate(PENDING_PATH);

  const visible = requests.slice(0, MAX_VISIBLE);
  const hasMore = requests.length > MAX_VISIBLE;

  return (
    <PageCard
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 2.5, sm: 3 },
        overflow: 'auto',
      }}
    >
      <Typography variant="subtitle1" sx={{ m: 0, mb: 2, fontWeight: 700 }}>
        Track
      </Typography>

      {isLoading ? (
        <Stack spacing={1.5} sx={{ flex: 1 }}>
          <Skeleton variant="rounded" height={120} />
          <Skeleton width="70%" />
        </Stack>
      ) : error ? (
        <Typography variant="body2" color="error">
          {error.message ?? 'Could not load pending leave'}
        </Typography>
      ) : requests.length === 0 ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            py: 2,
            minHeight: 200,
          }}
        >
          <Box
            component="img"
            src={trackEmptyImg}
            alt=""
            sx={{
              width: '100%',
              maxWidth: 220,
              height: 'auto',
              mb: 2,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
          <Typography variant="body2" color="text.secondary">
            All good! You&apos;ve nothing new to track.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={0} sx={{ flex: 1, minHeight: 0 }}>
          {visible.map((req, index) => (
            <Box
              key={req.id}
              role="button"
              tabIndex={0}
              onClick={openPending}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openPending();
                }
              }}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 1.5,
                py: 1.5,
                borderTop: index === 0 ? 0 : 1,
                borderColor: 'divider',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: (t) =>
                    t.palette.custom?.surfaces?.subtle ?? 'action.hover',
                },
                mx: -1,
                px: 1,
                borderRadius: 1,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{ m: 0, fontWeight: 600, lineHeight: 1.3 }}
                >
                  {req.leaveType}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ m: 0, mt: 0.35, display: 'block' }}
                >
                  {formatDateRange(req)}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ flexShrink: 0, fontWeight: 500, pt: 0.15 }}
              >
                {req.daysCount === 1 ? '1 day' : `${req.daysCount} days`}
              </Typography>
            </Box>
          ))}

          {hasMore ? (
            <Link
              component="button"
              underline="hover"
              variant="body2"
              onClick={openPending}
              sx={{
                mt: 1.5,
                alignSelf: 'flex-start',
                fontWeight: 600,
                color: 'secondary.main',
              }}
            >
              View all ({requests.length})
            </Link>
          ) : null}
        </Stack>
      )}
    </PageCard>
  );
}
