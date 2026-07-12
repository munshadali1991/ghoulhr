import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import { Controller } from 'react-hook-form';
import { PageCard } from '@/shared/components/ui/PageCard';
import { ActiveSwitchCell } from '@/shared/components/data/ActiveSwitchCell';
import { TableRowActions } from '@/shared/components/data/TableRowActions';
import { ConfirmDeleteDialog, EmptyState } from '@/features/settings/shared';

/**
 * @param {{
 *   ratingOptions: object[],
 *   form: object,
 *   readOnly?: boolean,
 * }} props
 */
export function RatingScaleTab({ ratingOptions, form, readOnly = false }) {
  const [editIndex, setEditIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const weightsWarning = useMemo(() => {
    const active = ratingOptions.filter((o) => o?.isActive !== false);
    if (active.length < 2) return null;
    const weights = active.map((o) => Number(o.weight ?? 0));
    const isDescending = weights.every((w, i) => i === 0 || weights[i - 1] >= w);
    if (!isDescending) {
      return 'Weights are not in descending order — verify your scale reflects highest-to-lowest ratings.';
    }
    return null;
  }, [ratingOptions]);

  if (!ratingOptions.length) {
    return (
      <EmptyState
        title="No rating options"
        description="Add at least one KPI rating level for scored questions."
      />
    );
  }

  const editRow = editIndex != null ? ratingOptions[editIndex] : null;

  return (
    <>
      {weightsWarning ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {weightsWarning}
        </Alert>
      ) : null}

      <PageCard sx={{ p: 0 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell width={88}>
                  <strong>Order</strong>
                </TableCell>
                <TableCell>
                  <strong>Label</strong>
                </TableCell>
                <TableCell width={100}>
                  <strong>Weight</strong>
                </TableCell>
                <TableCell align="center" width={88}>
                  <strong>Active</strong>
                </TableCell>
                <TableCell align="right" width={120}>
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ratingOptions.map((option, index) => (
                <TableRow
                  key={option.id ?? index}
                  hover={!readOnly}
                  sx={{ cursor: readOnly ? 'default' : 'pointer' }}
                  onClick={() => !readOnly && setEditIndex(index)}
                  selected={editIndex === index}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {!readOnly ? (
                      <Stack direction="row" spacing={0.25}>
                        <Tooltip title="Move up">
                          <span>
                            <IconButton
                              size="small"
                              disabled={index === 0}
                              onClick={() => form.ratingFields.move(index, index - 1)}
                            >
                              <ArrowUpwardRoundedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Move down">
                          <span>
                            <IconButton
                              size="small"
                              disabled={index >= ratingOptions.length - 1}
                              onClick={() => form.ratingFields.move(index, index + 1)}
                            >
                              <ArrowDownwardRoundedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    ) : (
                      index + 1
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {option.label || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={option.weight ?? 0} variant="outlined" />
                  </TableCell>
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <Controller
                      control={form.control}
                      name={`ratingOptions.${index}.isActive`}
                      render={({ field }) => (
                        <ActiveSwitchCell
                          checked={field.value !== false}
                          disabled={readOnly}
                          ariaLabel={`Active for ${option.label || `rating ${index + 1}`}`}
                          onChange={(next) => field.onChange(next)}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell
                    align="right"
                    className="table-actions-cell"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TableRowActions
                      onEdit={() => setEditIndex(index)}
                      editLabel={readOnly ? 'View' : 'Edit'}
                      onDelete={
                        readOnly || ratingOptions.length <= 1
                          ? undefined
                          : () => setDeleteIndex(index)
                      }
                      deleteDisabled={ratingOptions.length <= 1}
                      deleteLabel={
                        ratingOptions.length <= 1
                          ? 'At least one rating option is required'
                          : 'Delete'
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </PageCard>

      {editIndex != null && editRow ? (
        <PageCard sx={{ p: 2.5, mt: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            Edit rating option
          </Typography>
          <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} alignItems="flex-start">
            <TextField
              {...form.register(`ratingOptions.${editIndex}.label`)}
              label="Label"
              fullWidth
              disabled={readOnly}
            />
            <TextField
              {...form.register(`ratingOptions.${editIndex}.weight`, { valueAsNumber: true })}
              label="Weight"
              type="number"
              sx={{ minWidth: 120 }}
              disabled={readOnly}
            />
            <Box sx={{ pt: 0.5 }}>
              <Controller
                control={form.control}
                name={`ratingOptions.${editIndex}.isActive`}
                render={({ field }) => (
                  <ActiveSwitchCell
                    checked={field.value !== false}
                    disabled={readOnly}
                    ariaLabel="Active"
                    onChange={(next) => field.onChange(next)}
                  />
                )}
              />
            </Box>
          </Stack>
          {!readOnly ? (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              Higher weights represent stronger performance ratings in KPI scoring.
            </Typography>
          ) : null}
        </PageCard>
      ) : null}

      <ConfirmDeleteDialog
        open={deleteIndex != null}
        title="Delete rating option?"
        description="Scored KPI questions rely on this scale. Existing assessments keep their snapshot."
        onClose={() => setDeleteIndex(null)}
        onConfirm={() => {
          if (deleteIndex != null) {
            form.ratingFields.remove(deleteIndex);
            if (editIndex === deleteIndex) setEditIndex(null);
          }
          setDeleteIndex(null);
        }}
      />
    </>
  );
}
