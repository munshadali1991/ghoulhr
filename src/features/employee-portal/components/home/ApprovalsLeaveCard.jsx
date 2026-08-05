import { Box, Stack, Typography } from '@mui/material';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import { useNavigate } from 'react-router-dom';
import { PageCard } from '@/shared/components/ui/PageCard';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';
import { HomeCardEyebrow } from './HomeCardEyebrow';

function StatRow({ icon, iconTone, label, sub, value, onClick, divider }) {
  const isZero = !value;
  return (
    <Box
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.6,
        borderTop: divider ? 1 : 0,
        borderColor: 'divider',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick
          ? { bgcolor: (t) => t.palette.custom?.surfaces?.subtle ?? 'action.hover' }
          : undefined,
        mx: -1,
        px: 1,
        borderRadius: 1,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.35}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            ...(iconTone === 'warning'
              ? {
                  bgcolor: (t) =>
                    t.palette.mode === 'dark'
                      ? 'rgba(245, 158, 11, 0.16)'
                      : 'rgba(245, 158, 11, 0.12)',
                  color: 'warning.dark',
                }
              : {
                  bgcolor: (t) =>
                    t.palette.mode === 'dark'
                      ? 'rgba(59, 130, 246, 0.16)'
                      : 'rgba(59, 130, 246, 0.12)',
                  color: 'secondary.main',
                }),
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" sx={{ m: 0, fontWeight: 500 }}>
            {label}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ m: 0, mt: 0.15, display: 'block' }}>
            {sub}
          </Typography>
        </Box>
      </Stack>
      <Typography variant="metric" color={isZero ? 'text.disabled' : 'text.primary'}>
        {String(value ?? 0).padStart(2, '0')}
      </Typography>
    </Box>
  );
}

/**
 * Merged leave + approval counts (Design.md Approvals & leave card).
 * @param {{
 *   pendingLeaveCount?: number,
 *   pendingApprovalLeaveCount?: number,
 *   pendingApprovalTimesheetCount?: number,
 * }} props
 */
export function ApprovalsLeaveCard({
  pendingLeaveCount = 0,
  pendingApprovalLeaveCount = 0,
  pendingApprovalTimesheetCount = 0,
}) {
  const navigate = useNavigate();
  const { can } = useAuthorization();

  const rows = [];
  if (can('ess.leave:read')) {
    rows.push({
      key: 'leave',
      icon: <FlightTakeoffOutlinedIcon sx={{ fontSize: 16 }} />,
      iconTone: 'warning',
      label: 'Leave pending',
      sub: 'Your requests',
      value: pendingLeaveCount,
      onClick: () => navigate('/leave/apply?tab=pending'),
    });
  }
  if (can('approvals.leave:read')) {
    rows.push({
      key: 'leave-approval',
      icon: <HowToRegOutlinedIcon sx={{ fontSize: 16 }} />,
      iconTone: 'warning',
      label: 'Awaiting my approval',
      sub: 'Requests to review',
      value: pendingApprovalLeaveCount,
      onClick: () => navigate('/leave/requests'),
    });
  }
  if (can('approvals.timesheet:read')) {
    rows.push({
      key: 'ts-approval',
      icon: <AccessTimeOutlinedIcon sx={{ fontSize: 16 }} />,
      iconTone: 'secondary',
      label: 'Timesheets awaiting approval',
      sub: 'Team submissions',
      value: pendingApprovalTimesheetCount,
      onClick: () => navigate('/timesheet/team?status=SUBMITTED'),
    });
  }

  if (rows.length === 0) return null;

  return (
    <PageCard sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: { xs: 2.5, sm: 3 } }}>
      <HomeCardEyebrow icon={<ChecklistOutlinedIcon />}>Approvals & leave</HomeCardEyebrow>
      <Box sx={{ mt: -0.5 }}>
        {rows.map((row, index) => (
          <StatRow key={row.key} {...row} divider={index > 0} />
        ))}
      </Box>
    </PageCard>
  );
}
