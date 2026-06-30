import { Alert, Box, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { DashboardWidgetCard } from '@/shared/components/ui/DashboardWidgetCard';
import { BrandedButton } from '@/shared/components/ui/BrandedButton';
import { TimesheetStatusChip } from './TimesheetStatusChip';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';

/**
 * @param {{ timesheet: object | undefined }} props
 */
export function TimesheetHomeWidget({ timesheet }) {
  const navigate = useNavigate();
  const { can } = useAuthorization();

  if (!timesheet) return null;

  const status = timesheet.status ?? (timesheet.isMissing ? null : 'DRAFT');
  const totalHours = Number(timesheet.totalHours ?? 0);

  let ctaLabel = "Fill Today's Timesheet";
  if (status === 'DRAFT') ctaLabel = "Continue Today's Timesheet";
  if (status === 'SUBMITTED' || status === 'APPROVED' || status === 'REJECTED') {
    ctaLabel = "View Today's Timesheet";
  }

  const workDate = timesheet.workDate;
  const canWrite = can('ess.timesheet:write');
  const canRead = can('ess.timesheet:read');
  const showViewOnlyCta =
    !canWrite &&
    canRead &&
    (status === 'SUBMITTED' || status === 'APPROVED' || status === 'REJECTED');

  return (
    <DashboardWidgetCard
      title="Today's Timesheet"
      icon={<AccessTimeRoundedIcon color="primary" sx={{ fontSize: 20 }} />}
    >
      <Stack direction="row" alignItems="baseline" spacing={1}>
        <Typography variant="h4" fontWeight={700}>
          {totalHours.toFixed(1)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          hours logged
        </Typography>
      </Stack>

      <Box>
        <TimesheetStatusChip status={status} />
      </Box>

      {timesheet.showReminder ? (
        <Alert severity="warning" sx={{ alignItems: 'center' }}>
          You haven&apos;t submitted today&apos;s timesheet yet.
        </Alert>
      ) : null}

      {canWrite ? (
        <Box sx={{ mt: 'auto', pt: 1 }}>
          <BrandedButton fullWidth onClick={() => navigate(`/timesheet?date=${workDate}`)}>
            {ctaLabel}
          </BrandedButton>
        </Box>
      ) : showViewOnlyCta ? (
        <Box sx={{ mt: 'auto', pt: 1 }}>
          <BrandedButton
            fullWidth
            variant="outlined"
            onClick={() => navigate(`/timesheet?date=${workDate}`)}
          >
            {ctaLabel}
          </BrandedButton>
        </Box>
      ) : null}
    </DashboardWidgetCard>
  );
}
