import { useForm } from 'react-hook-form';
import { useSettings } from '../hooks/useSettings';
import { useEmployeeSettings } from '../hooks/useEmployeeSettings';
import { useAttendanceSettings } from '../hooks/useAttendanceSettings';
import { SettingsSection } from '../components/settings/SettingsSection';
import { SettingsField } from '../components/settings/SettingsField';
import { DraftStatusBar } from '../components/settings/DraftStatusBar';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  MenuItem,
  Avatar,
  Divider,
  Paper,
  Tabs,
  Tab,
  Chip,
  Skeleton,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BusinessIcon from '@mui/icons-material/Business';
import LanguageIcon from '@mui/icons-material/Language';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useState, useEffect, useRef, useCallback } from 'react';
import { EmployeeSettingsForm } from './EmployeeSettingsForm';
import { AttendanceSettingsForm } from './AttendanceSettingsForm';

// Constants for dropdown options
const TIMEZONES = [
  'Asia/Kolkata',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/London',
  'Asia/Singapore',
  'Australia/Sydney',
];

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
];

export function SettingsPage({ organizationId }) {
  const { settings: orgSettings, isLoading: orgLoading, updateSettings: updateOrgSettings } = useSettings(
    organizationId
  );
  const employeeSettingsHook = useEmployeeSettings(organizationId);
  const attendanceSettingsHook = useAttendanceSettings(organizationId);

  const [activeTab, setActiveTab] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Draft state for organization settings
  const [orgDraft, setOrgDraft] = useState({});
  const [hasOrgChanges, setHasOrgChanges] = useState(false);
  
  // Logo preview
  const [logoPreview, setLogoPreview] = useState(null);
  
  // Form initialization
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: '',
      logo: '',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      dateFormat: 'DD/MM/YYYY',
      language: 'en',
    },
  });

  const formValues = watch();

  // Initialize form when settings are loaded
  useEffect(() => {
    if (orgSettings && Object.keys(orgSettings).length > 0) {
      reset({
        name: orgSettings.name || '',
        logo: orgSettings.logo || '',
        timezone: orgSettings.timezone || 'Asia/Kolkata',
        currency: orgSettings.currency || 'INR',
        dateFormat: orgSettings.dateFormat || 'DD/MM/YYYY',
        language: orgSettings.language || 'en',
      });
      if (orgSettings.logo) {
        setLogoPreview(orgSettings.logo);
      }
    }
  }, [orgSettings, reset]);

  // Track changes for draft workflow
  useEffect(() => {
    if (orgSettings && Object.keys(orgSettings).length > 0) {
      const hasChanges = 
        formValues.name !== (orgSettings.name || '') ||
        formValues.timezone !== (orgSettings.timezone || 'Asia/Kolkata') ||
        formValues.currency !== (orgSettings.currency || 'INR') ||
        formValues.dateFormat !== (orgSettings.dateFormat || 'DD/MM/YYYY') ||
        formValues.language !== (orgSettings.language || 'en') ||
        (logoPreview && logoPreview !== orgSettings.logo);
      
      setHasOrgChanges(hasChanges);
    }
  }, [formValues, orgSettings, logoPreview]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle logo file upload
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setLogoPreview(base64String);
        setValue('logo', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Publish all changes
  const handlePublish = useCallback(async () => {
    try {
      setIsPublishing(true);
      setSuccessMessage('');

      // Publish organization settings if changed
      if (hasOrgChanges) {
        await updateOrgSettings(formValues);
      }

      setSuccessMessage('All changes published successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to publish changes:', err);
    } finally {
      setIsPublishing(false);
    }
  }, [hasOrgChanges, formValues, updateOrgSettings]);

  // Discard all changes
  const handleDiscard = useCallback(() => {
    if (orgSettings) {
      reset({
        name: orgSettings.name || '',
        logo: orgSettings.logo || '',
        timezone: orgSettings.timezone || 'Asia/Kolkata',
        currency: orgSettings.currency || 'INR',
        dateFormat: orgSettings.dateFormat || 'DD/MM/YYYY',
        language: orgSettings.language || 'en',
      });
      if (orgSettings.logo) {
        setLogoPreview(orgSettings.logo);
      }
    }
    setHasOrgChanges(false);
  }, [orgSettings, reset]);

  // Calculate total change count
  const changeCount = (hasOrgChanges ? 1 : 0);

  // Loading skeleton
  if (orgLoading) {
    return (
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={300} height={24} sx={{ mb: 4 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2, mb: 3 }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', pb: hasOrgChanges ? 8 : 0 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your organization and employee settings
        </Typography>
      </Box>

      {/* Success Alert */}
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          icon={<CheckCircleIcon fontSize="inherit" />}
        >
          {successMessage}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="settings tabs">
          <Tab label="Organization" />
          <Tab label="Employees" />
          <Tab label="Attendance" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <OrganizationSettingsContent
          formValues={formValues}
          orgSettings={orgSettings}
          errors={errors}
          register={register}
          handleSubmit={handleSubmit}
          setValue={setValue}
          logoPreview={logoPreview}
          handleLogoUpload={handleLogoUpload}
          reset={reset}
        />
      )}

      {activeTab === 1 && (
        <EmployeeSettingsForm
          organizationId={organizationId}
        />
      )}

      {activeTab === 2 && (
        <AttendanceSettingsForm
          organizationId={organizationId}
        />
      )}

      {/* Draft Status Bar */}
      <DraftStatusBar
        hasChanges={hasOrgChanges}
        isPublishing={isPublishing}
        onPublish={handlePublish}
        onDiscard={handleDiscard}
        changeCount={changeCount}
      />
    </Box>
  );
}

// Organization Settings Content Component
function OrganizationSettingsContent({
  formValues,
  orgSettings,
  errors,
  register,
  handleSubmit,
  setValue,
  logoPreview,
  handleLogoUpload,
  reset,
}) {
  return (
    <Box component="form">
      {/* Organization Profile Section */}
      <SettingsSection
        icon={<BusinessIcon color="primary" />}
        title="Organization Profile"
        description="Basic information about your organization"
      >
        <Grid container spacing={3} alignItems="center">
          {/* Logo Upload */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.default',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Avatar
                src={logoPreview || undefined}
                sx={{
                  width: 100,
                  height: 100,
                  mb: 2,
                  mx: 'auto',
                  border: '2px solid',
                  borderColor: 'divider',
                }}
              >
                {!logoPreview && <BusinessIcon sx={{ fontSize: 48 }} />}
              </Avatar>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Organization Logo
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="logo-upload"
                type="file"
                onChange={handleLogoUpload}
              />
              <label htmlFor="logo-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  size="small"
                  fullWidth
                >
                  Upload Logo
                </Button>
              </label>
            </Paper>
          </Grid>

          {/* Organization Name */}
          <Grid item xs={12} md={8}>
            <SettingsField
              label="Organization Name"
              required
              error={errors.name?.message}
              description="This name will be displayed across your organization's dashboard and reports"
            >
              <TextField
                fullWidth
                placeholder="Enter organization name"
                {...register('name', { required: 'Organization name is required' })}
                error={!!errors.name}
                size="medium"
              />
            </SettingsField>
          </Grid>
        </Grid>
      </SettingsSection>

      {/* Regional Settings Section */}
      <SettingsSection
        icon={<LanguageIcon color="primary" />}
        title="Regional Settings"
        description="Configure timezone, currency, and localization preferences"
      >
        <Grid container spacing={3}>
          {/* Timezone */}
          <Grid item xs={12} md={6}>
            <SettingsField
              label="Timezone"
              required
              error={errors.timezone?.message}
              description="Your organization's primary timezone"
            >
              <TextField
                fullWidth
                select
                {...register('timezone', { required: 'Timezone is required' })}
                error={!!errors.timezone}
                size="medium"
              >
                {TIMEZONES.map((timezone) => (
                  <MenuItem key={timezone} value={timezone}>
                    {timezone.replace('_', ' ')}
                  </MenuItem>
                ))}
              </TextField>
            </SettingsField>
          </Grid>

          {/* Currency */}
          <Grid item xs={12} md={6}>
            <SettingsField
              label="Currency"
              required
              error={errors.currency?.message}
              description="Default currency for salary processing"
            >
              <TextField
                fullWidth
                select
                {...register('currency', { required: 'Currency is required' })}
                error={!!errors.currency}
                size="medium"
              >
                {CURRENCIES.map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))}
              </TextField>
            </SettingsField>
          </Grid>

          {/* Date Format */}
          <Grid item xs={12} md={6}>
            <SettingsField
              label="Date Format"
              required
              error={errors.dateFormat?.message}
              description="How dates will be displayed throughout the system"
            >
              <TextField
                fullWidth
                select
                {...register('dateFormat', { required: 'Date format is required' })}
                error={!!errors.dateFormat}
                size="medium"
              >
                {DATE_FORMATS.map((format) => (
                  <MenuItem key={format} value={format}>
                    {format}
                  </MenuItem>
                ))}
              </TextField>
            </SettingsField>
          </Grid>

          {/* Language */}
          <Grid item xs={12} md={6}>
            <SettingsField
              label="Language"
              required
              error={errors.language?.message}
              description="Interface language for the application"
            >
              <TextField
                fullWidth
                select
                {...register('language', { required: 'Language is required' })}
                error={!!errors.language}
                size="medium"
              >
                {LANGUAGES.map((lang) => (
                  <MenuItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </MenuItem>
                ))}
              </TextField>
            </SettingsField>
          </Grid>
        </Grid>
      </SettingsSection>
    </Box>
  );
}
