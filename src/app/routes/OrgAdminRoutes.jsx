import { Navigate, Route, Routes } from 'react-router-dom';
import { OrgAdminLayout } from '@/features/org-admin/layouts/OrgAdminLayout';
import { OrgAdminHome } from '@/features/org-admin/pages/OrgAdminHome';
import { ModulePlaceholderPage } from '@/features/org-admin/pages/ModulePlaceholderPage';
import { EmployeesPage } from '@/features/employees';
import { SettingsPage } from '@/features/settings';

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
    <OrgAdminLayout
      user={user}
      userName={userName}
      mobileDrawerOpen={mobileDrawerOpen}
      onOpenMobileDrawer={onOpenMobileDrawer}
      onCloseMobileDrawer={onCloseMobileDrawer}
      onLogout={onLogout}
    >
      <Routes>
        <Route path="/dashboard" element={<OrgAdminHome user={user} userName={userName} />} />
        <Route path="/employees" element={<EmployeesPage organizationId={organizationId} />} />
        <Route path="/settings/*" element={<SettingsPage organizationId={organizationId} />} />
        <Route path="/attendance" element={<ModulePlaceholderPage title="Attendance" />} />
        <Route path="/payroll" element={<ModulePlaceholderPage title="Payroll" />} />
        <Route path="/tracking" element={<ModulePlaceholderPage title="Tracking" />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </OrgAdminLayout>
  );
}
