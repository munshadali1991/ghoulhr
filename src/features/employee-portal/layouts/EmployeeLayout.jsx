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
import { useLocation, useNavigate } from 'react-router-dom';
import { SidebarContent } from '@/shared/components/layout/SidebarContent';
import { buildEmployeeNavItems, getEmployeePageTitle } from '../config/employeeNav';
import { EmployeeNotificationsMenu } from '../components/EmployeeNotificationsMenu';

const DRAWER_WIDTH = 280;

/**
 * @param {{
 *   user: object,
 *   userName: string,
 *   mobileDrawerOpen: boolean,
 *   onOpenMobileDrawer: () => void,
 *   onCloseMobileDrawer: () => void,
 *   onLogout: () => void,
 *   children: import('react').ReactNode,
 * }} props
 */
export function EmployeeLayout({
  user,
  userName,
  mobileDrawerOpen,
  onOpenMobileDrawer,
  onCloseMobileDrawer,
  onLogout,
  children,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const sidebarNavItems = buildEmployeeNavItems(pathname);
  const pageTitle = getEmployeePageTitle(pathname);

  const handleNavItemClick = (item) => {
    if (item.path) {
      navigate(item.path);
      onCloseMobileDrawer?.();
      return;
    }
    if (item.children?.length && item.children[0].path) {
      navigate(item.children[0].path);
      onCloseMobileDrawer?.();
    }
  };

  const sidebar = (
    <SidebarContent
      user={user}
      navItems={sidebarNavItems}
      onItemClick={handleNavItemClick}
      pathname={pathname}
    />
  );

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
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton sx={{ mr: 1, display: { md: 'none' } }} onClick={onOpenMobileDrawer} aria-label="Open menu">
            <MenuRoundedIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              {pageTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              Hi {userName}
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
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 72px)',
        }}
      >
        <Box sx={{ flexGrow: 1 }}>{children}</Box>
        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          sx={{ py: 2, display: 'block' }}
        >
          GhoulHRMS |{' '}
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
