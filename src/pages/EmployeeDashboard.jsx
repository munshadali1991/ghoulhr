import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Drawer,
  Grid,
  IconButton,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SidebarContent } from '../components/layout/SidebarContent';

const DRAWER_WIDTH = 280;

const navItems = [
  { key: 'overview', label: 'Dashboard', icon: <DashboardRoundedIcon />, path: '/dashboard' },
  { key: 'my-attendance', label: 'My Attendance', icon: <EventNoteRoundedIcon /> },
  { key: 'profile', label: 'My Profile', icon: <PersonRoundedIcon /> },
  { key: 'settings', label: 'Settings', icon: <SettingsRoundedIcon />, path: '/settings' },
];

export function EmployeeDashboard({
  user,
  userName,
  mobileDrawerOpen,
  onOpenMobileDrawer,
  onCloseMobileDrawer,
  onLogout,
  initialSection = 'overview',
}) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active section from URL path
  const getActiveSectionFromPath = () => {
    if (location.pathname === '/settings') return 'settings';
    return 'overview';
  };
  
  const [activeSection, setActiveSection] = useState(() => getActiveSectionFromPath());
  
  const sidebarNavItems = navItems.map((item) => ({
    ...item,
    active: activeSection === (item.key ?? item.label.toLowerCase()),
  }));

  const handleNavItemClick = (item) => {
    const section = item.key ?? item.label.toLowerCase();
    setActiveSection(section);
    
    // Navigate using React Router if path is defined
    if (item.path) {
      navigate(item.path);
    }
    
    onCloseMobileDrawer?.();
  };

  const sidebar = (
    <SidebarContent
      user={user}
      navItems={sidebarNavItems}
      onItemClick={handleNavItemClick}
    />
  );

  const renderOverview = () => (
    <>
      {/* Welcome Banner */}
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          mb: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Welcome back, {userName}!
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.95 }}>
            Employee Code: {user?.employeeCode} • {user?.role}
          </Typography>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Attendance This Month
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                --
              </Typography>
              <Chip label="Coming Soon" size="small" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Leave Balance
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                --
              </Typography>
              <Chip label="Coming Soon" size="small" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Next Payday
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                --
              </Typography>
              <Chip label="Coming Soon" size="small" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Department
              </Typography>
              <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }}>
                {user?.department || '--'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Password Change Alert */}
      {user?.mustChangePassword && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={600}>
            First-time login detected. Please change your temporary password.
          </Typography>
          <Button
            size="small"
            variant="outlined"
            sx={{ mt: 1 }}
            onClick={() => setActiveSection('settings')}
          >
            Change Password
          </Button>
        </Alert>
      )}

      {/* Recent Activity */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Recent Activity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No recent activity to display. Features coming soon!
          </Typography>
        </CardContent>
      </Card>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={onOpenMobileDrawer}
            sx={{ display: { md: 'none' }, mr: 1 }}
          >
            <MenuRoundedIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            {navItems.find((item) => item.key === activeSection)?.label || 'Dashboard'}
          </Typography>
          <Button
            startIcon={<LogoutRoundedIcon />}
            onClick={onLogout}
            variant="outlined"
            size="small"
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
        open
      >
        {sidebar}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileDrawerOpen}
        onClose={onCloseMobileDrawer}
        sx={{
          display: { xs: 'block', md: 'none' },
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {sidebar}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
        }}
      >
        {activeSection === 'overview' && renderOverview()}
        {activeSection !== 'overview' && (
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700}>
                {navItems.find((item) => item.key === activeSection)?.label}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This feature is under development.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
