import { Navigate, Route, Routes } from 'react-router-dom';
import { EmployeeLayout } from '../layouts/EmployeeLayout';
import { EmployeeHomePage } from '../pages/home/EmployeeHomePage';
import { LeaveApplyPage } from '../pages/leave/LeaveApplyPage';
import { LeaveBalancesPage } from '../pages/leave/LeaveBalancesPage';
import { LeaveBalanceDetailPage } from '../pages/leave/LeaveBalanceDetailPage';
import { LeaveCalendarPage } from '../pages/leave/LeaveCalendarPage';
import { HolidayCalendarPage } from '../pages/leave/HolidayCalendarPage';
import { AttendanceInfoPage } from '../pages/attendance/AttendanceInfoPage';
import { TimesheetDayPage } from '../pages/timesheet/TimesheetDayPage';
import { TimesheetReportsPage } from '../pages/timesheet/TimesheetReportsPage';
import { PlaceholderPage } from '../pages/PlaceholderPage';
import { RequireAccess } from '@/features/auth/components/RequireAccess';

/**
 * @param {{
 *   user: object,
 *   userName: string,
 *   mobileDrawerOpen: boolean,
 *   onOpenMobileDrawer: () => void,
 *   onCloseMobileDrawer: () => void,
 *   onLogout: () => void,
 * }} props
 */
export function EmployeeRoutes({
  user,
  userName,
  mobileDrawerOpen,
  onOpenMobileDrawer,
  onCloseMobileDrawer,
  onLogout,
}) {
  return (
    <EmployeeLayout
      user={user}
      userName={userName}
      mobileDrawerOpen={mobileDrawerOpen}
      onOpenMobileDrawer={onOpenMobileDrawer}
      onCloseMobileDrawer={onCloseMobileDrawer}
      onLogout={onLogout}
    >
      <Routes>
        <Route
          path="/dashboard"
          element={
            <RequireAccess
              permissions={['ess.leave:read', 'ess.attendance:read', 'ess.timesheet:read']}
            >
              <EmployeeHomePage userName={userName} />
            </RequireAccess>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/leave/apply"
          element={
            <RequireAccess module="leave" permission="ess.leave:apply">
              <LeaveApplyPage />
            </RequireAccess>
          }
        />
        <Route
          path="/leave/balances"
          element={
            <RequireAccess module="leave" permission="ess.leave:read">
              <LeaveBalancesPage />
            </RequireAccess>
          }
        />
        <Route
          path="/leave/balances/:leaveConfigurationId"
          element={
            <RequireAccess module="leave" permission="ess.leave:read">
              <LeaveBalanceDetailPage />
            </RequireAccess>
          }
        />
        <Route
          path="/leave/calendar"
          element={
            <RequireAccess module="leave" permission="ess.leave:read">
              <LeaveCalendarPage />
            </RequireAccess>
          }
        />
        <Route
          path="/leave/holidays"
          element={
            <RequireAccess module="leave" permission="ess.leave:read">
              <HolidayCalendarPage />
            </RequireAccess>
          }
        />
        <Route
          path="/attendance"
          element={
            <RequireAccess module="attendance" permission="ess.attendance:read">
              <AttendanceInfoPage />
            </RequireAccess>
          }
        />
        <Route
          path="/timesheet"
          element={
            <RequireAccess module="timesheet" permission="ess.timesheet:read">
              <TimesheetDayPage />
            </RequireAccess>
          }
        />
        <Route path="/timesheet/add" element={<Navigate to="/timesheet" replace />} />
        <Route path="/timesheet/edit" element={<Navigate to="/timesheet" replace />} />
        <Route
          path="/timesheet/reports"
          element={
            <RequireAccess module="timesheet" permission="ess.timesheet:read">
              <TimesheetReportsPage />
            </RequireAccess>
          }
        />
        <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </EmployeeLayout>
  );
}
