import { AppBar, Box, Button, CssBaseline, Drawer, IconButton, Toolbar, Typography } from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { SidebarContent } from '@/shared/components/layout/SidebarContent';
import {
  DRAWER_WIDTH,
  DRAWER_WIDTH_COLLAPSED,
  useSidebarCollapsed,
} from '@/shared/components/layout/sidebarLayout';
import { useLocation } from 'react-router-dom';

export function DashboardLayout({
  user,
  navItems,
  mobileDrawerOpen,
  onOpenMobileDrawer,
  onCloseMobileDrawer,
  onLogout,
  children,
}) {
  const location = useLocation();
  const userName = user?.email?.split('@')[0] || 'User';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const { collapsed, toggleCollapsed } = useSidebarCollapsed();
  const drawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  const handleItemClick = (item) => {
    if (item.path) {
      return;
    }
  };

  const sidebarProps = {
    user,
    navItems: navItems ?? [],
    onItemClick: handleItemClick,
    pathname: location.pathname,
    onNavigate: onCloseMobileDrawer,
  };

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
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
            <IconButton sx={{ mr: 1, display: { md: 'none' } }} onClick={onOpenMobileDrawer}>
              <MenuRoundedIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6">
                Welcome back, {userName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isSuperAdmin ? 'Superadmin control center.' : 'Organization workspace.'}
              </Typography>
            </Box>
            <Button color="inherit" size="small" startIcon={<LogoutRoundedIcon />} onClick={onLogout}>
              Logout
            </Button>
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
            minWidth: 0,
            p: { xs: 2, md: 3 },
            width: { md: `calc(100% - ${drawerWidth}px)` },
            mt: '72px',
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
}
