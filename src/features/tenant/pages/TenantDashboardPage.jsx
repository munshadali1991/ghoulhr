import { OrgAdminHome } from '@/features/org-admin/pages/OrgAdminHome';

/**
 * @param {{ user: object, userName: string }} props
 */
export function TenantAdminDashboardPage({ user, userName }) {
  return <OrgAdminHome user={user} userName={userName} />;
}
