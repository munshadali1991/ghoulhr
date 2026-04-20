import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { createOrganization, getOrganizationById, updateOrganization } from '../services/organizationsApi';

const emptyForm = {
  // 1. Basic Organization Details
  name: '',
  shortName: '',
  subdomain: '',
  industryType: '',
  organizationType: '',
  dateOfIncorporation: '',
  companyLogo: '',
  websiteUrl: '',
  timeZone: '',
  financialYearStartMonth: '',

  // 2. Address Details
  registeredOfficeAddress: '',
  city: '',
  state: '',
  country: '',
  pinCode: '',
  contactNumber: '',
  officialEmail: '',

  // 3. Statutory & Compliance
  panNumber: '',
  tanNumber: '',
  gstin: '',
  pfEstablishmentCode: '',
  esiCode: '',
  professionalTaxRegistrationNumber: '',
  labourWelfareFundDetails: '',
  cinNumber: '',

  // 4. Payroll Settings
  salaryStructureTemplate: '',
  defaultEarningsAndDeductions: '',
  pfEsiApplicability: '',
  tdsSettings: '',
  bankDetailsForSalaryProcessing: '',
  payCycle: '',
  salaryDisbursementDate: '',
  monthlySubscriptionAmount: 0,

  // 5. Admin User Details
  adminName: '',
  adminEmail: '',
  adminMobileNumber: '',
  adminRolePermissions: '',

  // 6. Bank Details
  bankName: '',
  branchName: '',
  ifscCode: '',
  accountNumber: '',
};

