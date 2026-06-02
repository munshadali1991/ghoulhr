import { Alert, Box, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { PageCard } from '@/shared/components/ui/PageCard';
import { BrandedButton } from '@/shared/components/ui/BrandedButton';
import { TimesheetStatusChip } from './TimesheetStatusChip';

/**
 * @param {{ timesheet: object | undefined }} props
 */
export function TimesheetHomeWidget({ timesheet }) {
  const navigate = useNavigate();

  if (!timesheet) return null;

  const status = timesheet.status ?? (timesheet.isMissing ? null : 'DRAFT');
  const totalHours = Number(timesheet.totalHours ?? 0);

  let ctaLabel = "Fill Today's Timesheet";
  if (status === 'DRAFT') ctaLabel = "Continue Today's Timesheet";
  if (status === 'SUBMITTED' || status === 'APPROVED' || status === 'REJECTED') {
    ctaLabel = "View Today's Timesheet";
  }

  const workDate = timesheet.workDate;

  return (
    <PageCard sx={{ height: '100%' }}>
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AccessTimeRoundedIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>
            Today&apos;s Timesheet
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="baseline" spacing={1}>
          <Typography variant="h3" fontWeight={800}>
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
          <Alert severity="warning" sx={{ py: 0 }}>
            You haven&apos;t submitted today&apos;s timesheet yet.
          </Alert>
        ) : null}

        <BrandedButton
          fullWidth
          onClick={() => navigate(`/timesheet?date=${workDate}`)}
        >
          {ctaLabel}
        </BrandedButton>
      </Stack>
    </PageCard>
  );
}
