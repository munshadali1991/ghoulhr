import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';

/**
 * @param {{
 *   search: string,
 *   onSearchChange: (value: string) => void,
 *   sort: string,
 *   onSortChange: (value: string) => void,
 * }} props
 */
export function ExpenseApprovalInboxToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      alignItems={{ sm: 'center' }}
      sx={{ mb: 2 }}
    >
      <TextField
        size="small"
        label="Search"
        placeholder="Claim #, employee, department"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ flex: 1, minWidth: 200 }}
      />
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel id="expense-approval-sort-label">Sort</InputLabel>
        <Select
          labelId="expense-approval-sort-label"
          label="Sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <MenuItem value="newest">Newest submitted</MenuItem>
          <MenuItem value="oldest">Oldest submitted</MenuItem>
          <MenuItem value="amount_desc">Highest amount</MenuItem>
          <MenuItem value="amount_asc">Lowest amount</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}
