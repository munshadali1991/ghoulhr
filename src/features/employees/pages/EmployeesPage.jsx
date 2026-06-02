import { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  InputAdornment,
  Tab,
  Tabs,
} from '@mui/material';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { BrandedButton } from '@/shared/components/ui/BrandedButton';
import { PageCard } from '@/shared/components/ui/PageCard';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { getEmployeeById, listEmployees } from '@/features/employees/api/employeesApi';
import { EmployeeOnboardingWizard } from '@/features/employees/onboarding/EmployeeOnboardingWizard';
import { mapEmployeeToOnboardingValues } from '@/features/employees/onboarding/onboardingSchema';
import { ReportingManagersTab } from '@/features/employees/reporting/ReportingManagersTab';

export function EmployeesPage({ organizationId }) {
  const [pageTab, setPageTab] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const { snackbar, show: showSnackbar, close: closeSnackbar } = useAppSnackbar();
  const [newEmployeeCredentials, setNewEmployeeCredentials] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditWizard, setShowEditWizard] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [editInitialValues, setEditInitialValues] = useState(null);

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch employees from API
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await listEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      showSnackbar(error.message || 'Failed to load employees', 'error');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWizardSuccess = async (result) => {
    setNewEmployeeCredentials({
      employee: result.employee,
      credentials: result.credentials,
    });
    setSuccessDialogOpen(true);
    setShowAddWizard(false);
    await fetchEmployees();
    showSnackbar('Employee created successfully!', 'success');
  };

  const openEditWizard = async (employee) => {
    try {
      const fullEmployee = await getEmployeeById(employee.id);
      setSelectedEmployeeId(employee.id);
      setEditInitialValues(mapEmployeeToOnboardingValues(fullEmployee));
      setShowEditWizard(true);
    } catch (error) {
      showSnackbar(error.message || 'Failed to open employee details', 'error');
    }
  };

  const handleEditSuccess = async () => {
    setShowEditWizard(false);
    setSelectedEmployeeId('');
    setEditInitialValues(null);
    await fetchEmployees();
    showSnackbar('Employee updated successfully', 'success');
  };

  // Copy to clipboard
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showSnackbar(`${label} copied to clipboard`, 'success');
  };

  // Filter employees based on search
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.departmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designationName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get role chip color
  const getRoleColor = (role) => {
    switch (role) {
      case 'ORG_ADMIN':
        return 'error';
      case 'MANAGER':
        return 'warning';
      case 'EMPLOYEE':
        return 'success';
      default:
        return 'default';
    }
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PENDING_ACTIVATION':
        return 'warning';
      case 'INACTIVE':
        return 'default';
      case 'TERMINATED':
        return 'error';
      default:
        return 'default';
    }
  };

  if (showAddWizard) {
    return (
      <EmployeeOnboardingWizard
        organizationId={organizationId}
        employees={employees}
        onCancel={() => setShowAddWizard(false)}
        onSuccess={handleWizardSuccess}
      />
    );
  }

  if (showEditWizard && selectedEmployeeId && editInitialValues) {
    return (
      <EmployeeOnboardingWizard
        organizationId={organizationId}
        employees={employees}
        employeeId={selectedEmployeeId}
        initialValues={editInitialValues}
        onCancel={() => {
          setShowEditWizard(false);
          setSelectedEmployeeId('');
          setEditInitialValues(null);
        }}
        onSuccess={handleEditSuccess}
      />
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Employee Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage employee profiles and reporting structure
          </Typography>
        </Box>
        {pageTab === 0 ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              onClick={fetchEmployees}
              disabled={loading}
              fullWidth
              sx={{ display: { xs: 'flex', sm: 'inline-flex' } }}
            >
              Refresh
            </Button>
            <BrandedButton
              startIcon={<PersonAddRoundedIcon />}
              onClick={() => setShowAddWizard(true)}
              fullWidth
            >
              Add Employee
            </BrandedButton>
          </Stack>
        ) : null}
      </Box>

      <Tabs
        value={pageTab}
        onChange={(_, v) => setPageTab(v)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Employee directory" />
        <Tab label="Reporting managers" />
      </Tabs>

      {pageTab === 1 ? (
        <ReportingManagersTab showSnackbar={showSnackbar} />
      ) : null}

      {pageTab === 0 ? (
        <>
      {/* Search Bar */}
      <PageCard sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by name, email, employee code, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon color="action" />
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </CardContent>
      </PageCard>

      {/* Employees Table */}
      <PageCard>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell><strong>Employee Code</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Department</strong></TableCell>
                <TableCell><strong>Designation</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Join Date</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Loading employees...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      {searchQuery ? 'No employees found matching your search' : 'No employees in your organization yet'}
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddRoundedIcon />}
                      onClick={() => setShowAddWizard(true)}
                      sx={{ mt: 2 }}
                    >
                      Add Your First Employee
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow
                    key={employee.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => openEditWizard(employee)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {employee.employeeCode}
                      </Typography>
                    </TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.departmentName || '-'}</TableCell>
                    <TableCell>{employee.designationName || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={employee.role}
                        size="small"
                        color={getRoleColor(employee.role)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={employee.status.replace(/_/g, ' ')}
                        size="small"
                        color={getStatusColor(employee.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {employee.dateOfJoining
                        ? new Date(employee.dateOfJoining).toLocaleDateString()
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </PageCard>
        </>
      ) : null}

      {/* Success Dialog with Credentials */}
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleRoundedIcon color="success" />
            <Typography variant="h6">Employee Created Successfully</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {newEmployeeCredentials && (
            <>
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600}>
                  ⚠️ Important: Save these credentials securely!
                </Typography>
                <Typography variant="caption">
                  The temporary password is shown only once and expires in 7 days.
                </Typography>
              </Alert>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Employee Details
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Grid container spacing={1}>
                    <Grid size={6}>
                      <Typography variant="caption">Employee Code</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {newEmployeeCredentials.employee.employeeCode}
                      </Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="caption">Name</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {newEmployeeCredentials.employee.name}
                      </Typography>
                    </Grid>
                    <Grid size={12}>
                      <Typography variant="caption">Email</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {newEmployeeCredentials.employee.email}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Login Credentials
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'warning.light' }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption">Temporary Password</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography
                          variant="body1"
                          fontWeight={700}
                          fontFamily="monospace"
                          sx={{ flex: 1 }}
                        >
                          {showPassword
                            ? newEmployeeCredentials.credentials.temporaryPassword
                            : '••••••••••••••••'}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            copyToClipboard(
                              newEmployeeCredentials.credentials.temporaryPassword,
                              'Password'
                            )
                          }
                        >
                          <ContentCopyRoundedIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption">Expires At</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {new Date(
                          newEmployeeCredentials.credentials.expiresAt
                        ).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption">Login URL</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        http://localhost:5173 (Employee/Admin tab)
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Box>

              <Alert severity="info">
                <Typography variant="caption">
                  Share these credentials with the employee securely. They will be required to change
                  the password on first login.
                </Typography>
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <BrandedButton onClick={() => setSuccessDialogOpen(false)}>Done</BrandedButton>
        </DialogActions>
      </Dialog>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
}
