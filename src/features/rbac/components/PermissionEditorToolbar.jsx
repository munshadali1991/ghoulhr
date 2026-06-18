import {
  FormControlLabel,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

/**
 * @param {{
 *   search: string,
 *   onSearchChange: (value: string) => void,
 *   enabledOnly: boolean,
 *   onEnabledOnlyChange: (value: boolean) => void,
 *   enabledCount: number,
 *   totalCount: number,
 *   moduleCount: number,
 * }} props
 */
export function PermissionEditorToolbar({
  search,
  onSearchChange,
  enabledOnly,
  onEnabledOnlyChange,
  enabledCount,
  totalCount,
  moduleCount,
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: 2 }}
    >
      <Typography variant="body2" color="text.secondary">
        {enabledCount} of {totalCount} permissions enabled across {moduleCount} modules
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
        <TextField
          placeholder="Search permissions..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={enabledOnly}
              onChange={(e) => onEnabledOnlyChange(e.target.checked)}
            />
          }
          label="Enabled only"
        />
      </Stack>
    </Stack>
  );
}
