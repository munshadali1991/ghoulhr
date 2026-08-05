import { useAuth } from '@/app/providers/useAuth';
import { useMobileDrawer } from '@/shared/hooks/useMobileDrawer';
import { TenantLayout } from './TenantLayout';

/** Stable route element — avoids remounting the layout when parent routes re-render. */
export function TenantLayoutShell() {
  const { user, userName, logout } = useAuth();
  const drawer = useMobileDrawer();

  return (
    <TenantLayout
      user={user}
      userName={userName}
      mobileDrawerOpen={drawer.mobileDrawerOpen}
      onOpenMobileDrawer={drawer.openMobileDrawer}
      onCloseMobileDrawer={drawer.closeMobileDrawer}
      onLogout={logout}
    />
  );
}
