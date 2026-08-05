import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import { Controller } from 'react-hook-form';
import { QuestionTypePicker } from './QuestionTypePicker';
import {
  optionsArrayFromString,
  optionsStringFromArray,
  QUESTION_TYPE_LABELS,
} from '../utils/performanceMasterMappers';

function hasActiveRatingScale(ratingOptions) {
  return (ratingOptions ?? []).some(
    (o) => o?.isActive !== false && String(o?.label ?? '').trim(),
  );
}

/**
 * @param {{
 *   sectionIndex: number,
 *   questionIndex: number,
 *   register: import('react-hook-form').UseFormRegister<object>,
 *   control: import('react-hook-form').Control<object>,
 *   watch: import('react-hook-form').UseFormWatch<object>,
 *   setValue: import('react-hook-form').UseFormSetValue<object>,
 *   readOnly?: boolean,
 *   fieldErrors?: Record<string, string>,
 *   ratingOptions?: object[],
 *   onOpenRatingDrawer?: () => void,
 *   onMoveUp?: () => void,
 *   onMoveDown?: () => void,
 *   onDelete?: () => void,
 *   canMoveUp?: boolean,
 *   canMoveDown?: boolean,
 *   expanded?: boolean,
 *   onExpand?: () => void,
 *   onCollapse?: () => void,
 * }} props
 */
