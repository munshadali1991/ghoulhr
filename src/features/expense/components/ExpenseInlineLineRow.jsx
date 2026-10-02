import {
  Box,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

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

const saveButtonSx = {
  borderRadius: 1,
  bgcolor: 'success.main',
  color: 'success.contrastText',
  '&:hover': { bgcolor: 'success.dark' },
  px: 1.5,
  width: 'auto',
  gap: 0.5,
};

const addButtonSx = {
  borderRadius: 1,
  bgcolor: 'success.main',
  color: 'success.contrastText',
  '&:hover': { bgcolor: 'success.dark' },
};

/**
 * Horizontal expense line row: Category, Date, Merchant, Description, Amount, Receipt, Save, +.
 * @param {{
 *   value: {
 *     categoryId?: string,
 *     expenseDate?: string,
 *     merchant?: string,
 *     description?: string,
 *     amount?: string,
 *   },
 *   onChange: (key: string, value: string) => void,
 *   errors?: Record<string, string>,
 *   receiptFile?: File | null,
 *   onReceiptChange?: (file: File | null) => void,
 *   fieldIds?: Record<string, string>,
 *   todayKey?: string,
 *   categories?: { id: string, name: string }[],
 *   onSave?: () => void,
 *   onAdd?: () => void,
 *   addLabel?: string,
 *   saving?: boolean,
 *   disabled?: boolean,
 *   showActions?: boolean,
 *   actionsOnly?: boolean,
 * }} props
 */
export function ExpenseInlineLineRow({
  value,
  onChange,
  errors = {},
  receiptFile = null,
  onReceiptChange,
  fieldIds = {},
  todayKey,
  categories = [],
  onSave,
  onAdd,
  addLabel = 'Add expense',
  saving = false,
  disabled = false,
  showActions = true,
  actionsOnly = false,
}) {
  const receiptHasError = Boolean(errors.receipt);
  const receiptBorderColor = receiptHasError
    ? 'error.main'
    : receiptFile
      ? 'success.main'
      : 'divider';

  if (actionsOnly) {
    return showActions ? (
      <Stack direction="row" justifyContent="flex-end" spacing={1}>
        <Tooltip title="Save expense">
          <span>
            <IconButton
              color="success"
              onClick={onSave}
              disabled={disabled || saving}
              aria-label="Save expense"
              sx={saveButtonSx}
            >
              <SaveRoundedIcon fontSize="small" />
              <Box component="span" sx={{ typography: 'body2', fontWeight: 600, pr: 0.5 }}>
                Save
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
              sx={addButtonSx}
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
        flexWrap={{ lg: 'wrap' }}
      >
        <TextField
          id={fieldIds.categoryId}
          select
          required
          size="small"
          label="Category"
          value={value.categoryId ?? ''}
          onChange={(e) => onChange('categoryId', e.target.value)}
          disabled={disabled || categories.length === 0}
          error={Boolean(errors.categoryId)}
          helperText={
            errors.categoryId ||
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
          id={fieldIds.expenseDate}
          type="date"
          required
          size="small"
          label="Expense date"
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: todayKey }}
          value={value.expenseDate ?? ''}
          onChange={(e) => onChange('expenseDate', e.target.value)}
          disabled={disabled}
          error={Boolean(errors.expenseDate)}
          helperText={errors.expenseDate}
          sx={{
            minWidth: { lg: 150 },
            flex: { lg: '0 0 150px' },
            ...fieldSx('primary.main'),
          }}
        />

        <TextField
          id={fieldIds.merchant}
          required
          size="small"
          label="Merchant"
          value={value.merchant ?? ''}
          onChange={(e) => onChange('merchant', e.target.value)}
          disabled={disabled}
          error={Boolean(errors.merchant)}
          helperText={errors.merchant}
          sx={{
            minWidth: { lg: 140 },
            flex: { lg: '0 0 140px' },
            ...fieldSx('warning.main'),
          }}
        />

        <TextField
          id={fieldIds.description}
          required
          size="small"
          label="Description"
          value={value.description ?? ''}
          onChange={(e) => onChange('description', e.target.value)}
          disabled={disabled}
          error={Boolean(errors.description)}
          helperText={errors.description}
          sx={{ flex: 1, minWidth: { lg: 180 }, ...fieldSx('error.light') }}
        />

        <TextField
          id={fieldIds.amount}
          required
          size="small"
          label="Amount"
          value={value.amount ?? ''}
          onChange={(e) => onChange('amount', e.target.value)}
          disabled={disabled}
          error={Boolean(errors.amount)}
          helperText={errors.amount}
          sx={{
            minWidth: { lg: 110 },
            flex: { lg: '0 0 110px' },
            ...fieldSx('success.light'),
          }}
        />

        <Box sx={{ minWidth: { lg: 200 }, flex: { lg: '0 0 220px' } }}>
          <Box
            component="label"
            htmlFor={fieldIds.receipt}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.25,
              height: 40,
              boxSizing: 'border-box',
              borderRadius: 1,
              borderWidth: 1,
              borderStyle: receiptFile && !receiptHasError ? 'solid' : 'dashed',
              borderColor: receiptBorderColor,
              borderLeftWidth: 3,
              borderLeftColor: receiptHasError
                ? 'error.main'
                : receiptFile
                  ? 'success.main'
                  : 'info.main',
              bgcolor: receiptHasError
                ? 'rgba(211, 47, 47, 0.04)'
                : receiptFile
                  ? 'rgba(46, 125, 50, 0.04)'
                  : 'background.paper',
              cursor: disabled ? 'default' : 'pointer',
              '&:hover': disabled
                ? undefined
                : { borderColor: receiptHasError ? 'error.main' : 'primary.main' },
            }}
          >
            <InsertDriveFileOutlinedIcon
              color={receiptHasError ? 'error' : receiptFile ? 'success' : 'action'}
              fontSize="small"
            />
            <Typography
              variant="body2"
              fontWeight={600}
              noWrap
              sx={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}
            >
              {receiptFile ? receiptFile.name : 'Receipt *'}
            </Typography>
            {receiptFile && !disabled ? (
              <IconButton
                size="small"
                aria-label="Clear receipt"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onReceiptChange?.(null);
                }}
                sx={{ p: 0.25 }}
              >
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            ) : null}
            <input
              id={fieldIds.receipt}
              hidden
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              disabled={disabled}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                e.target.value = '';
                onReceiptChange?.(file);
              }}
            />
          </Box>
          <Typography
            variant="caption"
            color={receiptHasError ? 'error' : 'text.secondary'}
            sx={{ mt: 0.5, display: 'block', px: 0.25 }}
          >
            {receiptHasError ? errors.receipt : 'PDF or image, max 5 MB'}
          </Typography>
        </Box>
      </Stack>

      {showActions ? (
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Tooltip title="Save expense">
            <span>
              <IconButton
                color="success"
                onClick={onSave}
                disabled={disabled || saving}
                aria-label="Save expense"
                sx={saveButtonSx}
              >
                <SaveRoundedIcon fontSize="small" />
                <Box component="span" sx={{ typography: 'body2', fontWeight: 600, pr: 0.5 }}>
                  Save
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
                sx={addButtonSx}
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
