import { Button, Tab, Tabs } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { SettingsPageToolbar } from '@/shared/components/layout/SettingsPageToolbar';
import { ATTENDANCE_TABS } from '../constants';

export function AttendanceToolbar({
  activeTab,
  tabs = [],
  onTabChange,
  onPrimaryAction,
  canWrite = false,
  primaryDisabled = false,
}) {
  const isShifts = activeTab === ATTENDANCE_TABS.shifts;

  return (
    <SettingsPageToolbar
      title="Attendance settings"
      subtitle="Configure shifts, schedules, and check-in rules for your organization."
      primaryAction={
        canWrite ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={isShifts ? <AddIcon /> : <EditOutlinedIcon />}
            onClick={onPrimaryAction}
            disabled={primaryDisabled}
          >
            {isShifts
              ? 'Add Shift'
              : activeTab === ATTENDANCE_TABS.schedule
                ? 'Edit schedule'
                : 'Edit check-in'}
          </Button>
        ) : null
      }
      sx={{ mb: 0 }}
    >
      <Tabs
        value={activeTab}
        onChange={(_, value) => onTabChange(value)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{
          mt: 2,
          minHeight: 40,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTabs-indicator': {
            height: 2,
            bgcolor: 'warning.main',
          },
        }}
        aria-label="Attendance settings tabs"
      >
        {(tabs.length
          ? tabs
          : [
              { key: ATTENDANCE_TABS.shifts, label: 'Shifts' },
              { key: ATTENDANCE_TABS.schedule, label: 'Schedule & rules' },
              { key: ATTENDANCE_TABS.checkin, label: 'Check-in' },
            ]
        ).map((tab) => (
          <Tab
            key={tab.key}
            label={tab.label}
            value={tab.key}
            sx={{
              minHeight: 40,
              mr: 2.5,
              px: 0.75,
              typography: 'body2',
              fontWeight: 600,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              color: 'text.disabled',
              '&.Mui-selected': {
                color: 'text.primary',
              },
            }}
          />
        ))}
      </Tabs>
    </SettingsPageToolbar>
  );
}
