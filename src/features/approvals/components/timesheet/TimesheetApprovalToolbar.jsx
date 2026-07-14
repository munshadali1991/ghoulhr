import SearchIcon from '@mui/icons-material/Search';
import { Button, ButtonGroup, InputAdornment, Stack, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { PageCard } from '@/shared/components/ui/PageCard';

/**
 * @param {{
 *   from: string,
 *   to: string,
 *   employeeSearch: string,
 *   onFromChange: (value: string) => void,
 *   onToChange: (value: string) => void,
 *   onEmployeeSearchChange: (value: string) => void,
 *   onPreset: (preset: 'week' | 'month' | 'lastMonth') => void,
 * }} props
 */
export function TimesheetApprovalToolbar({
  from,
  to,
  employeeSearch,
  onFromChange,
  onToChange,
  onEmployeeSearchChange,
  onPreset,
}) {
  return (
    <PageCard sx={{ p: 2, mb: 2 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        alignItems={{ md: 'center' }}
        flexWrap="wrap"
        useFlexGap
      >
        <ButtonGroup size="small" variant="outlined">
          <Button onClick={() => onPreset('week')}>This week</Button>
          <Button onClick={() => onPreset('month')}>This month</Button>
          <Button onClick={() => onPreset('lastMonth')}>Last month</Button>
        </ButtonGroup>
        <DatePicker
          label="From"
          value={dayjs(from)}
          onChange={(value) => value && onFromChange(value.format('YYYY-MM-DD'))}
          slotProps={{ textField: { size: 'small', sx: { minWidth: 150 } } }}
        />
        <DatePicker
          label="To"
          value={dayjs(to)}
          onChange={(value) => value && onToChange(value.format('YYYY-MM-DD'))}
          slotProps={{ textField: { size: 'small', sx: { minWidth: 150 } } }}
        />
        <TextField
          size="small"
          placeholder="Search employee"
          value={employeeSearch}
          onChange={(e) => onEmployeeSearchChange(e.target.value)}
          sx={{ minWidth: 220, flex: { md: '1 1 220px' }, maxWidth: { md: 320 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
    </PageCard>
  );
}
