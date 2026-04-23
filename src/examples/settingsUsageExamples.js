/**
 * SETTINGS MODULE - USAGE EXAMPLES
 * 
 * This file demonstrates various ways to use the Settings module
 */

// ============================================================
// EXAMPLE 1: Using the SettingsPage Component (Recommended)
// ============================================================

import { SettingsPage } from './pages/SettingsPage';

function App() {
  const session = { accessToken: 'your-token' };
  const user = { organizationId: 'org-123' };

  return (
    <SettingsPage
      accessToken={session.accessToken}
      organizationId={user.organizationId}
    />
  );
}


// ============================================================
// EXAMPLE 2: Using useSettings Hook in Custom Component
// ============================================================

import { useSettings } from './hooks/useSettings';
import { TextField, Button, CircularProgress, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

function CustomSettingsForm({ accessToken, organizationId }) {
  const {
    settings,
    isLoading,
    error,
    updateSettings,
    isUpdating,
  } = useSettings(accessToken, organizationId);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      timezone: 'Asia/Kolkata',
    },
  });

  // Reset form when settings load
  useEffect(() => {
    if (settings) {
      reset(settings);
    }
  }, [settings, reset]);

  const onSubmit = async (data) => {
    try {
      await updateSettings(data);
      alert('Settings updated!');
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="Organization Name"
        {...register('name', { required: true })}
      />
      <Button type="submit" disabled={isUpdating}>
        {isUpdating ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
}


// ============================================================
// EXAMPLE 3: Using API Service Directly
// ============================================================

import { 
  getOrgProfile, 
  updateOrgProfile,
  getAllSettings,
  updateSetting 
} from './services/settingsApi';

async function fetchAndUpdateSettings(accessToken, organizationId) {
  try {
    // Fetch current settings
    const currentSettings = await getOrgProfile(accessToken, organizationId);
    console.log('Current settings:', currentSettings);

    // Update specific settings
    const updated = await updateOrgProfile(accessToken, organizationId, {
      name: 'New Company Name',
      timezone: 'America/New_York',
      currency: 'USD',
    });

    console.log('Update result:', updated);
    
    // Fetch again to verify
    const newSettings = await getOrgProfile(accessToken, organizationId);
    console.log('Updated settings:', newSettings);
  } catch (error) {
    console.error('Settings operation failed:', error);
  }
}


// ============================================================
// EXAMPLE 4: Manual Data Mapping
// ============================================================

import { 
  mapSettingsToForm, 
  mapFormToSettings,
  mapFormToProfile 
} from './utils/settingsMapper';

function mappingExample() {
  // Backend response (array format)
  const backendResponse = [
    { key: 'org.name', value: 'ABC Pvt Ltd' },
    { key: 'org.timezone', value: 'Asia/Kolkata' },
    { key: 'org.currency', value: 'INR' },
  ];

  // Convert to form data
  const formData = mapSettingsToForm(backendResponse);
  console.log(formData);
  // Output: { name: 'ABC Pvt Ltd', timezone: 'Asia/Kolkata', currency: 'INR' }

  // Convert back to backend format
  const backendFormat = mapFormToSettings(formData);
  console.log(backendFormat);
  // Output: [{ key: 'org.name', value: 'ABC Pvt Ltd' }, ...]

  // Convert to profile format (for batch update)
  const profileFormat = mapFormToProfile(formData);
  console.log(profileFormat);
  // Output: { name: 'ABC Pvt Ltd', timezone: 'Asia/Kolkata', currency: 'INR' }
}


// ============================================================
// EXAMPLE 5: Using with React Query DevTools (Debugging)
// ============================================================

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

function AppWithDevTools() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      {/* Shows React Query state in browser */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}


// ============================================================
// EXAMPLE 6: Handling Logo Upload
// ============================================================

function LogoUploadExample() {
  const [logoPreview, setLogoPreview] = useState(null);
  const { updateSettings } = useSettings(accessToken, organizationId);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setLogoPreview(base64String);

      // Upload to backend
      await updateSettings({
        logo: base64String,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {logoPreview && (
        <img src={logoPreview} alt="Logo preview" style={{ width: 100, height: 100 }} />
      )}
      <input type="file" accept="image/*" onChange={handleFileChange} />
    </div>
  );
}


// ============================================================
// EXAMPLE 7: Conditional Rendering Based on Settings
// ============================================================

function DashboardWithSettings({ accessToken, organizationId }) {
  const { settings, isLoading } = useSettings(accessToken, organizationId);

  if (isLoading) return <div>Loading...</div>;

  // Use settings to customize the dashboard
  return (
    <div>
      <h1>Welcome to {settings.name || 'Dashboard'}</h1>
      <p>Language: {settings.language}</p>
      <p>Timezone: {settings.timezone}</p>
      <p>Currency: {settings.currency}</p>
      
      {/* Format dates based on settings */}
      <p>
        Today: {formatDate(new Date(), settings.dateFormat)}
      </p>
      
      {/* Display amounts in selected currency */}
      <p>
        Revenue: {formatCurrency(1000, settings.currency)}
      </p>
    </div>
  );
}

function formatDate(date, format) {
  // Implement date formatting based on setting
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  switch (format) {
    case 'DD/MM/YYYY': return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY': return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD': return `${year}-${month}-${day}`;
    default: return `${day}/${month}/${year}`;
  }
}

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}


// ============================================================
// EXAMPLE 8: Error Handling with Retry Logic
// ============================================================

function SettingsWithRetry({ accessToken, organizationId }) {
  const { settings, error, refetch, isLoading } = useSettings(
    accessToken,
    organizationId
  );

  const handleRetry = async () => {
    try {
      await refetch();
    } catch (err) {
      console.error('Retry failed:', err);
    }
  };

  if (error) {
    return (
      <div>
        <Alert severity="error">
          Failed to load settings: {error.message}
        </Alert>
        <Button onClick={handleRetry}>Retry</Button>
      </div>
    );
  }

  return <SettingsForm settings={settings} />;
}


// ============================================================
// EXAMPLE 9: Multiple Components Sharing Settings
// ============================================================

import { useQueryClient } from '@tanstack/react-query';

// Component 1: Updates settings
function SettingsUpdater() {
  const queryClient = useQueryClient();
  const { updateSettings } = useSettings(accessToken, organizationId);

  const handleUpdate = async () => {
    await updateSettings({ name: 'New Name' });
    // All components using ['settings'] query will automatically refetch
  };

  return <Button onClick={handleUpdate}>Update Name</Button>;
}

// Component 2: Reads settings (auto-updates when settings change)
function SettingsReader() {
  const { settings } = useSettings(accessToken, organizationId);
  
  return <h1>{settings.name}</h1>;
}


// ============================================================
// EXAMPLE 10: Testing the Hook (Jest/React Testing Library)
// ============================================================

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Test example
test('useSettings fetches settings successfully', async () => {
  // Mock the API
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        name: 'Test Org',
        timezone: 'Asia/Kolkata',
      }),
    })
  );

  const { result } = renderHook(
    () => useSettings('test-token', 'test-org-id'),
    { wrapper: createWrapper() }
  );

  // Wait for the query to resolve
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  // Verify the data
  expect(result.current.settings.name).toBe('Test Org');
  expect(result.current.settings.timezone).toBe('Asia/Kolkata');
});


