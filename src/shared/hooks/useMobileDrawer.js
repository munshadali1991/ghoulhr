import { useCallback, useState } from 'react';

export function useMobileDrawer() {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const openMobileDrawer = useCallback(() => setMobileDrawerOpen(true), []);
  const closeMobileDrawer = useCallback(() => setMobileDrawerOpen(false), []);

  return {
    mobileDrawerOpen,
    openMobileDrawer,
    closeMobileDrawer,
  };
}
