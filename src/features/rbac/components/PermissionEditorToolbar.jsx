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
      flexWrap="wrap"
      useFlexGap
    >
      <Typography variant="body2" color="text.secondary">
        {enabledCount} of {totalCount} permissions enabled across {moduleCount} modules
      </Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.75}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <TextField
          placeholder="Search permissions..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          size="small"
          sx={{ width: { xs: '100%', sm: 220 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
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
              color="secondary"
            />
          }
          label={<Typography variant="body2" color="text.secondary">Enabled only</Typography>}
          sx={{ m: 0, whiteSpace: 'nowrap' }}
        />
      </Stack>
    </Stack>
  );
}
