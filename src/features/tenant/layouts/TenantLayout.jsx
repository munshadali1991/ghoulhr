import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  Link,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { APP_NAME } from '@/app/config/appConfig';
import { useAuth } from '@/app/providers/useAuth';
import { SidebarContent } from '@/shared/components/layout/SidebarContent';
import {
  DRAWER_WIDTH,
  DRAWER_WIDTH_COLLAPSED,
  useSidebarCollapsed,
} from '@/shared/components/layout/sidebarLayout';
import { buildTenantNavItems, getTenantPageTitle } from '../config/tenantNav';
import { useOrganizationBranding } from '@/features/settings/organization/hooks/useOrganizationBranding';
import { EmployeeNotificationsMenu } from '@/features/employee-portal/components/EmployeeNotificationsMenu';

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
export function TenantLayout({
  user,
  userName,
  mobileDrawerOpen,
  onOpenMobileDrawer,
  onCloseMobileDrawer,
  onLogout,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();
  const pathname = location.pathname;
  const { collapsed, toggleCollapsed } = useSidebarCollapsed();
  const drawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  const sidebarNavItems = buildTenantNavItems(pathname, session);
  const pageTitle = getTenantPageTitle(pathname, session);
  const branding = useOrganizationBranding(user?.organizationId);

  const headerSubtitle = branding.hasCustomName
    ? branding.displayName
    : user?.organizationSubdomain ?? APP_NAME;

  const handleNavItemClick = (item) => {
    if (item.path) {
      return;
    }
    if (item.children?.length && item.children[0].path) {
      navigate(item.children[0].path);
    }
    onCloseMobileDrawer?.();
  };

  const sidebarProps = {
    user,
    navItems: sidebarNavItems,
    onItemClick: handleNavItemClick,
    pathname,
    onNavigate: onCloseMobileDrawer,
    brandName: branding.displayName,
    brandLogo: branding.logo,
    brandInitials: branding.initials,
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Toolbar>
          <IconButton sx={{ mr: 1, display: { md: 'none' } }} onClick={onOpenMobileDrawer} aria-label="Open menu">
            <MenuRoundedIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">
              {pageTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {headerSubtitle}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <EmployeeNotificationsMenu />
            <Button color="inherit" size="small" startIcon={<LogoutRoundedIcon />} onClick={onLogout}>
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
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
          <SidebarContent {...sidebarProps} collapsed={false} />
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              overflowX: 'hidden',
              transition: (theme) =>
                theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
            },
          }}
        >
          <SidebarContent
            {...sidebarProps}
            collapsed={collapsed}
            onToggleCollapsed={toggleCollapsed}
          />
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minWidth: 0,
          mt: '72px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 72px)',
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          sx={{ py: 2, display: 'block' }}
        >
          {APP_NAME} |{' '}
          <Link href="#" underline="hover" color="inherit">
            Privacy Policy
          </Link>{' '}
          |{' '}
          <Link href="#" underline="hover" color="inherit">
            Terms Of Service
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
