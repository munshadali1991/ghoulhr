import {
  Box,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { PRIORITIES, TASK_STATUSES } from '../../constants/timesheetEnums';

const fieldSx = (accent) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 1,
    bgcolor: 'background.paper',
    '& fieldset': {
      borderLeftWidth: 3,
      borderLeftColor: accent,
    },
  },
});

/**
 * Horizontal entry row: Date, Category, Work Area/Description, Hours, Task status, Priority, Ref #, Save All, +.
 * @param {{
 *   value: object,
 *   onChange: (patch: object) => void,
 *   errors?: Record<string, { message?: string }>,
 *   minDate?: import('dayjs').Dayjs,
 *   maxDate?: import('dayjs').Dayjs,
 *   onAdd: () => void,
 *   onSaveAll: () => void,
 *   addLabel?: string,
 *   saving?: boolean,
 *   disabled?: boolean,
 *   categories?: { id: string, name: string }[],
 *   showActions?: boolean,
 *   showDate?: boolean,
 *   actionsOnly?: boolean,
 * }} props
 */
export function TimesheetInlineEntryRow({
  value,
  onChange,
  errors = {},
  minDate,
  maxDate,
  onAdd,
  onSaveAll,
  addLabel = 'Add row',
  saving = false,
  disabled = false,
  categories = [],
  showActions = true,
  showDate = true,
  actionsOnly = false,
}) {
  const patch = (key, val) => onChange({ ...value, [key]: val });
  const dateValue = value.workDate ? dayjs(value.workDate) : dayjs();

  if (actionsOnly) {
    return showActions ? (
      <Stack direction="row" justifyContent="flex-end" spacing={1}>
        <Tooltip title="Save all rows for this day">
          <span>
            <IconButton
              color="success"
              onClick={onSaveAll}
              disabled={disabled || saving}
              aria-label="Save all"
              sx={{
                borderRadius: 1,
                bgcolor: 'success.main',
                color: 'success.contrastText',
                '&:hover': { bgcolor: 'success.dark' },
                px: 1.5,
                width: 'auto',
                gap: 0.5,
              }}
            >
              <SaveRoundedIcon fontSize="small" />
              <Box component="span" sx={{ fontSize: 13, fontWeight: 600, pr: 0.5 }}>
                Save All
              </Box>
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={addLabel}>
          <span>
            <IconButton
              color="success"
              onClick={onAdd}
              disabled={disabled || saving}
              aria-label={addLabel}
              sx={{
                borderRadius: 1,
                bgcolor: 'success.main',
                color: 'success.contrastText',
                '&:hover': { bgcolor: 'success.dark' },
              }}
            >
              <AddRoundedIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    ) : null;
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'stretch', lg: 'flex-start' }}
        sx={{ mb: 1.5 }}
      >
        {showDate ? (
        <DatePicker
          label="Date"
          value={dateValue}
          onChange={(d) => d && patch('workDate', d.format('YYYY-MM-DD'))}
          minDate={minDate}
          maxDate={maxDate}
          disabled={disabled}
          slotProps={{
            textField: {
              size: 'small',
              required: true,
              error: Boolean(errors.workDate),
              helperText: errors.workDate?.message,
              sx: {
                minWidth: { lg: 150 },
                flex: { lg: '0 0 150px' },
                ...fieldSx('primary.main'),
              },
            },
          }}
        />
        ) : null}

        <TextField
          select
          required
          size="small"
          label="Category"
          value={value.categoryId ?? ''}
          onChange={(e) => patch('categoryId', e.target.value)}
          disabled={disabled || categories.length === 0}
          error={Boolean(errors.categoryId)}
          helperText={
            errors.categoryId?.message ??
            (categories.length === 0 ? 'No categories configured' : undefined)
          }
          sx={{
            minWidth: { lg: 150 },
            flex: { lg: '0 0 150px' },
            ...fieldSx('secondary.main'),
          }}
        >
          {categories.map((opt) => (
            <MenuItem key={opt.id} value={opt.id}>
              {opt.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          required
          size="small"
          label="Work Area/Description"
          placeholder="Description"
          value={value.workAreaDescription ?? ''}
          onChange={(e) => patch('workAreaDescription', e.target.value)}
          disabled={disabled}
          error={Boolean(errors.workAreaDescription)}
          helperText={errors.workAreaDescription?.message}
          multiline
          maxRows={3}
          sx={{ flex: 1, minWidth: { lg: 200 }, ...fieldSx('error.light') }}
        />

        <TextField
          required
          size="small"
          type="number"
          label="Hours"
          value={value.hoursSpent ?? 0}
          onChange={(e) =>
            patch('hoursSpent', e.target.value === '' ? '' : Number(e.target.value))
          }
          disabled={disabled}
          error={Boolean(errors.hoursSpent)}
          helperText={errors.hoursSpent?.message}
          inputProps={{ min: 0, max: 24, step: 0.25 }}
          sx={{ minWidth: { lg: 88 }, flex: { lg: '0 0 88px' }, ...fieldSx('success.light') }}
        />

        <TextField
          select
          required
          size="small"
          label="Task status"
          value={value.taskStatus ?? 'IN_PROGRESS'}
          onChange={(e) => patch('taskStatus', e.target.value)}
          disabled={disabled}
          error={Boolean(errors.taskStatus)}
          helperText={errors.taskStatus?.message}
          sx={{
            minWidth: { lg: 140 },
            flex: { lg: '0 0 140px' },
            ...fieldSx('info.main'),
          }}
        >
          {TASK_STATUSES.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          required
          size="small"
          label="Priority"
          value={value.priority ?? 'MEDIUM'}
          onChange={(e) => patch('priority', e.target.value)}
          disabled={disabled}
          error={Boolean(errors.priority)}
          helperText={errors.priority?.message}
          sx={{
            minWidth: { lg: 120 },
            flex: { lg: '0 0 120px' },
            ...fieldSx('warning.main'),
          }}
        >
          {PRIORITIES.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          size="small"
          label="Ref #"
          placeholder="Ref # (If available)"
          value={value.refNumber ?? ''}
          onChange={(e) => patch('refNumber', e.target.value)}
          disabled={disabled}
          error={Boolean(errors.refNumber)}
          helperText={errors.refNumber?.message}
          sx={{ minWidth: { lg: 140 }, flex: { lg: '0 0 140px' }, ...fieldSx('success.main') }}
        />

        {/* Project — reserved for future use
        <TextField
          label="Project"
          value={value.projectName}
          ...
        />
        */}
      </Stack>

      {showActions ? (
      <Stack direction="row" justifyContent="flex-end" spacing={1}>
        <Tooltip title="Save all rows for this day">
          <span>
            <IconButton
              color="success"
              onClick={onSaveAll}
              disabled={disabled || saving}
              aria-label="Save all"
              sx={{
                borderRadius: 1,
                bgcolor: 'success.main',
                color: 'success.contrastText',
                '&:hover': { bgcolor: 'success.dark' },
                px: 1.5,
                width: 'auto',
                gap: 0.5,
              }}
            >
              <SaveRoundedIcon fontSize="small" />
              <Box component="span" sx={{ fontSize: 13, fontWeight: 600, pr: 0.5 }}>
                Save All
              </Box>
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={addLabel}>
          <span>
            <IconButton
              color="success"
              onClick={onAdd}
              disabled={disabled || saving}
              aria-label={addLabel}
              sx={{
                borderRadius: 1,
                bgcolor: 'success.main',
                color: 'success.contrastText',
                '&:hover': { bgcolor: 'success.dark' },
              }}
            >
              <AddRoundedIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
      ) : null}
    </Box>
  );
}
