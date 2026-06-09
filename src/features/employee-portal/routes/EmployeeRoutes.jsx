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
        <Route path="/dashboard" element={<EmployeeHomePage userName={userName} />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/leave/apply" element={<LeaveApplyPage />} />
        <Route path="/leave/balances" element={<LeaveBalancesPage />} />
        <Route path="/leave/balances/:leaveConfigurationId" element={<LeaveBalanceDetailPage />} />
        <Route path="/leave/calendar" element={<LeaveCalendarPage />} />
        <Route path="/leave/holidays" element={<HolidayCalendarPage />} />
        <Route path="/attendance" element={<AttendanceInfoPage />} />
        <Route path="/timesheet" element={<TimesheetDayPage />} />
        <Route path="/timesheet/add" element={<Navigate to="/timesheet" replace />} />
        <Route path="/timesheet/edit" element={<Navigate to="/timesheet" replace />} />
        <Route path="/timesheet/reports" element={<TimesheetReportsPage />} />
        <Route path="/profile" element={<PlaceholderPage title="My Profile" />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </EmployeeLayout>
  );
}