export function OrganizationFormPage({ accessToken, onSaved }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(Boolean(id));
  const [error, setError] = useState('');
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      if (!id || !accessToken) {
        setLoadingInitial(false);
        return;
      }

      // Prevent double fetch in React StrictMode (effects run twice in dev)
      if (hasLoadedRef.current) {
        return;
      }
      hasLoadedRef.current = true;

      setError('');
      try {
        const org = await getOrganizationById(accessToken, id);
        setForm((prev) => ({
          ...prev,
          ...org,
        }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingInitial(false);
      }
    };

    if (isEdit) {
      load();
    }
  }, [id, accessToken, isEdit]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!accessToken) return;
    setLoading(true);
    setError('');
    try {
      // Remove backend-managed fields like id/timestamps from payload
      const {
        id: _id,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        deletedAt: _deletedAt,
        ...rest
      } = form;

      const payload = {
        ...rest,
        name: (rest.name || '').trim(),
        subdomain: (rest.subdomain || '').trim().toLowerCase(),
        monthlySubscriptionAmount: Number(rest.monthlySubscriptionAmount || 0),
      };

      if (isEdit && id) {
        await updateOrganization(accessToken, id, payload);
      } else {
        await createOrganization(accessToken, payload);
      }

      await onSaved?.();
      navigate('/organizations');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingInitial) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '60vh' }}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} mb={2}>
          {isEdit ? 'Edit Organization' : 'Create Organization'}
        </Typography>
        {error ? (
          <Typography color="error" variant="body2" mb={2}>
            {error}
          </Typography>
        ) : null}
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={1.5}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Typography fontWeight={700}>1. Basic Organization Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1.2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Organization Name"
                      required
                      value={form.name}
                      onChange={handleChange('name')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Short Name / Display Name"
                      value={form.shortName}
                      onChange={handleChange('shortName')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Subdomain"
                      required
                      value={form.subdomain}
                      onChange={handleChange('subdomain')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Industry Type"
                      value={form.industryType}
                      onChange={handleChange('industryType')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Organization Type"
                      value={form.organizationType}
                      onChange={handleChange('organizationType')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Date of Incorporation"
                      type="date"
                      value={form.dateOfIncorporation}
                      onChange={handleChange('dateOfIncorporation')}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Company Logo URL"
                      value={form.companyLogo}
                      onChange={handleChange('companyLogo')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Website URL"
                      value={form.websiteUrl}
                      onChange={handleChange('websiteUrl')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Time Zone"
                      value={form.timeZone}
                      onChange={handleChange('timeZone')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Financial Year Start Month"
                      value={form.financialYearStartMonth}
                      onChange={handleChange('financialYearStartMonth')}
                      fullWidth
                    />
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
                    <TextField
                      label="Registered Office Address"
                      value={form.registeredOfficeAddress}
                      onChange={handleChange('registeredOfficeAddress')}
                      fullWidth
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="City"
                      value={form.city}
                      onChange={handleChange('city')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="State"
                      value={form.state}
                      onChange={handleChange('state')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Country"
                      value={form.country}
                      onChange={handleChange('country')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="PIN Code"
                      value={form.pinCode}
                      onChange={handleChange('pinCode')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Contact Number"
                      value={form.contactNumber}
                      onChange={handleChange('contactNumber')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Official Email ID"
                      value={form.officialEmail}
                      onChange={handleChange('officialEmail')}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Typography fontWeight={700}>3. Statutory & Compliance Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1.2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="PAN Number"
                      value={form.panNumber}
                      onChange={handleChange('panNumber')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="TAN Number"
                      value={form.tanNumber}
                      onChange={handleChange('tanNumber')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="GSTIN"
                      value={form.gstin}
                      onChange={handleChange('gstin')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="PF Establishment Code"
                      value={form.pfEstablishmentCode}
                      onChange={handleChange('pfEstablishmentCode')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="ESI Code"
                      value={form.esiCode}
                      onChange={handleChange('esiCode')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Professional Tax Registration Number"
                      value={form.professionalTaxRegistrationNumber}
                      onChange={handleChange('professionalTaxRegistrationNumber')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Labour Welfare Fund Details"
                      value={form.labourWelfareFundDetails}
                      onChange={handleChange('labourWelfareFundDetails')}
                      fullWidth
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="CIN Number"
                      value={form.cinNumber}
                      onChange={handleChange('cinNumber')}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Typography fontWeight={700}>4. Payroll Settings</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1.2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Salary Structure Template"
                      value={form.salaryStructureTemplate}
                      onChange={handleChange('salaryStructureTemplate')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Default Earnings & Deductions"
                      value={form.defaultEarningsAndDeductions}
                      onChange={handleChange('defaultEarningsAndDeductions')}
                      fullWidth
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="PF/ESI Applicability"
                      value={form.pfEsiApplicability}
                      onChange={handleChange('pfEsiApplicability')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="TDS Settings"
                      value={form.tdsSettings}
                      onChange={handleChange('tdsSettings')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Bank Details for Salary Processing"
                      value={form.bankDetailsForSalaryProcessing}
                      onChange={handleChange('bankDetailsForSalaryProcessing')}
                      fullWidth
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Pay Cycle"
                      value={form.payCycle}
                      onChange={handleChange('payCycle')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Salary Disbursement Date"
                      value={form.salaryDisbursementDate}
                      onChange={handleChange('salaryDisbursementDate')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Monthly Subscription Amount"
                      type="number"
                      value={form.monthlySubscriptionAmount}
                      onChange={handleChange('monthlySubscriptionAmount')}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Typography fontWeight={700}>5. Admin User Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1.2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Admin Name"
                      value={form.adminName}
                      onChange={handleChange('adminName')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Admin Email"
                      value={form.adminEmail}
                      onChange={handleChange('adminEmail')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Mobile Number"
                      value={form.adminMobileNumber}
                      onChange={handleChange('adminMobileNumber')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Role & Permissions"
                      value={form.adminRolePermissions}
                      onChange={handleChange('adminRolePermissions')}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Typography fontWeight={700}>6. Bank Details (Salary Processing)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1.2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Bank Name"
                      value={form.bankName}
                      onChange={handleChange('bankName')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Branch Name"
                      value={form.branchName}
                      onChange={handleChange('branchName')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="IFSC Code"
                      value={form.ifscCode}
                      onChange={handleChange('ifscCode')}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Account Number"
                      value={form.accountNumber}
                      onChange={handleChange('accountNumber')}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Stack direction="row" spacing={1.2}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveRoundedIcon />}
                disabled={loading}
              >
                {loading ? 'Saving...' : isEdit ? 'Update Organization' : 'Create Organization'}
              </Button>
              <Button variant="outlined" onClick={() => navigate('/organizations')}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

