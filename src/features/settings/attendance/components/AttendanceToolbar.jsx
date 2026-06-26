import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 3,
      }}
    >
      <Box>
        <Typography variant="h5" component="h1" fontWeight={700} letterSpacing="-0.02em">
          Attendance settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 560 }}>
          Configure shifts, schedules, and check-in rules for your organization.
        </Typography>
        <Tabs
          value={activeTab}
          onChange={(_, value) => onTabChange(value)}
          sx={{ mt: 2, minHeight: 40 }}
          aria-label="Attendance settings tabs"
        >
          {(tabs.length ? tabs : [
            { key: ATTENDANCE_TABS.shifts, label: 'Shifts' },
            { key: ATTENDANCE_TABS.schedule, label: 'Schedule & rules' },
            { key: ATTENDANCE_TABS.checkin, label: 'Check-in' },
          ]).map((tab) => (
            <Tab key={tab.key} label={tab.label} value={tab.key} sx={{ minHeight: 40 }} />
          ))}
        </Tabs>
      </Box>

      {canWrite ? (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onPrimaryAction}
          disabled={primaryDisabled}
          sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, flexShrink: 0 }}
        >
          {isShifts ? 'Add Shift' : activeTab === ATTENDANCE_TABS.schedule ? 'Edit schedule' : 'Edit check-in'}
        </Button>
      ) : null}
    </Box>
  );
}
