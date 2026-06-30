import { Box, Link, Stack, Typography } from '@mui/material';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { DashboardWidgetCard } from '@/shared/components/ui/DashboardWidgetCard';
import { Can } from '@/features/auth/components/Can';

/**
 * @param {{ holidays: Array<{ date: string; name: string; dayOfWeek: string }> }} props
 */
export function UpcomingHolidaysWidget({ holidays = [] }) {
  const navigate = useNavigate();

  return (
    <DashboardWidgetCard
      title="Upcoming Holidays"
      icon={<EventRoundedIcon color="primary" sx={{ fontSize: 20 }} />}
    >
      {holidays.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No upcoming holidays
        </Typography>
      ) : (
        holidays.map((h, index) => (
          <Stack
            key={h.date}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              py: 1,
              borderBottom: index < holidays.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {h.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {dayjs(h.date).format('DD MMM')} · {h.dayOfWeek}
              </Typography>
            </Box>
            <Can permission="ess.leave:apply">
              <Link
                component="button"
                variant="body2"
                color="secondary"
                onClick={() => navigate('/leave/apply?tab=apply')}
              >
                Apply
              </Link>
            </Can>
          </Stack>
        ))
      )}
    </DashboardWidgetCard>
  );
}
