import { useForm } from 'react-hook-form';
import { useSettings } from '../hooks/useSettings';
import { EmployeeSettingsForm } from './EmployeeSettingsForm';
import { AttendanceSettingsForm } from './AttendanceSettingsForm';
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
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import BusinessIcon from '@mui/icons-material/Business';
import LanguageIcon from '@mui/icons-material/Language';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useState, useEffect } from 'react';

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

export function SettingsPage({ accessToken, organizationId }) {
  const { settings, isLoading, error, updateSettings, isUpdating } = useSettings(
    accessToken,
    organizationId
  );

  const [successMessage, setSuccessMessage] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
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

  // Reset form when settings are loaded
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      reset(settings);
      if (settings.logo) {
        setLogoPreview(settings.logo);
      }
    }
  }, [settings, reset]);

  // Handle logo file upload (mock implementation)
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Convert to base64 for demo purposes
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setLogoPreview(base64String);
        setValue('logo', base64String);
        // In production, you would upload to a CDN and store the URL
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const onSubmit = async (formData) => {
    try {
      setSuccessMessage('');
      
      // If logo was uploaded, include it in the form data
      if (logoPreview && logoPreview !== settings.logo) {
        formData.logo = logoPreview;
      }

      // Call the update mutation
      await updateSettings(formData);
      
      setSuccessMessage('Settings updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      // Error is handled by React Query and available via the hook
      console.error('Failed to update settings:', err);
    }
  };

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your organization and employee settings
        </Typography>
      </Box>

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
          settings={settings}
          isLoading={isLoading}
          error={error}
          updateSettings={updateSettings}
          isUpdating={isUpdating}
          successMessage={successMessage}
          setSuccessMessage={setSuccessMessage}
          logoPreview={logoPreview}
          setLogoPreview={setLogoPreview}
          register={register}
          handleSubmit={handleSubmit}
          errors={errors}
          reset={reset}
          setValue={setValue}
          onSubmit={onSubmit}
          handleLogoUpload={handleLogoUpload}
        />
      )}

      {activeTab === 1 && (
        <EmployeeSettingsForm
          accessToken={accessToken}
          organizationId={organizationId}
        />
      )}

      {activeTab === 2 && (
        <AttendanceSettingsForm
          accessToken={accessToken}
          organizationId={organizationId}
        />
      )}
    </Box>
  );
}

