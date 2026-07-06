import { useState } from 'react';
import {
  Alert,
  Chip,
  Collapse,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  Button,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import { Controller } from 'react-hook-form';
import { PageCard } from '@/shared/components/ui/PageCard';
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
}) {
  const prefix = `sections.${sectionIndex}.questions.${questionIndex}`;
  const questionType = watch(`${prefix}.type`);
  const normalizedType = questionType === 'narrative' ? 'textarea' : questionType;
  const [moreOpen, setMoreOpen] = useState(false);

  const needsRatingScale = normalizedType === 'rating' && !hasActiveRatingScale(ratingOptions);

  return (
    <PageCard sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
          <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
              <TextField
                {...register(`${prefix}.label`)}
                label="Question label"
                fullWidth
                required
                disabled={readOnly}
                size="small"
                error={Boolean(fieldErrors[`${prefix}.label`])}
                helperText={fieldErrors[`${prefix}.label`] || ' '}
                sx={{ flex: 1, minWidth: 200 }}
              />
              {normalizedType ? (
                <Chip
                  size="small"
                  label={QUESTION_TYPE_LABELS[normalizedType] ?? normalizedType}
                  variant="outlined"
                />
              ) : null}
            </Stack>

            <QuestionTypePicker
              value={normalizedType}
              disabled={readOnly}
              onChange={(type) => setValue(`${prefix}.type`, type, { shouldDirty: true })}
            />

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
          </Stack>

          {!readOnly ? (
            <Stack direction="row" spacing={0.25} flexShrink={0}>
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
            </Stack>
          ) : null}
        </Stack>

        {(normalizedType === 'select' || normalizedType === 'radio') && (
          <TextField
            label="Options (comma-separated)"
            fullWidth
            size="small"
            disabled={readOnly}
            error={Boolean(fieldErrors[`${prefix}.options`])}
            helperText={fieldErrors[`${prefix}.options`] || ' '}
            defaultValue={optionsStringFromArray(watch(`${prefix}.options`))}
            onChange={(e) =>
              setValue(`${prefix}.options`, optionsArrayFromString(e.target.value), {
                shouldDirty: true,
              })
            }
          />
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

        <Button
          size="small"
          color="inherit"
          onClick={() => setMoreOpen((v) => !v)}
          endIcon={moreOpen ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
          sx={{ alignSelf: 'flex-start', px: 0 }}
        >
          More options
        </Button>

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
    </PageCard>
  );
}
