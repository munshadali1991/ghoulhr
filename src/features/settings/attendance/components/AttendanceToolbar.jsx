import { Tab, Tabs } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { SettingsPageToolbar } from '@/shared/components/layout/SettingsPageToolbar';
import { CrudButton } from '@/shared/components/ui/CrudButton';
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
          <CrudButton
            intent={isShifts ? 'create' : 'edit'}
            startIcon={<AddIcon />}
            onClick={onPrimaryAction}
            disabled={primaryDisabled}
          >
            {isShifts
              ? 'Add Shift'
              : activeTab === ATTENDANCE_TABS.schedule
                ? 'Edit schedule'
                : 'Edit check-in'}
          </CrudButton>
        ) : null
      }
    >
      <Tabs
        value={activeTab}
        onChange={(_, value) => onTabChange(value)}
        sx={{ mt: 2, minHeight: 40 }}
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
          <Tab key={tab.key} label={tab.label} value={tab.key} sx={{ minHeight: 40 }} />
        ))}
      </Tabs>
    </SettingsPageToolbar>
  );
}
