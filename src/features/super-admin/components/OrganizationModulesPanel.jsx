import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  Typography,
} from '@mui/material';
import { getOrganizationModules, setOrganizationModules } from '@/features/rbac/api/rbacApi';

/**
 * Super admin — enable/disable modules per organization.
 * @param {{ organizationId: string }} props
 */
export function OrganizationModulesPanel({ organizationId }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!organizationId) return;
    setLoading(true);
    getOrganizationModules(organizationId)
      .then(setModules)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [organizationId]);

  const enabledCodes = modules.filter((m) => m.enabled).map((m) => m.moduleCode);

  const toggle = async (moduleCode) => {
    const next = enabledCodes.includes(moduleCode)
      ? enabledCodes.filter((c) => c !== moduleCode)
      : [...enabledCodes, moduleCode];

    setSaving(true);
    setError('');
    try {
      const updated = await setOrganizationModules(organizationId, next);
      setModules(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <CircularProgress size={24} />;
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Control which HRMS modules this organization can use. Org admins cannot grant
        permissions for disabled modules.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <FormGroup>
        {modules.map((mod) => (
          <FormControlLabel
            key={mod.moduleCode}
            control={
              <Checkbox
                checked={mod.enabled}
                disabled={saving}
                onChange={() => toggle(mod.moduleCode)}
              />
            }
            label={`${mod.moduleName} (${mod.moduleCode})`}
          />
        ))}
      </FormGroup>
    </Box>
  );
}
