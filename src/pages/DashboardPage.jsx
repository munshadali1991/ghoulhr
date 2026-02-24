import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Drawer,
  FormControl,
  Grid,
  InputLabel,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import RestoreFromTrashRoundedIcon from '@mui/icons-material/RestoreFromTrashRounded';
import { useEffect, useMemo, useState } from 'react';
import { SidebarContent } from '../components/layout/SidebarContent';
import {
  createOrganization,
  deleteOrganization,
  getSuperAdminDashboardStats,
  listDeletedOrganizations,
  listOrganizations,
  restoreOrganization,
  updateOrganization,
} from '../services/organizationsApi';

const DRAWER_WIDTH = 280;

const emptyOrganizationForm = {
  name: '',
  subdomain: '',
  status: 'ACTIVE',
  shortName: '',
  industryType: '',
  organizationType: '',
  dateOfIncorporation: '',
  companyLogo: '',
  websiteUrl: '',
  timeZone: '',
  financialYearStartMonth: '',
  registeredOfficeAddress: '',
  city: '',
  state: '',
  country: '',
  pinCode: '',
  contactNumber: '',
  officialEmail: '',
  panNumber: '',
  tanNumber: '',
  gstin: '',
  pfEstablishmentCode: '',
  esiCode: '',
  professionalTaxRegistrationNumber: '',
  labourWelfareFundDetails: '',
  cinNumber: '',
  salaryStructureTemplate: '',
  defaultEarningsAndDeductions: '',
  pfEsiApplicability: '',
  tdsSettings: '',
  bankDetailsForSalaryProcessing: '',
  payCycle: '',
  salaryDisbursementDate: '',
  adminName: '',
  adminEmail: '',
  adminMobileNumber: '',
  adminRolePermissions: '',
  bankName: '',
  branchName: '',
  ifscCode: '',
  accountNumber: '',
  monthlySubscriptionAmount: 0,
};

const navItems = [
  { key: 'overview', label: 'Dashboard', icon: <DashboardRoundedIcon />, active: true },
  { label: 'Organizations', icon: <ApartmentRoundedIcon /> },
  { label: 'Users', icon: <GroupsRoundedIcon /> },
  { label: 'Billing', icon: <AccountBalanceWalletRoundedIcon /> },
  { label: 'Settings', icon: <SettingsRoundedIcon /> },
];

