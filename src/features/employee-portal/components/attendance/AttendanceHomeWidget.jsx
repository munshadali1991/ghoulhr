import { Box, Link, Typography } from '@mui/material';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { DashboardWidgetCard } from '@/shared/components/ui/DashboardWidgetCard';
import { BrandedButton } from '@/shared/components/ui/BrandedButton';
import { Can } from '@/features/auth/components/Can';

function LiveClock() {
  const [now, setNow] = useState(dayjs());
  useEffect(() => {
    const id = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <Typography variant="h4" fontWeight={700} fontFamily="monospace">
      {now.format('HH:mm:ss')}
    </Typography>
  );
}

/**
 * @param {{
 *   attendance: object;
 *   onToggle: () => void;
 *   isPending?: boolean;
 * }} props
 */
export function AttendanceHomeWidget({ attendance, onToggle, isPending = false }) {
  const navigate = useNavigate();

  const punchAction = (
    <Can permission="ess.attendance:punch">
      <BrandedButton size="small" disabled={isPending} onClick={onToggle}>
        {attendance.signedIn ? 'Sign Out' : 'Sign In'}
      </BrandedButton>
    </Can>
  );

  return (
    <DashboardWidgetCard
      title="Today's Shift"
      icon={<ScheduleRoundedIcon color="primary" sx={{ fontSize: 20 }} />}
      action={punchAction}
    >
      <Box>
        <Typography variant="caption" color="text.secondary">
          {attendance.date}
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {attendance.shift}
        </Typography>
        <LiveClock />
      </Box>
      <Link
        component="button"
        variant="body2"
        underline="hover"
        sx={{ mt: 'auto', pt: 1, alignSelf: 'flex-start' }}
        onClick={() => navigate('/attendance')}
      >
        View Swipes
      </Link>
    </DashboardWidgetCard>
  );
}
