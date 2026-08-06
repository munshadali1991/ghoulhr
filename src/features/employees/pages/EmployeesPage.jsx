import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { MobileDataCard } from '@/shared/components/data/MobileDataCard';
import { TableRowActions } from '@/shared/components/data/TableRowActions';
import { useIsMobileLayout } from '@/shared/hooks/useIsMobileLayout';
import { CrudButton } from '@/shared/components/ui/CrudButton';
import { PageCard } from '@/shared/components/ui/PageCard';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';
import {
  getEmployeeById,
  listEmployees,
  resetEmployeePassword,
} from '@/features/employees/api/employeesApi';
import { EmployeeCredentialsDialog } from '@/features/employees/components/EmployeeCredentialsDialog';
import { EmployeeOnboardingWizard } from '@/features/employees/onboarding/EmployeeOnboardingWizard';
import { mapEmployeeToOnboardingValues } from '@/features/employees/onboarding/onboardingSchema';
import { ReportingManagersTab } from '@/features/employees/reporting/ReportingManagersTab';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';
import { EMPLOYEES_MODULE_ACCESS } from '@/features/auth/config/accessRegistry';

const DEFAULT_ROWS_PER_PAGE = 20;
const ROWS_PER_PAGE_OPTIONS = [10, 20, 50];
const headerButtonSx = {
  display: { xs: 'flex', sm: 'inline-flex' },
  whiteSpace: 'nowrap',
  px: 2.5,
  py: 1,
};

