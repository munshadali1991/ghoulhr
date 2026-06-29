import { Navigate, Route, Routes } from 'react-router-dom';
import { OrgAdminLayout } from '@/features/org-admin/layouts/OrgAdminLayout';
import { OrgAdminHome } from '@/features/org-admin/pages/OrgAdminHome';
import { ModulePlaceholderPage } from '@/features/org-admin/pages/ModulePlaceholderPage';
import { EmployeesPage } from '@/features/employees';
import { RequireAccess } from '@/features/auth/components/RequireAccess';
import { settingsFlatRoutes } from '@/features/settings/shell/settingsRouteConfig';

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
export function OrgAdminRoutes({
  user,
  userName,
  mobileDrawerOpen,
  onOpenMobileDrawer,
  onCloseMobileDrawer,
  onLogout,
}) {
  const organizationId = user?.organizationId;

  return (
    <Routes>
      <Route
        element={
          <OrgAdminLayout
            user={user}
            userName={userName}
            mobileDrawerOpen={mobileDrawerOpen}
            onOpenMobileDrawer={onOpenMobileDrawer}
            onCloseMobileDrawer={onCloseMobileDrawer}
            onLogout={onLogout}
          />
        }
      >
        <Route path="/dashboard" element={<OrgAdminHome user={user} userName={userName} />} />
        <Route
          path="/employees"
          element={
            <RequireAccess module="employees" permission="employees:read">
              <EmployeesPage organizationId={organizationId} />
            </RequireAccess>
          }
        />
        {settingsFlatRoutes(organizationId)}
        <Route
          path="/attendance"
          element={
            <RequireAccess module="attendance">
              <ModulePlaceholderPage title="Attendance" />
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
      </Route>
    </Routes>
  );
}
