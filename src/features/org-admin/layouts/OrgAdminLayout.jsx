import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/useAuth';
import { SidebarContent } from '@/shared/components/layout/SidebarContent';
import { APP_NAME } from '@/app/config/appConfig';
import { useOrganizationBranding } from '@/features/settings/organization/hooks/useOrganizationBranding';
import { DEFAULT_SETTINGS_PATH } from '@/features/settings/shell/settingsNav';
import { buildOrgAdminNavItems } from '../config/orgAdminNav';

const DRAWER_WIDTH = 280;

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
export function OrgAdminLayout({
  user,
  mobileDrawerOpen,
  onOpenMobileDrawer,
  onCloseMobileDrawer,
  onLogout,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();

  const sidebarNavItems = buildOrgAdminNavItems(location.pathname, session);
  const branding = useOrganizationBranding(user?.organizationId);

  const headerSubtitle = branding.hasCustomName
    ? branding.displayName
    : user?.organizationSubdomain ?? APP_NAME;

  const handleNavItemClick = (item) => {
    if (item.path) {
      return;
    }

    if (item.key === 'settings') {
      navigate(DEFAULT_SETTINGS_PATH);
      onCloseMobileDrawer?.();
    }
  };

  const sidebar = (
    <SidebarContent
      user={user}
      navItems={sidebarNavItems}
      onItemClick={handleNavItemClick}
      pathname={location.pathname}
      onNavigate={onCloseMobileDrawer}
      brandName={branding.displayName}
      brandLogo={branding.logo}
      brandInitials={branding.initials}
    />
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton sx={{ mr: 1, display: { md: 'none' } }} onClick={onOpenMobileDrawer}>
            <MenuRoundedIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              Organization Admin Panel
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {headerSubtitle}
            </Typography>
          </Box>
          <Button color="inherit" startIcon={<LogoutRoundedIcon />} onClick={onLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileDrawerOpen}
          onClose={onCloseMobileDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {sidebar}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {sidebar}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '72px',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
