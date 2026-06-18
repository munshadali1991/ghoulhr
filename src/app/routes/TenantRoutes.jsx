import { Navigate, Route, Routes } from 'react-router-dom';
import { TenantLayout } from '@/features/tenant/layouts/TenantLayout';
import { TenantAdminDashboardPage } from '@/features/tenant/pages/TenantDashboardPage';
import { TenantAttendancePage } from '@/features/tenant/pages/TenantAttendancePage';
import { EmployeeHomePage } from '@/features/employee-portal/pages/home/EmployeeHomePage';
import { getDefaultLandingPath } from '@/features/tenant/config/tenantNav';
import { LeaveApplyPage } from '@/features/employee-portal/pages/leave/LeaveApplyPage';
import { LeaveBalancesPage } from '@/features/employee-portal/pages/leave/LeaveBalancesPage';
import { LeaveBalanceDetailPage } from '@/features/employee-portal/pages/leave/LeaveBalanceDetailPage';
import { LeaveCalendarPage } from '@/features/employee-portal/pages/leave/LeaveCalendarPage';
import { HolidayCalendarPage } from '@/features/employee-portal/pages/leave/HolidayCalendarPage';
import { TimesheetDayPage } from '@/features/employee-portal/pages/timesheet/TimesheetDayPage';
import { TimesheetReportsPage } from '@/features/employee-portal/pages/timesheet/TimesheetReportsPage';
import { ModulePlaceholderPage } from '@/features/org-admin/pages/ModulePlaceholderPage';
import { EmployeesPage } from '@/features/employees';
import { SettingsPage } from '@/features/settings';
import { RequireAccess } from '@/features/auth/components/RequireAccess';
import { useAuth } from '@/app/providers/useAuth';

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
export function TenantRoutes({
  user,
  userName,
  mobileDrawerOpen,
  onOpenMobileDrawer,
  onCloseMobileDrawer,
  onLogout,
}) {
  const organizationId = user?.organizationId;
  const { session } = useAuth();
  const landingPath = getDefaultLandingPath(session);

  return (
    <TenantLayout
      user={user}
      userName={userName}
      mobileDrawerOpen={mobileDrawerOpen}
      onOpenMobileDrawer={onOpenMobileDrawer}
      onCloseMobileDrawer={onCloseMobileDrawer}
      onLogout={onLogout}
    >
      <Routes>
        <Route
          path="/home"
          element={
            <RequireAccess
              permissions={['ess.leave:read', 'ess.attendance:read', 'ess.timesheet:read']}
              fallbackTo="/dashboard"
            >
              <EmployeeHomePage userName={userName} />
            </RequireAccess>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAccess
              permissions={['employees:read', 'settings.organization:read', 'payroll:read']}
              permissionsMode="any"
              fallbackTo="/home"
            >
              <TenantAdminDashboardPage user={user} userName={userName} />
            </RequireAccess>
          }
        />
        <Route path="/" element={<Navigate to={landingPath} replace />} />

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
            <RequireAccess module="attendance">
              <TenantAttendancePage />
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

        <Route
          path="/employees"
          element={
            <RequireAccess module="employees" permission="employees:read">
              <EmployeesPage organizationId={organizationId} />
            </RequireAccess>
          }
        />
        <Route
          path="/settings/*"
          element={
            <RequireAccess module="settings">
              <SettingsPage organizationId={organizationId} />
            </RequireAccess>
          }
        />
        <Route
          path="/payroll"
          element={
            <RequireAccess module="payroll" permission="payroll:read">
              <ModulePlaceholderPage title="Payroll" />
            </RequireAccess>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </TenantLayout>
  );
}
