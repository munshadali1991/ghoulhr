import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { ATTENDANCE_TABS } from '../constants';

export function AttendanceToolbar({
  activeTab,
  onTabChange,
  onPrimaryAction,
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
          Attendance
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 560 }}>
          Configure working week, shifts, thresholds, and how employees check in.
        </Typography>
        <Tabs
          value={activeTab}
          onChange={(_, value) => onTabChange(value)}
          sx={{ mt: 2, minHeight: 40 }}
          aria-label="Attendance settings tabs"
        >
          <Tab label="Shifts" value={ATTENDANCE_TABS.shifts} sx={{ minHeight: 40 }} />
          <Tab label="Schedule & rules" value={ATTENDANCE_TABS.schedule} sx={{ minHeight: 40 }} />
          <Tab label="Check-in" value={ATTENDANCE_TABS.checkin} sx={{ minHeight: 40 }} />
        </Tabs>
      </Box>

      <Button
        variant="contained"
        startIcon={isShifts ? <AddIcon /> : <EditOutlinedIcon />}
        onClick={onPrimaryAction}
        disabled={primaryDisabled}
        sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, flexShrink: 0 }}
      >
        {isShifts ? 'Add Shift' : activeTab === ATTENDANCE_TABS.schedule ? 'Edit schedule' : 'Edit check-in'}
      </Button>
    </Box>
  );
}
