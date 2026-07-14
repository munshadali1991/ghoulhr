import { Box, Button, Stack, Typography } from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useNavigate } from 'react-router-dom';
import { PageCard } from '@/shared/components/ui/PageCard';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';
import { HomeCardEyebrow } from '../home/HomeCardEyebrow';
import {
  STATUS_LABELS,
  normalizeTimesheetStatus,
} from '../../constants/timesheetEnums';

const TARGET_HOURS = 8;

/**
 * @param {{ timesheet: object | undefined }} props
 */
export function TimesheetHomeWidget({ timesheet }) {
  const navigate = useNavigate();
  const { can } = useAuthorization();

  if (!timesheet) return null;

  const status = timesheet.status ?? (timesheet.isMissing ? null : 'DRAFT');
  const totalHours = Number(timesheet.totalHours ?? 0);
  const statusKey = normalizeTimesheetStatus(status);
  const statusLabel = STATUS_LABELS[statusKey] ?? (statusKey || 'Pending');
  const progressDeg = Math.min(360, (totalHours / TARGET_HOURS) * 360);

  let ctaLabel = "Fill today's timesheet";
  if (status === 'DRAFT') ctaLabel = "Continue today's timesheet";
  if (status === 'SUBMITTED' || status === 'APPROVED' || status === 'REJECTED') {
    ctaLabel = "View today's timesheet";
  }

  const workDate = timesheet.workDate;
  const canWrite = can('ess.timesheet:write');
  const canRead = can('ess.timesheet:read');
  const showViewOnlyCta =
    !canWrite &&
    canRead &&
    (status === 'SUBMITTED' || status === 'APPROVED' || status === 'REJECTED');

  return (
    <PageCard
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 2.5, sm: 3 },
      }}
    >
      <HomeCardEyebrow icon={<AccessTimeRoundedIcon />}>Today&apos;s timesheet</HomeCardEyebrow>

      <Stack direction="row" alignItems="center" spacing={2.5} sx={{ mb: 2.25 }}>
        <Box
          sx={{
            position: 'relative',
            width: 76,
            height: 76,
            borderRadius: '50%',
            flexShrink: 0,
            background: (t) =>
              `conic-gradient(${t.palette.warning.main} 0deg ${progressDeg}deg, ${
                t.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(243, 219, 182, 0.9)'
              } ${progressDeg}deg 360deg)`,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 9,
              borderRadius: '50%',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 17, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {totalHours.toFixed(1)}
            </Typography>
            <Typography sx={{ fontSize: 9.5, color: 'text.disabled', mt: 0.25 }}>of {TARGET_HOURS}h</Typography>
          </Box>
        </Box>

        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 36, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {totalHours.toFixed(1)}
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13, color: 'text.secondary' }}>hours logged</Typography>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              mt: 1,
              px: 1.25,
              py: 0.5,
              borderRadius: 5,
              fontSize: 11.5,
              fontWeight: 600,
              bgcolor: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(245, 158, 11, 0.16)'
                  : 'rgba(251, 230, 204, 0.95)',
              color: 'warning.dark',
            }}
          >
            <AccessTimeRoundedIcon sx={{ fontSize: 14 }} />
            {statusLabel}
          </Box>
        </Box>
      </Stack>

      {timesheet.showReminder ? (
        <Box
          sx={{
            display: 'flex',
            gap: 1.25,
            alignItems: 'flex-start',
            bgcolor: (t) =>
              t.palette.mode === 'dark'
                ? 'rgba(245, 158, 11, 0.16)'
                : 'rgba(251, 230, 204, 0.95)',
            borderRadius: 1,
            px: 1.5,
            py: 1.35,
            mb: 2,
            fontSize: 13,
            color: 'warning.dark',
            lineHeight: 1.45,
          }}
        >
          <WarningAmberRoundedIcon sx={{ fontSize: 18, flexShrink: 0, mt: 0.15 }} />
          <span>You haven&apos;t submitted today&apos;s timesheet yet.</span>
        </Box>
      ) : null}

      {canWrite ? (
        <Button
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<EditOutlinedIcon />}
          onClick={() => navigate(`/timesheet?date=${workDate}`)}
          sx={{ mt: 'auto', py: 1.5, fontWeight: 600 }}
        >
          {ctaLabel}
        </Button>
      ) : showViewOnlyCta ? (
        <Button
          variant="outlined"
          fullWidth
          onClick={() => navigate(`/timesheet?date=${workDate}`)}
          sx={{ mt: 'auto', py: 1.5, fontWeight: 600 }}
        >
          {ctaLabel}
        </Button>
      ) : null}
    </PageCard>
  );
}
