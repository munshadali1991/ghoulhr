import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from '@mui/material';
import {
  ALL_PLATFORM_MODULE_CODES,
  PLATFORM_MODULES,
} from '@/shared/constants/platformModules';

/**
 * Controlled module picker for org create (before organization exists).
 *
 * @param {{
 *   value: string[],
 *   onChange: (codes: string[]) => void,
 *   disabled?: boolean,
 * }} props
 */
export function OrganizationModulesPicker({ value, onChange, disabled = false }) {
  const enabledCodes = value?.length ? value : ALL_PLATFORM_MODULE_CODES;

  const toggle = (moduleCode) => {
    const next = enabledCodes.includes(moduleCode)
      ? enabledCodes.filter((c) => c !== moduleCode)
      : [...enabledCodes, moduleCode];
    onChange(next);
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select which HRMS modules this organization can use. The org admin receives
        full access within these modules.
      </Typography>
      <FormGroup>
        {PLATFORM_MODULES.map((mod) => (
          <FormControlLabel
            key={mod.code}
            control={
              <Checkbox
                checked={enabledCodes.includes(mod.code)}
                disabled={disabled}
                onChange={() => toggle(mod.code)}
              />
            }
            label={`${mod.name} (${mod.code})`}
          />
        ))}
      </FormGroup>
    </Box>
  );
}