export function QuestionCard({
  sectionIndex,
  questionIndex,
  register,
  control,
  watch,
  setValue,
  readOnly = false,
  fieldErrors = {},
  ratingOptions = [],
  onOpenRatingDrawer,
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp = false,
  canMoveDown = false,
  expanded = false,
  onExpand,
  onCollapse,
}) {
  const prefix = `sections.${sectionIndex}.questions.${questionIndex}`;
  const questionType = watch(`${prefix}.type`);
  const normalizedType = questionType === 'narrative' ? 'textarea' : questionType;
  const label = watch(`${prefix}.label`);
  const required = watch(`${prefix}.required`) !== false;
  const [moreOpen, setMoreOpen] = useState(false);

  const needsRatingScale = normalizedType === 'rating' && !hasActiveRatingScale(ratingOptions);
  const typeLabel = QUESTION_TYPE_LABELS[normalizedType] ?? normalizedType ?? 'Question';
  const displayLabel = String(label ?? '').trim();

  if (!expanded) {
    return (
      <Box
        onClick={onExpand}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1.5,
          px: 1.75,
          py: 1.25,
          cursor: 'pointer',
          bgcolor: 'background.paper',
          transition: 'border-color 0.12s ease, background-color 0.12s ease',
          '&:hover': {
            borderColor: 'text.secondary',
            bgcolor: (theme) => theme.palette.custom?.surfaces?.subtle ?? 'action.hover',
          },
        }}
      >
        <DragIndicatorRoundedIcon
          sx={{ color: 'text.disabled', fontSize: 18, flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()}
        />
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            minWidth: 0,
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontStyle: displayLabel ? 'normal' : 'italic',
            color: displayLabel ? 'text.primary' : 'text.disabled',
          }}
        >
          {displayLabel || 'Untitled question'}
        </Typography>
        {required ? (
          <Box
            title="Required"
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: 'error.main',
              flexShrink: 0,
            }}
          />
        ) : null}
        <Chip
          size="small"
          label={typeLabel}
          variant="outlined"
          sx={{ flexShrink: 0, fontWeight: 600, typography: 'overline' }}
        />
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.25}
          flexShrink={0}
          onClick={(e) => e.stopPropagation()}
        >
          {!readOnly && onDelete ? (
            <Tooltip title="Delete question">
              <IconButton size="small" color="error" onClick={onDelete}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          <ExpandMoreRoundedIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1.5,
        p: 2,
        bgcolor: (theme) => theme.palette.custom?.surfaces?.subtle ?? 'background.default',
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="flex-start" gap={1}>
          <DragIndicatorRoundedIcon
            sx={{ color: 'text.disabled', fontSize: 18, mt: 1.5, flexShrink: 0 }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, display: 'block', mb: 0.75 }}
            >
              Question label <Box component="span" sx={{ color: 'error.main' }}>*</Box>
            </Typography>
            <TextField
              {...register(`${prefix}.label`)}
              placeholder="Type your question"
              fullWidth
              required
              disabled={readOnly}
              size="small"
              error={Boolean(fieldErrors[`${prefix}.label`])}
              helperText={fieldErrors[`${prefix}.label`] || ' '}
            />
          </Box>
          {!readOnly ? (
            <Stack direction="row" spacing={0.25} flexShrink={0} sx={{ pt: 0.5 }}>
              <Tooltip title="Move up">
                <span>
                  <IconButton size="small" disabled={!canMoveUp} onClick={onMoveUp}>
                    <ArrowUpwardRoundedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Move down">
                <span>
                  <IconButton size="small" disabled={!canMoveDown} onClick={onMoveDown}>
                    <ArrowDownwardRoundedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Delete question">
                <IconButton size="small" color="error" onClick={onDelete}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Collapse">
                <IconButton size="small" onClick={onCollapse}>
                  <ExpandLessRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          ) : (
            <IconButton size="small" onClick={onCollapse} sx={{ mt: 0.5 }}>
              <ExpandLessRoundedIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>

        <QuestionTypePicker
          value={normalizedType}
          disabled={readOnly}
          onChange={(type) => setValue(`${prefix}.type`, type, { shouldDirty: true })}
        />

        {(normalizedType === 'select' || normalizedType === 'radio') && (
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 0.5 }}
            >
              Options (comma-separated)
            </Typography>
            <TextField
              fullWidth
              size="small"
              disabled={readOnly}
              placeholder="e.g. yes, no, both"
              error={Boolean(fieldErrors[`${prefix}.options`])}
              helperText={fieldErrors[`${prefix}.options`] || ' '}
              defaultValue={optionsStringFromArray(watch(`${prefix}.options`))}
              onChange={(e) =>
                setValue(`${prefix}.options`, optionsArrayFromString(e.target.value), {
                  shouldDirty: true,
                })
              }
            />
          </Box>
        )}

        {needsRatingScale && !readOnly && onOpenRatingDrawer ? (
          <Alert
            severity="warning"
            sx={{ py: 0.5 }}
            action={
              <Button color="inherit" size="small" onClick={onOpenRatingDrawer}>
                Set up
              </Button>
            }
          >
            No rating scale defined yet — set one up
          </Alert>
        ) : null}

        {normalizedType === 'rating' && hasActiveRatingScale(ratingOptions) ? (
          <Typography variant="caption" color="text.secondary">
            Uses {ratingOptions.filter((o) => o?.isActive !== false).length} rating level
            {ratingOptions.filter((o) => o?.isActive !== false).length === 1 ? '' : 's'} from your
            scale.
          </Typography>
        ) : null}

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1}
        >
          <Controller
            control={control}
            name={`${prefix}.required`}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value !== false}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={readOnly}
                    size="small"
                  />
                }
                label="Required"
              />
            )}
          />
          <Button
            size="small"
            color="inherit"
            onClick={() => setMoreOpen((v) => !v)}
            endIcon={moreOpen ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
            sx={{ px: 0 }}
          >
            More options
          </Button>
        </Stack>

        <Collapse in={moreOpen}>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <TextField
              {...register(`${prefix}.placeholder`)}
              label="Placeholder"
              fullWidth
              size="small"
              disabled={readOnly}
            />
            <TextField
              {...register(`${prefix}.helperText`)}
              label="Helper text"
              fullWidth
              size="small"
              disabled={readOnly}
            />
            <Controller
              control={control}
              name={`${prefix}.allowComment`}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(field.value)}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={readOnly}
                      size="small"
                    />
                  }
                  label="Allow comment"
                />
              )}
            />
            <TextField
              {...register(`${prefix}.key`)}
              label="Question key"
              fullWidth
              size="small"
              disabled={readOnly}
              error={Boolean(fieldErrors[`${prefix}.key`])}
              helperText={
                fieldErrors[`${prefix}.key`] || 'Stable identifier for stored answers.'
              }
            />
            <Controller
              control={control}
              name={`${prefix}.isActive`}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value !== false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={readOnly}
                      size="small"
                    />
                  }
                  label="Active"
                />
              )}
            />
          </Stack>
        </Collapse>
      </Stack>
    </Box>
  );
}
