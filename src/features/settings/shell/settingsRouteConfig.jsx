import { Navigate, Route } from 'react-router-dom';
import { SettingsRouteGuard } from '@/features/settings/shell/SettingsRouteGuard';
import { SettingsShell } from '@/features/settings/shell/SettingsPage';
import { OrganizationSettingsRoute } from '@/features/settings/organization/OrganizationSettingsRoute';
import { EmployeeSettingsPage } from '@/features/settings/employees';
import { OrgStructurePage } from '@/features/settings/org-structure';
import { AttendanceSettingsPage } from '@/features/settings/attendance';
import { LocationsSettingsPage } from '@/features/settings/locations';
import { LeaveConfigSettingsPage } from '@/features/settings/leave';
import { TimesheetSettingsPage } from '@/features/settings/timesheet';
import { RbacSettingsPage } from '@/features/rbac/pages/RbacSettingsPage';

/**
 * @param {string} organizationId
 * @param {import('react').ReactNode} page
 */
function guardedSettingsRoute(organizationId, page) {
  return (
    <SettingsRouteGuard>
      <SettingsShell organizationId={organizationId}>{page}</SettingsShell>
    </SettingsRouteGuard>
  );
}

/**
 * Flat top-level settings routes — no Outlet nesting.
 * @param {string} organizationId
 */
export function settingsFlatRoutes(organizationId) {
  return (
    <>
      <Route path="/settings" element={<Navigate to="/settings/organization" replace />} />
      <Route
        path="/settings/organization"
        element={guardedSettingsRoute(
          organizationId,
          <OrganizationSettingsRoute organizationId={organizationId} orgSubPath="" />,
        )}
      />
      <Route
        path="/settings/organization/calendar"
        element={guardedSettingsRoute(
          organizationId,
          <OrganizationSettingsRoute organizationId={organizationId} orgSubPath="calendar" />,
        )}
      />
      <Route
        path="/settings/employees"
        element={guardedSettingsRoute(
          organizationId,
          <EmployeeSettingsPage organizationId={organizationId} />,
        )}
      />
      <Route
        path="/settings/departments"
        element={guardedSettingsRoute(
          organizationId,
          <OrgStructurePage organizationId={organizationId} />,
        )}
      />
      <Route
        path="/settings/locations"
        element={guardedSettingsRoute(
          organizationId,
          <LocationsSettingsPage organizationId={organizationId} />,
        )}
      />
      <Route
        path="/settings/leave"
        element={guardedSettingsRoute(
          organizationId,
          <LeaveConfigSettingsPage organizationId={organizationId} />,
        )}
      />
      <Route
        path="/settings/attendance"
        element={guardedSettingsRoute(
          organizationId,
          <AttendanceSettingsPage organizationId={organizationId} />,
        )}
      />
      <Route
        path="/settings/timesheet/*"
        element={guardedSettingsRoute(
          organizationId,
          <TimesheetSettingsPage organizationId={organizationId} />,
        )}
      />
      <Route
        path="/settings/rbac/*"
        element={guardedSettingsRoute(organizationId, <RbacSettingsPage />)}
      />
      <Route path="/settings/*" element={<Navigate to="/settings/organization" replace />} />
    </>
  );
}
