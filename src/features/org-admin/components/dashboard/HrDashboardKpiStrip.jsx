import { Box, Skeleton, Stack, Typography } from '@mui/material';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import { PageCard } from '@/shared/components/ui/PageCard';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';

function MetricCell({ icon, label, value, hint, isLoading, emphasize }) {
  return (
    <Box
      sx={{
        px: { xs: 2, sm: 2.5 },
        py: 2,
        minWidth: 0,
        borderRight: { xs: 0, sm: 1 },
        borderBottom: { xs: 1, sm: 0 },
        borderColor: 'divider',
        '&:last-of-type': { borderRight: 0, borderBottom: 0 },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
        <Box sx={{ color: 'text.disabled', display: 'inline-flex', '& > svg': { fontSize: 16 } }}>
          {icon}
        </Box>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'text.disabled',
          }}
        >
          {label}
        </Typography>
      </Stack>
      {isLoading ? (
        <Skeleton variant="text" width={56} height={36} />
      ) : (
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 28,
            lineHeight: 1.1,
            fontVariantNumeric: 'tabular-nums',
            color: emphasize || 'text.primary',
          }}
        >
          {value ?? '—'}
        </Typography>
      )}
      {hint ? (
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
          {hint}
        </Typography>
      ) : null}
    </Box>
  );
}

/**
 * Dense KPI strip for HR dashboard.
 * @param {{
 *   stats?: {
 *     totalEmployees?: number,
 *     presentToday?: number,
 *     pendingPayroll?: number,
 *     activeDepartments?: number,
 *   },
 *   isLoading?: boolean,
 * }} props
 */
export function HrDashboardKpiStrip({ stats = {}, isLoading = false }) {
  const { can, canAny } = useAuthorization();
  const showEmployees = can('employees:read');
  const showPayroll = can('payroll:read');
  const showDepartments = canAny(['settings.organization:read', 'settings.employees:read']);

  if (!showEmployees && !showPayroll && !showDepartments) {
    return null;
  }

  const payrollValue = stats.pendingPayroll;
  const payrollHint =
    !isLoading && payrollValue === 0 ? 'No open runs' : undefined;

  return (
    <PageCard
      sx={{
        mb: 2.25,
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: `repeat(${[showEmployees, showEmployees, showPayroll, showDepartments].filter(Boolean).length}, 1fr)`,
        },
        overflow: 'hidden',
      }}
    >
      {showEmployees ? (
        <MetricCell
          icon={<PeopleRoundedIcon />}
          label="Total employees"
          value={stats.totalEmployees}
          isLoading={isLoading}
        />
      ) : null}
      {showEmployees ? (
        <MetricCell
          icon={<EventNoteRoundedIcon />}
          label="Present today"
          value={stats.presentToday}
          isLoading={isLoading}
          emphasize="success.main"
        />
      ) : null}
      {showPayroll ? (
        <MetricCell
          icon={<AttachMoneyRoundedIcon />}
          label="Pending payroll"
          value={payrollValue}
          hint={payrollHint}
          isLoading={isLoading}
          emphasize={payrollValue > 0 ? 'warning.main' : undefined}
        />
      ) : null}
      {showDepartments ? (
        <MetricCell
          icon={<ApartmentRoundedIcon />}
          label="Active departments"
          value={stats.activeDepartments}
          isLoading={isLoading}
        />
      ) : null}
    </PageCard>
  );
}