// ============================================================
// EXAMPLE 11: Bulk Update with Validation
// ============================================================

function SettingsWithValidation({ accessToken, organizationId }) {
  const { updateSettings, isUpdating } = useSettings(accessToken, organizationId);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    // Validate before sending
    if (!data.name || data.name.length < 2) {
      alert('Name must be at least 2 characters');
      return;
    }

    try {
      await updateSettings(data);
      alert('Settings updated successfully!');
    } catch (error) {
      alert('Failed to update settings');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('name', { required: true, minLength: 2 })}
        placeholder="Organization Name"
      />
      {errors.name && <span>Name is required (min 2 chars)</span>}
      
      <button type="submit" disabled={isUpdating}>
        Save
      </button>
    </form>
  );
}


// ============================================================
// SUMMARY
// ============================================================

/*
The Settings module provides:

1. ✅ Pre-built SettingsPage component (ready to use)
2. ✅ useSettings hook for custom implementations
3. ✅ API service functions for direct calls
4. ✅ Data mapping utilities for format conversion
5. ✅ React Query caching and auto-refetch
6. ✅ Multi-tenant support with x-org-id header
7. ✅ Error handling and loading states
8. ✅ Form validation with React Hook Form

Most common usage:
  <SettingsPage accessToken={token} organizationId={orgId} />

For custom implementations:
  const { settings, updateSettings } = useSettings(token, orgId);

For direct API calls:
  await updateOrgProfile(token, orgId, { name: 'New Name' });
*/
