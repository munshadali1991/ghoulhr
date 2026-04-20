import { AppBar, Box, Button, CssBaseline, Drawer, IconButton, Toolbar, Typography } from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { SidebarContent } from '../components/layout/SidebarContent';
import { useLocation, useNavigate } from 'react-router-dom';

const DRAWER_WIDTH = 280;

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
  const navigate = useNavigate();
  const userName = user?.email?.split('@')[0] || 'User';

  const computedNavItems = (navItems ?? []).map((item) => ({
    ...item,
    active: location.pathname.startsWith(item.path),
  }));

  const handleItemClick = (item) => {
    if (item.path) {
      navigate(item.path);
      onCloseMobileDrawer?.();
    }
  };

  const sidebar = (
    <SidebarContent
      user={user}
      navItems={computedNavItems}
      onItemClick={handleItemClick}
    />
  );

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
                Welcome back, {userName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Superadmin control center.
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
          {children}
        </Box>
      </Box>
    </>
  );
}