export function EmployeesPage({ organizationId }) {
  const isMobileLayout = useIsMobileLayout();
  const { can, getAllowedTabs } = useAuthorization();
  const employeeTabs = getAllowedTabs(EMPLOYEES_MODULE_ACCESS.tabs);
  const directoryTab = EMPLOYEES_MODULE_ACCESS.tabs[0];
  const canCreate = can(directoryTab?.actions?.create);
  const canOnboard = can(directoryTab?.actions?.onboard);
  const canUpdate = can(directoryTab?.actions?.update);
  const canResetPassword = can(directoryTab?.actions?.resetPassword);
  const canAddEmployee = canCreate || canOnboard;
  const [pageTab, setPageTab] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [credentialsTitle, setCredentialsTitle] = useState('Employee Credentials');
  const { snackbar, show: showSnackbar, close: closeSnackbar } = useAppSnackbar();
  const [credentials, setCredentials] = useState(null);
  const [regeneratingId, setRegeneratingId] = useState('');
  const [showEditWizard, setShowEditWizard] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [editInitialValues, setEditInitialValues] = useState(null);
  const isDirectoryTab = employeeTabs[pageTab]?.key === 'directory';

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
    setCredentials({
      employeeId: result.employee?.id,
      employeeCode: result.employee?.employeeCode,
      name: result.employee?.name,
      email: result.employee?.email,
      temporaryPassword: result.credentials?.temporaryPassword,
      expiresAt: result.credentials?.expiresAt,
      loginUrl: result.credentials?.loginUrl,
    });
    setCredentialsTitle('Employee Created Successfully');
    setCredentialsOpen(true);
    setShowAddWizard(false);
    await fetchEmployees();
    showSnackbar('Employee created successfully!', 'success');
  };

  const handleRegenerateCredentials = async (employee) => {
    const confirmed = window.confirm(
      `Regenerate login credentials for "${employee.name}"?\n\nEmail: ${employee.email}\nThe current password will stop working immediately.`,
    );
    if (!confirmed) return;

    setRegeneratingId(employee.id);
    try {
      const result = await resetEmployeePassword(employee.id);
      setCredentials({
        employeeId: result.employeeId || employee.id,
        employeeCode: result.employeeCode || employee.employeeCode,
        name: result.name || employee.name,
        email: result.email || employee.email,
        temporaryPassword: result.temporaryPassword,
        expiresAt: result.expiresAt,
        loginUrl: result.loginUrl,
        organizationName: result.organizationName,
      });
      setCredentialsTitle('Employee Password Regenerated');
      setCredentialsOpen(true);
      showSnackbar('Employee password regenerated', 'success');
    } catch (error) {
      showSnackbar(error.message || 'Failed to regenerate credentials', 'error');
    } finally {
      setRegeneratingId('');
    }
  };

  const regenerateAction = (employee) =>
    canResetPassword ? (
      <Tooltip title="Regenerate credentials">
        <span>
          <IconButton
            size="small"
            color="primary"
            aria-label="Regenerate credentials"
            disabled={Boolean(regeneratingId)}
            onClick={() => handleRegenerateCredentials(employee)}
          >
            {regeneratingId === employee.id ? (
              <CircularProgress size={16} />
            ) : (
              <VpnKeyRoundedIcon fontSize="small" />
            )}
          </IconButton>
        </span>
      </Tooltip>
    ) : null;

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

  // Filter employees based on search
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.departmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designationName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const maxPage = Math.max(0, Math.ceil(filteredEmployees.length / rowsPerPage) - 1);

  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  useEffect(() => {
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, maxPage]);

  const paginatedEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
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
        {isDirectoryTab && canAddEmployee ? (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Button
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              onClick={fetchEmployees}
              disabled={loading}
              fullWidth
              sx={headerButtonSx}
            >
              Refresh
            </Button>
            <CrudButton
              intent="create"
              startIcon={<PersonAddRoundedIcon />}
              onClick={() => setShowAddWizard(true)}
              fullWidth
              sx={headerButtonSx}
            >
              Add Employee
            </CrudButton>
          </Stack>
        ) : isDirectoryTab ? (
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={fetchEmployees}
            disabled={loading}
            sx={headerButtonSx}
          >
            Refresh
          </Button>
        ) : null}
      </Box>

      <Tabs
        value={pageTab}
        onChange={(_, v) => setPageTab(v)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {employeeTabs.map((tab) => (
          <Tab key={tab.key} label={tab.label} />
        ))}
      </Tabs>

      {employeeTabs[pageTab]?.key === 'reporting-managers' ? (
        <ReportingManagersTab showSnackbar={showSnackbar} />
      ) : null}

      {employeeTabs[pageTab]?.key === 'directory' ? (
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
        {loading ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading employees...
            </Typography>
          </Box>
        ) : filteredEmployees.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {searchQuery ? 'No employees found matching your search' : 'No employees in your organization yet'}
            </Typography>
            {canAddEmployee ? (
              <Button
                variant="outlined"
                startIcon={<AddRoundedIcon />}
                onClick={() => setShowAddWizard(true)}
                sx={{ mt: 2 }}
              >
                Add Your First Employee
              </Button>
            ) : null}
          </Box>
        ) : isMobileLayout ? (
          <Stack spacing={1.5} sx={{ p: 2 }}>
            {paginatedEmployees.map((employee) => (
              <MobileDataCard
                key={employee.id}
                fields={[
                  { label: 'Employee Code', value: employee.employeeCode },
                  { label: 'Name', value: employee.name },
                  { label: 'Email', value: employee.email },
                  { label: 'Department', value: employee.departmentName || '-' },
                  { label: 'Designation', value: employee.designationName || '-' },
                  {
                    label: 'Role',
                    value: (
                      <Chip label={employee.role} size="small" color={getRoleColor(employee.role)} />
                    ),
                  },
                  {
                    label: 'Status',
                    value: (
                      <Chip
                        label={employee.status.replace(/_/g, ' ')}
                        size="small"
                        color={getStatusColor(employee.status)}
                      />
                    ),
                  },
                  {
                    label: 'Join Date',
                    value: employee.dateOfJoining
                      ? new Date(employee.dateOfJoining).toLocaleDateString()
                      : '-',
                  },
                ]}
                actions={
                  canUpdate || canResetPassword ? (
                    <TableRowActions
                      onEdit={canUpdate ? () => openEditWizard(employee) : undefined}
                      extra={regenerateAction(employee)}
                    />
                  ) : null
                }
              />
            ))}
            <TablePagination
              component="div"
              count={filteredEmployees.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
              labelRowsPerPage="Rows per page"
            />
          </Stack>
        ) : (
        <>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: { xs: 0, md: 720 } }}>
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
                {canUpdate || canResetPassword ? (
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                ) : null}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedEmployees.map((employee) => (
                  <TableRow
                    key={employee.id}
                    hover
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
                    {canUpdate || canResetPassword ? (
                      <TableCell
                        align="right"
                        className="table-actions-cell"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TableRowActions
                          onEdit={canUpdate ? () => openEditWizard(employee) : undefined}
                          extra={regenerateAction(employee)}
                        />
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredEmployees.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          labelRowsPerPage="Rows per page"
        />
        </>
        )}
      </PageCard>
        </>
      ) : null}

      <EmployeeCredentialsDialog
        open={credentialsOpen}
        title={credentialsTitle}
        credentials={credentials}
        onClose={() => {
          setCredentialsOpen(false);
          setCredentials(null);
        }}
        onNotify={showSnackbar}
      />

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
