import {
  Button,
  ButtonGroup,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { PageCard } from '@/shared/components/ui/PageCard';

export const STATUS_TABS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

/**
 * @param {{
 *   from: string,
 *   to: string,
 *   status: string,
 *   employeeId: string,
 *   employees: { id: string, name: string, employeeCode?: string }[],
 *   submittedCount?: number,
 *   onFromChange: (value: string) => void,
 *   onToChange: (value: string) => void,
 *   onStatusChange: (value: string) => void,
 *   onEmployeeChange: (value: string) => void,
 *   onPreset: (preset: 'week' | 'month' | 'lastMonth') => void,
 * }} props
 */
export function TimesheetApprovalToolbar({
  from,
  to,
  status,
  employeeId,
  employees,
  submittedCount = 0,
  onFromChange,
  onToChange,
  onStatusChange,
  onEmployeeChange,
  onPreset,
}) {
  const statusTabIndex = Math.max(
    0,
    STATUS_TABS.findIndex((tab) => tab.value === status),
  );

  return (
    <PageCard sx={{ p: 2, mb: 2 }}>
      <Stack spacing={2}>
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
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Employee</InputLabel>
            <Select
              label="Employee"
              value={employeeId}
              onChange={(e) => onEmployeeChange(e.target.value)}
            >
              <MenuItem value="">All employees</MenuItem>
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.name}
                  {emp.employeeCode ? ` (${emp.employeeCode})` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <Tabs
          value={statusTabIndex}
          onChange={(_, index) => onStatusChange(STATUS_TABS[index]?.value ?? 'PENDING')}
          variant="scrollable"
          scrollButtons="auto"
        >
          {STATUS_TABS.map((tab) => (
            <Tab
              key={tab.value}
              label={
                tab.value === 'SUBMITTED' && submittedCount > 0
                  ? `${tab.label} (${submittedCount})`
                  : tab.label
              }
            />
          ))}
        </Tabs>
      </Stack>
    </PageCard>
  );
}
