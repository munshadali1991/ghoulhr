import { Box, Button, Link, Typography } from '@mui/material';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { PageCard } from '@/shared/components/ui/PageCard';
import { Can } from '@/features/auth/components/Can';
import { HomeCardEyebrow } from '../home/HomeCardEyebrow';

function pad(n) {
  return String(n).padStart(2, '0');
}

function EndOfDayCountdown() {
  const [label, setLabel] = useState('00:00:00');

  useEffect(() => {
    const tick = () => {
      const now = dayjs();
      const end = now.endOf('day');
      const diff = Math.max(0, end.diff(now, 'second'));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setLabel(`${pad(h)}:${pad(m)}:${pad(s)}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Typography
      sx={{
        fontWeight: 700,
        fontSize: { xs: 32, sm: 40 },
        letterSpacing: '0.01em',
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
      }}
    >
      {label}
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

  if (!attendance) return null;

  return (
    <PageCard
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 2.5, sm: 3 },
      }}
    >
      <HomeCardEyebrow icon={<WorkOutlineRoundedIcon />}>Today&apos;s shift</HomeCardEyebrow>

      <Box sx={{ mb: 0.75 }}>
        <Typography sx={{ m: 0, mb: 0.5, fontSize: 13, color: 'text.secondary' }}>
          {attendance.date}
        </Typography>
        <Typography sx={{ m: 0, mb: 2.75, fontWeight: 600, fontSize: 15 }}>
          {attendance.shift || 'No shift assigned'}
        </Typography>
      </Box>

      <EndOfDayCountdown />
      <Typography
        sx={{
          mt: 0.75,
          mb: 2,
          fontSize: 11,
          color: 'text.disabled',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        time until day end
      </Typography>

      <Box
        sx={{
          mt: 'auto',
          pt: 2.25,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Link
          component="button"
          underline="none"
          onClick={() => navigate('/attendance')}
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: 'secondary.main',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.6,
          }}
        >
          View swipes
          <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
        </Link>

        <Can permission="ess.attendance:punch">
          <Button
            size="small"
            disabled={isPending}
            onClick={onToggle}
            sx={{
              fontWeight: 600,
              fontSize: 13,
              px: 2,
              py: 1,
              bgcolor: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(34, 197, 94, 0.16)'
                  : 'rgba(225, 238, 228, 0.95)',
              color: 'success.dark',
              '&:hover': {
                bgcolor: (t) =>
                  t.palette.mode === 'dark'
                    ? 'rgba(34, 197, 94, 0.24)'
                    : 'rgba(209, 231, 214, 0.95)',
              },
            }}
          >
            {attendance.signedIn ? 'Sign out' : 'Sign in'}
          </Button>
        </Can>
      </Box>
    </PageCard>
  );
}
