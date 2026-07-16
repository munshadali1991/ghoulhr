import { Box, Link, Typography } from '@mui/material';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { PageCard } from '@/shared/components/ui/PageCard';
import { Can } from '@/features/auth/components/Can';
import { HomeCardEyebrow } from '../home/HomeCardEyebrow';

/**
 * @param {{ holidays: Array<{ date: string; name: string; dayOfWeek: string }> }} props
 */
export function UpcomingHolidaysWidget({ holidays = [] }) {
  const navigate = useNavigate();

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
      <HomeCardEyebrow icon={<EventRoundedIcon />}>Upcoming holidays</HomeCardEyebrow>

      {holidays.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No upcoming holidays
        </Typography>
      ) : (
        holidays.map((h, index) => (
          <Box
            key={h.date}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 1.5,
              py: 1.6,
              borderTop: index === 0 ? 0 : 1,
              borderColor: 'divider',
              ...(index === 0 ? { pt: 0.25 } : null),
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ m: 0, mb: 0.35, fontWeight: 600, lineHeight: 1.3 }}>
                {h.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ m: 0, display: 'block' }}>
                {dayjs(h.date).format('DD MMM')} · {h.dayOfWeek || dayjs(h.date).format('ddd')}
              </Typography>
            </Box>
            <Can permission="ess.leave:apply">
              <Link
                component="button"
                underline="hover"
                variant="caption"
                onClick={() => navigate('/leave/apply?tab=apply')}
                sx={{
                  fontWeight: 600,
                  color: 'secondary.main',
                  flexShrink: 0,
                  pt: 0.15,
                }}
              >
                Apply
              </Link>
            </Can>
          </Box>
        ))
      )}
    </PageCard>
  );
}
