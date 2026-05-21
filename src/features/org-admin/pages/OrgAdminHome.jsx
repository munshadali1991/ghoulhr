import {
  Alert,
  Box,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import { useNavigate } from 'react-router-dom';
import { HeroBanner } from '@/shared/components/ui/HeroBanner';
import { PageCard } from '@/shared/components/ui/PageCard';
import { DEFAULT_SETTINGS_PATH } from '@/features/settings/shell/settingsNav';

/**
 * @param {{ user: object, userName: string }} props
 */
export function OrgAdminHome({ user, userName }) {
  const navigate = useNavigate();

  const quickActionSx = {
    p: 2,
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': { bgcolor: 'action.hover' },
  };

  return (
    <>
      <HeroBanner>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Welcome, {userName}! 👋
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Manage your organization, employees, and payroll from here.
        </Typography>
        <Chip
          label={user?.organizationSubdomain}
          sx={{
            mt: 1,
            bgcolor: (theme) => theme.palette.custom.brand.chipOnBrand,
            color: (theme) => theme.palette.custom.brand.onBrand,
          }}
        />
      </HeroBanner>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <PageCard>
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
          </PageCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <PageCard>
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
          </PageCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <PageCard>
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
          </PageCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <PageCard>
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
          </PageCard>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <PageCard>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Quick Actions
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper
                    variant="outlined"
                    sx={{ ...quickActionSx, '&:hover': { ...quickActionSx['&:hover'], borderColor: 'primary.main' } }}
                    onClick={() => navigate('/employees')}
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
                    sx={{ ...quickActionSx, '&:hover': { ...quickActionSx['&:hover'], borderColor: 'success.main' } }}
                    onClick={() => navigate('/attendance')}
                  >
                    <EventNoteRoundedIcon color="success" sx={{ mb: 1 }} />
                    <Typography variant="body2" fontWeight={600}>
                      Mark Attendance
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Update today&apos;s attendance
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper
                    variant="outlined"
                    sx={{ ...quickActionSx, '&:hover': { ...quickActionSx['&:hover'], borderColor: 'warning.main' } }}
                    onClick={() => navigate('/payroll')}
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
                    sx={{ ...quickActionSx, '&:hover': { ...quickActionSx['&:hover'], borderColor: 'info.main' } }}
                    onClick={() => navigate(DEFAULT_SETTINGS_PATH)}
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
          </PageCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <PageCard>
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
          </PageCard>
        </Grid>
      </Grid>

      <PageCard sx={{ mt: 2, bgcolor: 'info.50' }}>
        <CardContent>
          <Alert severity="info" sx={{ mb: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              Organization Admin Dashboard
            </Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary">
            You are logged in as <strong>ORG_ADMIN</strong>. This dashboard allows you to manage
            your organization&apos;s employees, attendance, payroll, and settings. More features
            will be available soon!
          </Typography>
        </CardContent>
      </PageCard>
    </>
  );
}
