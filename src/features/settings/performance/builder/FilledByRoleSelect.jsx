import { Link as RouterLink } from 'react-router-dom';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import { useRbacRoles } from '@/features/rbac/hooks/useRbacAdmin';

/**
 * @param {{
 *   value: string,
 *   onChange: (value: string) => void,
 *   disabled?: boolean,
 * }} props
 */
export function FilledByRoleSelect({ value, onChange, disabled = false }) {
  const { data: roles = [], isLoading } = useRbacRoles();
  const activeRoles = roles.filter((r) => r.isActive !== false);

  return (
    <Stack spacing={0.5}>
      <FormControl fullWidth disabled={disabled || isLoading}>
        <InputLabel>Filled by</InputLabel>
        <Select
          label="Filled by"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          {activeRoles.map((role) => (
            <MenuItem key={role.id} value={role.code}>
              {role.name}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          Only employees assigned this role can fill this section on an assessment.{' '}
          <Link component={RouterLink} to="/settings/rbac" underline="hover">
            Manage roles
          </Link>
        </FormHelperText>
      </FormControl>
    </Stack>
  );
}
