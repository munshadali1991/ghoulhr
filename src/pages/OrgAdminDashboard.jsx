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
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import { useState } from 'react';
import { SidebarContent } from '../components/layout/SidebarContent';

const DRAWER_WIDTH = 280;

const navItems = [
  { key: 'overview', label: 'Dashboard', icon: <DashboardRoundedIcon />, active: true },
  { label: 'Employees', icon: <PeopleRoundedIcon /> },
  { label: 'Attendance', icon: <EventNoteRoundedIcon /> },
  { label: 'Payroll', icon: <AttachMoneyRoundedIcon /> },
  { label: 'Organization', icon: <ApartmentRoundedIcon /> },
];

export function OrgAdminDashboard({
  accessToken,
  user,
  userName,
  mobileDrawerOpen,
  onOpenMobileDrawer,
  onCloseMobileDrawer,
  onLogout,
}) {
  const [activeSection, setActiveSection] = useState('overview');
  
  const sidebarNavItems = navItems.map((item) => ({
    ...item,
    active: activeSection === (item.key ?? item.label.toLowerCase()),
  }));

  const sidebar = (
    <SidebarContent
      user={user}
      navItems={sidebarNavItems}
      onItemClick={(item) => setActiveSection(item.key ?? item.label.toLowerCase())}
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
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Welcome, {userName}! 👋
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Manage your organization, employees, and payroll from here.
          </Typography>
          <Chip
            label={user?.organizationSubdomain}
            sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
          />
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Employees
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    0
                  </Typography>
                </Box>
                <PeopleRoundedIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Present Today
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    0
                  </Typography>
                </Box>
                <EventNoteRoundedIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Pending Payroll
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    0
                  </Typography>
                </Box>
                <AttachMoneyRoundedIcon sx={{ fontSize: 48, color: 'warning.main', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Active Departments
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    0
                  </Typography>
                </Box>
                <ApartmentRoundedIcon sx={{ fontSize: 48, color: 'info.main', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Quick Actions
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <PeopleRoundedIcon color="primary" sx={{ mb: 1 }} />
                    <Typography variant="body2" fontWeight={600}>
                      Add Employee
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Create new employee profile
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        borderColor: 'success.main',
                      },
                    }}
                  >
                    <EventNoteRoundedIcon color="success" sx={{ mb: 1 }} />
                    <Typography variant="body2" fontWeight={600}>
                      Mark Attendance
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Update today's attendance
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        borderColor: 'warning.main',
                      },
                    }}
                  >
                    <AttachMoneyRoundedIcon color="warning" sx={{ mb: 1 }} />
                    <Typography variant="body2" fontWeight={600}>
                      Process Payroll
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Run monthly payroll
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        borderColor: 'info.main',
                      },
                    }}
                  >
                    <ApartmentRoundedIcon color="info" sx={{ mb: 1 }} />
                    <Typography variant="body2" fontWeight={600}>
                      Org Settings
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Update organization details
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Recent Activity
              </Typography>
              <Stack spacing={1.5}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="body2" fontWeight={600}>
                    No recent activity
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Activity will appear here as you use the system
                  </Typography>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Info Card */}
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          mt: 2,
          bgcolor: 'info.50',
        }}
      >
        <CardContent>
          <Alert severity="info" sx={{ mb: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              Organization Admin Dashboard
            </Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary">
            You are logged in as <strong>ORG_ADMIN</strong>. This dashboard allows you to manage
            your organization's employees, attendance, payroll, and settings. More features will be
            available soon!
          </Typography>
        </CardContent>
      </Card>
    </>
  );

  const renderComingSoon = (section) => (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={600}>
            {section} Module - Coming Soon
          </Typography>
        </Alert>
        <Typography variant="body2" color="text.secondary">
          The {section.toLowerCase()} module is currently under development. Check back soon for
          updates!
        </Typography>
      </CardContent>
    </Card>
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
            <Typography variant="body2" color="text.secondary">
              {user?.organizationSubdomain}.ghoulhr.com
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
        {activeSection === 'overview'
          ? renderOverview()
          : renderComingSoon(activeSection.charAt(0).toUpperCase() + activeSection.slice(1))}
      </Box>
    </Box>
  );
}
