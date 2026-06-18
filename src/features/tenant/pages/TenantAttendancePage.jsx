import { useAuth } from '@/app/providers/useAuth';
import { AttendanceInfoPage } from '@/features/employee-portal/pages/attendance/AttendanceInfoPage';
import { ModulePlaceholderPage } from '@/features/org-admin/pages/ModulePlaceholderPage';
import { can } from '@/features/auth/utils/authorization';

export function TenantAttendancePage() {
  const { session } = useAuth();
  if (can(session, 'ess.attendance:read')) {
    return <AttendanceInfoPage />;
  }
  return <ModulePlaceholderPage title="Attendance" />;
}