export function DashboardPage({
  accessToken,
  user,
  userName,
  mobileDrawerOpen,
  onOpenMobileDrawer,
  onCloseMobileDrawer,
  onLogout,
}) {
  const [activeSection, setActiveSection] = useState('overview');
  const [organizations, setOrganizations] = useState([]);
  const [deletedOrganizations, setDeletedOrganizations] = useState([]);
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalUsers: 0,
    totalRevenue: 0,
    organizationGrowth: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editingOrganizationId, setEditingOrganizationId] = useState(null);
  const [createForm, setCreateForm] = useState(emptyOrganizationForm);
  const [isCreating, setIsCreating] = useState(false);
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

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const filteredOrganizations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return organizations;
    }

    return organizations.filter((org) => {
      return (
        org.name?.toLowerCase().includes(query) || org.subdomain?.toLowerCase().includes(query)
      );
    });
  }, [organizations, search]);

  const activeCount = organizations.filter((org) => org.status === 'ACTIVE').length;
  const inactiveCount = organizations.filter((org) => org.status === 'INACTIVE').length;
  const maxGrowthValue = Math.max(...stats.organizationGrowth.map((item) => item.count), 1);

  const loadOrganizations = async () => {
    if (!accessToken || !isSuperAdmin) {
      setIsLoading(false);
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const [organizationsResponse, deletedOrganizationsResponse, statsResponse] = await Promise.all([
        listOrganizations(accessToken),
        listDeletedOrganizations(accessToken),
        getSuperAdminDashboardStats(accessToken),
      ]);
      setOrganizations(Array.isArray(organizationsResponse) ? organizationsResponse : []);
      setDeletedOrganizations(
        Array.isArray(deletedOrganizationsResponse) ? deletedOrganizationsResponse : [],
      );
      if (statsResponse) {
        setStats(statsResponse);
      }
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, isSuperAdmin]);

  const handleCreateField = (field) => (event) => {
    setCreateForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleCreateOrganization = async (event) => {
    event.preventDefault();
    setError('');
    setIsCreating(true);
    try {
      const payload = {
        ...createForm,
        name: createForm.name.trim(),
        subdomain: createForm.subdomain.trim().toLowerCase(),
        monthlySubscriptionAmount: Number(createForm.monthlySubscriptionAmount || 0),
      };

      if (editingOrganizationId) {
        await updateOrganization(accessToken, editingOrganizationId, payload);
      } else {
        await createOrganization(accessToken, payload);
      }

      setEditingOrganizationId(null);
      setCreateForm(emptyOrganizationForm);
      await loadOrganizations();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditOrganization = (org) => {
    setEditingOrganizationId(org.id);
    setCreateForm({
      ...emptyOrganizationForm,
      ...org,
      monthlySubscriptionAmount: Number(org.monthlySubscriptionAmount ?? 0),
    });
    setActiveSection('organizations');
  };

  const handleDeleteOrganization = async (organizationId) => {
    setError('');
    try {
      await deleteOrganization(accessToken, organizationId);
      if (editingOrganizationId === organizationId) {
        setEditingOrganizationId(null);
        setCreateForm(emptyOrganizationForm);
      }
      await loadOrganizations();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const handleRestoreOrganization = async (organizationId) => {
    setError('');
    try {
      await restoreOrganization(accessToken, organizationId);
      await loadOrganizations();
    } catch (restoreError) {
      setError(restoreError.message);
    }
  };

  const renderOverview = () => (
    <>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Organizations
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {stats.totalOrganizations}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Users (All Orgs)
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {stats.totalUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Revenue (Monthly)
              </Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">
                INR {Number(stats.totalRevenue ?? 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} mt={0.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Organization Growth (Last 6 Months)
              </Typography>
              <Stack spacing={1.4}>
                {stats.organizationGrowth.map((entry) => (
                  <Box key={entry.month}>
                    <Stack direction="row" justifyContent="space-between" mb={0.4}>
                      <Typography variant="body2">{entry.month}</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {entry.count}
                      </Typography>
                    </Stack>
                    <Box sx={{ width: '100%', height: 10, borderRadius: 99, bgcolor: 'grey.200' }}>
                      <Box
                        sx={{
                          width: `${(entry.count / maxGrowthValue) * 100}%`,
                          height: '100%',
                          borderRadius: 99,
                          bgcolor: 'primary.main',
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={1.25}>
                Org Status Snapshot
              </Typography>
              <Stack spacing={1}>
                <Paper variant="outlined" sx={{ p: 1.25 }}>
                  <Typography variant="body2">Active Organizations</Typography>
                  <Typography variant="h5" fontWeight={700} color="success.main">
                    {activeCount}
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 1.25 }}>
                  <Typography variant="body2">Inactive Organizations</Typography>
                  <Typography variant="h5" fontWeight={700} color="warning.main">
                    {inactiveCount}
                  </Typography>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );

  const renderOrganizationForm = () => (
    <Box component="form" onSubmit={handleCreateOrganization}>
      <Stack spacing={1.2}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography fontWeight={700}>1. Basic Organization Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1.2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Organization Name" required value={createForm.name} onChange={handleCreateField('name')} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Short Name / Display Name" value={createForm.shortName} onChange={handleCreateField('shortName')} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Subdomain" required value={createForm.subdomain} onChange={handleCreateField('subdomain')} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Industry Type" value={createForm.industryType} onChange={handleCreateField('industryType')} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Organization Type" value={createForm.organizationType} onChange={handleCreateField('organizationType')} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Date of Incorporation" type="date" value={createForm.dateOfIncorporation} onChange={handleCreateField('dateOfIncorporation')} fullWidth InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Company Logo URL" value={createForm.companyLogo} onChange={handleCreateField('companyLogo')} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Website URL" value={createForm.websiteUrl} onChange={handleCreateField('websiteUrl')} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Time Zone" value={createForm.timeZone} onChange={handleCreateField('timeZone')} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Financial Year Start Month" value={createForm.financialYearStartMonth} onChange={handleCreateField('financialYearStartMonth')} fullWidth />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography fontWeight={700}>2. Address Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1.2}>
              <Grid size={12}>
                <TextField label="Registered Office Address" value={createForm.registeredOfficeAddress} onChange={handleCreateField('registeredOfficeAddress')} fullWidth multiline rows={2} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="City" value={createForm.city} onChange={handleCreateField('city')} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="State" value={createForm.state} onChange={handleCreateField('state')} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Country" value={createForm.country} onChange={handleCreateField('country')} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="PIN Code" value={createForm.pinCode} onChange={handleCreateField('pinCode')} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Contact Number" value={createForm.contactNumber} onChange={handleCreateField('contactNumber')} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Official Email ID" value={createForm.officialEmail} onChange={handleCreateField('officialEmail')} fullWidth /></Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography fontWeight={700}>3. Statutory & Compliance Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1.2}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="PAN Number" value={createForm.panNumber} onChange={handleCreateField('panNumber')} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="TAN Number" value={createForm.tanNumber} onChange={handleCreateField('tanNumber')} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="GSTIN" value={createForm.gstin} onChange={handleCreateField('gstin')} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="PF Establishment Code" value={createForm.pfEstablishmentCode} onChange={handleCreateField('pfEstablishmentCode')} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="ESI Code" value={createForm.esiCode} onChange={handleCreateField('esiCode')} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Professional Tax Registration Number" value={createForm.professionalTaxRegistrationNumber} onChange={handleCreateField('professionalTaxRegistrationNumber')} fullWidth /></Grid>
              <Grid size={12}><TextField label="Labour Welfare Fund Details" value={createForm.labourWelfareFundDetails} onChange={handleCreateField('labourWelfareFundDetails')} fullWidth multiline rows={2} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="CIN Number" value={createForm.cinNumber} onChange={handleCreateField('cinNumber')} fullWidth /></Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography fontWeight={700}>4. Payroll Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1.2}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Salary Structure Template" value={createForm.salaryStructureTemplate} onChange={handleCreateField('salaryStructureTemplate')} fullWidth /></Grid>
              <Grid size={12}><TextField label="Default Earnings & Deductions" value={createForm.defaultEarningsAndDeductions} onChange={handleCreateField('defaultEarningsAndDeductions')} fullWidth multiline rows={2} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="PF/ESI Applicability" value={createForm.pfEsiApplicability} onChange={handleCreateField('pfEsiApplicability')} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="TDS Settings" value={createForm.tdsSettings} onChange={handleCreateField('tdsSettings')} fullWidth /></Grid>
              <Grid size={12}><TextField label="Bank Details for Salary Processing" value={createForm.bankDetailsForSalaryProcessing} onChange={handleCreateField('bankDetailsForSalaryProcessing')} fullWidth multiline rows={2} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Pay Cycle" value={createForm.payCycle} onChange={handleCreateField('payCycle')} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Salary Disbursement Date" value={createForm.salaryDisbursementDate} onChange={handleCreateField('salaryDisbursementDate')} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Monthly Subscription Amount" type="number" value={createForm.monthlySubscriptionAmount} onChange={handleCreateField('monthlySubscriptionAmount')} fullWidth /></Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography fontWeight={700}>5. Admin User Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1.2}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Admin Name" value={createForm.adminName} onChange={handleCreateField('adminName')} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Admin Email" value={createForm.adminEmail} onChange={handleCreateField('adminEmail')} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Mobile Number" value={createForm.adminMobileNumber} onChange={handleCreateField('adminMobileNumber')} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Role & Permissions" value={createForm.adminRolePermissions} onChange={handleCreateField('adminRolePermissions')} fullWidth /></Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography fontWeight={700}>6. Bank Details (Salary Processing)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1.2}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Bank Name" value={createForm.bankName} onChange={handleCreateField('bankName')} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Branch Name" value={createForm.branchName} onChange={handleCreateField('branchName')} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="IFSC Code" value={createForm.ifscCode} onChange={handleCreateField('ifscCode')} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Account Number" value={createForm.accountNumber} onChange={handleCreateField('accountNumber')} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="organization-status-label">Status</InputLabel>
                  <Select
                    labelId="organization-status-label"
                    label="Status"
                    value={createForm.status}
                    onChange={handleCreateField('status')}
                  >
                    <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                    <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Stack direction="row" spacing={1.2}>
          <Button
            type="submit"
            variant="contained"
            startIcon={editingOrganizationId ? <SaveRoundedIcon /> : <AddRoundedIcon />}
            disabled={isCreating}
          >
            {isCreating
              ? editingOrganizationId
                ? 'Updating...'
                : 'Creating...'
              : editingOrganizationId
                ? 'Update Organization'
                : 'Create Organization'}
          </Button>
          {editingOrganizationId ? (
            <Button
              variant="outlined"
              onClick={() => {
                setEditingOrganizationId(null);
                setCreateForm(emptyOrganizationForm);
              }}
            >
              Cancel Edit
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );

  const renderOrganizationManagement = () => (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 5 }}>
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>
              {editingOrganizationId ? 'Edit Organization' : 'Create Organization'}
            </Typography>
            {renderOrganizationForm()}
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, lg: 7 }}>
        <Stack spacing={2}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                justifyContent="space-between"
                mb={2}
              >
                <Typography variant="h6" fontWeight={700}>
                  Organizations
                </Typography>
                <TextField
                  size="small"
                  label="Search org"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  sx={{ minWidth: { xs: '100%', sm: 240 } }}
                />
              </Stack>

              {isLoading ? (
                <Stack direction="row" justifyContent="center" py={4}>
                  <CircularProgress size={30} />
                </Stack>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Subdomain</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredOrganizations.map((org) => (
                        <TableRow key={org.id} hover>
                          <TableCell>{org.name}</TableCell>
                          <TableCell>{org.subdomain}.ghoulhr.com</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={org.status}
                              color={org.status === 'ACTIVE' ? 'success' : 'warning'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<EditRoundedIcon />}
                                onClick={() => handleEditOrganization(org)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                startIcon={<DeleteRoundedIcon />}
                                onClick={() => handleDeleteOrganization(org.id)}
                              >
                                Delete
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredOrganizations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            No organizations found
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Recycle Bin (Soft Deleted Organizations)
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Subdomain</TableCell>
                      <TableCell>Deleted At</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deletedOrganizations.map((org) => (
                      <TableRow key={org.id} hover>
                        <TableCell>{org.name}</TableCell>
                        <TableCell>{org.subdomain}.ghoulhr.com</TableCell>
                        <TableCell>
                          {org.deletedAt ? new Date(org.deletedAt).toLocaleString() : '-'}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<RestoreFromTrashRoundedIcon />}
                            onClick={() => handleRestoreOrganization(org.id)}
                          >
                            Restore
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {deletedOrganizations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          Recycle bin is empty
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Stack>
      </Grid>
    </Grid>
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
              Welcome back, {userName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Live HR command center for your organization.
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
        {!isSuperAdmin ? (
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Alert severity="warning" sx={{ mb: 2 }}>
                This dashboard is currently available for SUPER_ADMIN only.
              </Alert>
              <Typography variant="body2" color="text.secondary">
                You are logged in as <strong>{user?.role}</strong>. Please use a SUPER_ADMIN account
                to manage organization-level data.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

            {activeSection === 'organizations' ? renderOrganizationManagement() : renderOverview()}
          </>
        )}
      </Box>
    </Box>
  );
}
