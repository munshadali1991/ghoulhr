import { Box, Stack, Typography } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import { useNavigate } from 'react-router-dom';
import { PageCard } from '@/shared/components/ui/PageCard';
import { Can } from '@/features/auth/components/Can';
import { DEFAULT_SETTINGS_PATH } from '@/features/settings/shell/settingsNav';
import { DashboardEyebrow } from './DashboardEyebrow';

function ShortcutRow({ icon, label, description, onClick }) {
  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.25,
        py: 1.35,
        mx: -1.25,
        borderRadius: 1.5,
        cursor: 'pointer',
        transition: 'background 0.12s ease',
        '&:hover': {
          bgcolor: (t) => t.palette.custom?.surfaces?.subtle ?? 'action.hover',
        },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          bgcolor: (t) => t.palette.custom?.surfaces?.subtle ?? 'action.hover',
          color: 'secondary.main',
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600}>
          {label}
        </Typography>
        {description ? (
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        ) : null}
      </Box>
      <ChevronRightRoundedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
    </Box>
  );
}

/**
 * Permission-gated admin shortcuts.
 */
export function HrDashboardShortcuts() {
  const navigate = useNavigate();

  return (
    <PageCard sx={{ height: '100%', p: { xs: 2.5, sm: 3 } }}>
      <DashboardEyebrow icon={<BoltOutlinedIcon />}>Shortcuts</DashboardEyebrow>
      <Stack spacing={0.25}>
        <Can permission="employees:read">
          <ShortcutRow
            icon={<PeopleRoundedIcon sx={{ fontSize: 20 }} />}
            label="Employees"
            description="Browse and manage the directory"
            onClick={() => navigate('/employees')}
          />
        </Can>
        <Can permission="settings.attendance:read">
          <ShortcutRow
            icon={<EventNoteRoundedIcon sx={{ fontSize: 20 }} />}
            label="Attendance settings"
            description="Shifts, schedules, and check-in rules"
            onClick={() => navigate('/settings/attendance')}
          />
        </Can>
        <Can permission="payroll:read">
          <ShortcutRow
            icon={<AttachMoneyRoundedIcon sx={{ fontSize: 20 }} />}
            label="Payroll"
            description="Open payroll workspace"
            onClick={() => navigate('/payroll')}
          />
        </Can>
        <Can permissions={['settings.organization:read', 'settings.employees:read']}>
          <ShortcutRow
            icon={<SettingsOutlinedIcon sx={{ fontSize: 20 }} />}
            label="Organization settings"
            description="Locations, leave, and org configuration"
            onClick={() => navigate(DEFAULT_SETTINGS_PATH)}
          />
        </Can>
      </Stack>
    </PageCard>
  );
}
