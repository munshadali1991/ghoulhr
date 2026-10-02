import {
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

/**
 * @param {{
 *   search: string,
 *   onSearchChange: (value: string) => void,
 *   departmentId: string,
 *   onDepartmentChange: (value: string) => void,
 *   designationId: string,
 *   onDesignationChange: (value: string) => void,
 *   showMode: 'all' | 'active' | 'inactive',
 *   onShowModeChange: (value: 'all' | 'active' | 'inactive') => void,
 *   departments: Array<{ id: string, name: string }>,
 *   designations: Array<{ id: string, name: string }>,
 * }} props
 */
export function PeopleListFilters({
  search,
  onSearchChange,
  departmentId,
  onDepartmentChange,
  designationId,
  onDesignationChange,
  showMode,
  onShowModeChange,
  departments,
  designations,
}) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1.5}
      alignItems={{ md: 'center' }}
      useFlexGap
      flexWrap="wrap"
    >
      <TextField
        size="small"
        placeholder="Search name, code, email…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0 }}
        inputProps={{ 'aria-label': 'Search people' }}
      />

      <FormControl size="small" sx={{ minWidth: 160, flex: { md: '0 1 160px' } }}>
        <InputLabel id="people-designation-label">Designation</InputLabel>
        <Select
          labelId="people-designation-label"
          label="Designation"
          value={designationId}
          onChange={(e) => onDesignationChange(e.target.value)}
        >
          <MenuItem value="">All designations</MenuItem>
          {designations.map((d) => (
            <MenuItem key={d.id} value={d.id}>
              {d.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160, flex: { md: '0 1 160px' } }}>
        <InputLabel id="people-department-label">Department</InputLabel>
        <Select
          labelId="people-department-label"
          label="Department"
          value={departmentId}
          onChange={(e) => onDepartmentChange(e.target.value)}
        >
          <MenuItem value="">All departments</MenuItem>
          {departments.map((d) => (
            <MenuItem key={d.id} value={d.id}>
              {d.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        sx={{ ml: { md: 'auto' }, flexShrink: 0 }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          Show:
        </Typography>
        <RadioGroup
          row
          value={showMode}
          onChange={(e) => onShowModeChange(e.target.value)}
          sx={{
            '& .MuiFormControlLabel-root': { mr: 1 },
            '& .MuiFormControlLabel-label': { typography: 'body2' },
          }}
        >
          <FormControlLabel value="all" control={<Radio size="small" />} label="All" />
          <FormControlLabel value="active" control={<Radio size="small" />} label="Active" />
          <FormControlLabel value="inactive" control={<Radio size="small" />} label="Inactive" />
        </RadioGroup>
      </Stack>
    </Stack>
  );
}
