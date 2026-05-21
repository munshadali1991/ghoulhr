import { useState } from 'react';
import { Alert, Box, Skeleton } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { FormStatusAlerts } from '@/shared/components/feedback/FormStatusAlerts';
import { PageCard } from '@/shared/components/ui/PageCard';
import { ATTENDANCE_TABS } from './constants';
import { useAttendanceManager } from './hooks/useAttendanceManager';
import { AttendanceToolbar } from './components/AttendanceToolbar';
import { ShiftsTab } from './submodules/shifts/ShiftsTab';
import { ShiftFormPage } from './submodules/shifts/ShiftFormPage';
import { ScheduleTab } from './submodules/schedule/ScheduleTab';
import { ScheduleFormPage } from './submodules/schedule/ScheduleFormPage';
import { CheckInTab } from './submodules/check-in/CheckInTab';
import { CheckInFormPage } from './submodules/check-in/CheckInFormPage';

export function AttendanceSettingsPage({ organizationId }) {
  const [activeTab, setActiveTab] = useState(ATTENDANCE_TABS.shifts);
  const [formView, setFormView] = useState(null);

  const {
    shifts,
    schedule,
    checkIn,
    branchLocations,
    firstBranchId,
    isLoading,
    isSaving,
    error,
    actionError,
    clearActionError,
    saveShift,
    deleteShift,
    saveSchedule,
    saveCheckIn,
  } = useAttendanceManager(organizationId);

  const locationsEmpty = !isLoading && branchLocations.length === 0;

  const closeForm = () => {
    clearActionError();
    setFormView(null);
  };

  const handleTabChange = (tab) => {
    closeForm();
    setActiveTab(tab);
  };

  const handlePrimaryAction = () => {
    clearActionError();
    if (activeTab === ATTENDANCE_TABS.shifts) {
      setFormView({ type: 'shift', record: null });
      return;
    }
    if (activeTab === ATTENDANCE_TABS.schedule) {
      setFormView({ type: 'schedule' });
      return;
    }
    setFormView({ type: 'checkin' });
  };

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Skeleton variant="text" width={280} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={320} />
      </Box>
    );
  }

  if (formView?.type === 'shift') {
    return (
      <Box sx={{ width: '100%' }}>
        <FormStatusAlerts
          loadError={error}
          loadErrorMessage="Failed to load attendance settings. Please try again."
        />
        <ShiftFormPage
          record={formView.record}
          branchLocations={branchLocations}
          firstBranchId={firstBranchId}
          isSaving={isSaving}
          actionError={actionError}
          onClearActionError={clearActionError}
          onBack={closeForm}
          onSave={saveShift}
        />
      </Box>
    );
  }

  if (formView?.type === 'schedule') {
    return (
      <Box sx={{ width: '100%' }}>
        <FormStatusAlerts loadError={error} loadErrorMessage="Failed to load attendance settings." />
        <ScheduleFormPage
          schedule={schedule}
          isSaving={isSaving}
          actionError={actionError}
          onClearActionError={clearActionError}
          onBack={closeForm}
          onSave={saveSchedule}
        />
      </Box>
    );
  }

  if (formView?.type === 'checkin') {
    return (
      <Box sx={{ width: '100%' }}>
        <FormStatusAlerts loadError={error} loadErrorMessage="Failed to load attendance settings." />
        <CheckInFormPage
          checkIn={checkIn}
          isSaving={isSaving}
          actionError={actionError}
          onClearActionError={clearActionError}
          onBack={closeForm}
          onSave={saveCheckIn}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
      <FormStatusAlerts
        loadError={error}
        loadErrorMessage="Failed to load attendance settings. Please try again."
        warning={
          locationsEmpty ? (
            <>
              Add at least one branch under <strong>Settings → Locations</strong> before attaching shifts
              to a location.
            </>
          ) : null
        }
        warningIcon={<InfoOutlinedIcon />}
      />

      <AttendanceToolbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onPrimaryAction={handlePrimaryAction}
        primaryDisabled={
          (activeTab === ATTENDANCE_TABS.shifts && locationsEmpty) ||
          false
        }
      />

      <PageCard>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {activeTab === ATTENDANCE_TABS.shifts ? (
            <ShiftsTab
              shifts={shifts}
              branchLocations={branchLocations}
              isLoading={isLoading}
              isSaving={isSaving}
              actionError={actionError}
              onClearActionError={clearActionError}
              onEdit={(record) => {
                clearActionError();
                setFormView({ type: 'shift', record });
              }}
              onDelete={deleteShift}
              locationsEmpty={locationsEmpty}
            />
          ) : null}

          {activeTab === ATTENDANCE_TABS.schedule ? (
            <ScheduleTab
              schedule={schedule}
              actionError={actionError}
              onClearActionError={clearActionError}
              onEdit={() => {
                clearActionError();
                setFormView({ type: 'schedule' });
              }}
            />
          ) : null}

          {activeTab === ATTENDANCE_TABS.checkin ? (
            <CheckInTab
              checkIn={checkIn}
              actionError={actionError}
              onClearActionError={clearActionError}
              onEdit={() => {
                clearActionError();
                setFormView({ type: 'checkin' });
              }}
            />
          ) : null}
        </Box>
      </PageCard>

      {isSaving ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Saving changes…
        </Alert>
      ) : null}
    </Box>
  );
}