// Extract organization settings into a separate component for cleaner code
function OrganizationSettingsContent({
  settings,
  isLoading,
  error,
  updateSettings,
  isUpdating,
  successMessage,
  setSuccessMessage,
  logoPreview,
  setLogoPreview,
  register,
  handleSubmit,
  errors,
  reset,
  setValue,
  onSubmit,
  handleLogoUpload,
}) {
  // Show loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'Failed to load settings. Please try again.'}
        </Alert>
      )}

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

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Organization Profile Card */}
          <Grid item xs={12}>
            <Card 
              elevation={0} 
              sx={{ 
                border: '1px solid', 
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              {/* Card Header */}
              <Box sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}>
                <BusinessIcon sx={{ color: 'white', fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600} sx={{ color: 'white' }}>
                  Organization Profile
                </Typography>
              </Box>

              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={3} alignItems="center">
                  {/* Logo Upload */}
                  <Grid item xs={12} md={4}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 3,
                        textAlign: 'center',
                        border: '2px dashed',
                        borderColor: 'primary.light',
                        borderRadius: 2,
                        bgcolor: 'background.default',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      <Avatar
                        src={logoPreview || undefined}
                        sx={{ 
                          width: 120, 
                          height: 120, 
                          mb: 2, 
                          mx: 'auto',
                          border: '3px solid',
                          borderColor: 'primary.main',
                          boxShadow: 2
                        }}
                      >
                        {!logoPreview && <BusinessIcon sx={{ fontSize: 60 }} />}
                      </Avatar>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Upload your organization logo
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
                          size="medium"
                          fullWidth
                        >
                          Choose File
                        </Button>
                      </label>
                    </Paper>
                  </Grid>

                  {/* Organization Name */}
                  <Grid item xs={12} md={8}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Organization Name *
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Enter organization name"
                        {...register('name', { required: 'Organization name is required' })}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        size="medium"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Box>
                    
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 2 }}>
                      <Typography variant="body2" color="info.dark">
                        <strong>Tip:</strong> This name will be displayed across your organization's dashboard and reports.
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Regional Settings Card */}
          <Grid item xs={12}>
            <Card 
              elevation={0} 
              sx={{ 
                border: '1px solid', 
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              {/* Card Header */}
              <Box sx={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}>
                <LanguageIcon sx={{ color: 'white', fontSize: 28 }} />
                <Typography variant="h6" fontWeight={600} sx={{ color: 'white' }}>
                  Regional Settings
                </Typography>
              </Box>

              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  {/* Timezone */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <AccessTimeIcon color="primary" />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Timezone
                        </Typography>
                        <Tooltip title="Select your organization's timezone">
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                            Required
                          </Typography>
                        </Tooltip>
                      </Box>
                      <TextField
                        fullWidth
                        select
                        {...register('timezone', { required: 'Timezone is required' })}
                        error={!!errors.timezone}
                        helperText={errors.timezone?.message}
                        size="medium"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      >
                        {TIMEZONES.map((timezone) => (
                          <MenuItem key={timezone} value={timezone}>
                            {timezone.replace('_', ' ')}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Paper>
                  </Grid>

                  {/* Currency */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <AttachMoneyIcon color="primary" />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Currency
                        </Typography>
                        <Tooltip title="Default currency for salary processing">
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                            Required
                          </Typography>
                        </Tooltip>
                      </Box>
                      <TextField
                        fullWidth
                        select
                        {...register('currency', { required: 'Currency is required' })}
                        error={!!errors.currency}
                        helperText={errors.currency?.message}
                        size="medium"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      >
                        {CURRENCIES.map((currency) => (
                          <MenuItem key={currency} value={currency}>
                            {currency}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Paper>
                  </Grid>

                  {/* Date Format */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <CalendarTodayIcon color="primary" />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Date Format
                        </Typography>
                        <Tooltip title="How dates will be displayed">
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                            Required
                          </Typography>
                        </Tooltip>
                      </Box>
                      <TextField
                        fullWidth
                        select
                        {...register('dateFormat', { required: 'Date format is required' })}
                        error={!!errors.dateFormat}
                        helperText={errors.dateFormat?.message}
                        size="medium"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      >
                        {DATE_FORMATS.map((format) => (
                          <MenuItem key={format} value={format}>
                            {format}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Paper>
                  </Grid>

                  {/* Language */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <TranslateIcon color="primary" />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Language
                        </Typography>
                        <Tooltip title="Interface language">
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                            Required
                          </Typography>
                        </Tooltip>
                      </Box>
                      <TextField
                        fullWidth
                        select
                        {...register('language', { required: 'Language is required' })}
                        error={!!errors.language}
                        helperText={errors.language?.message}
                        size="medium"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      >
                        {LANGUAGES.map((lang) => (
                          <MenuItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Make sure to save your changes
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      reset(settings);
                      if (settings.logo) {
                        setLogoPreview(settings.logo);
                      }
                    }}
                    disabled={isUpdating}
                    size="large"
                  >
                    Reset Changes
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={isUpdating}
                    size="large"
                    sx={{
                      px: 4,
                      py: 1.2,
                      fontWeight: 600,
                      borderRadius: 2,
                      boxShadow: 2,
                      '&:hover': {
                        boxShadow: 4,
                      }
                    }}
                  >
                    {isUpdating ? <CircularProgress size={24} color="inherit" /> : 'Save Settings'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
