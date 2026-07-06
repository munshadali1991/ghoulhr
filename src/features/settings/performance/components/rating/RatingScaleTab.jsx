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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Controller } from 'react-hook-form';
import { PageCard } from '@/shared/components/ui/PageCard';
import { ConfirmDeleteDialog, EmptyState, StatusChipCell } from '@/features/settings/shared';

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
                <TableCell width={100}>
                  <strong>Status</strong>
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
                  <TableCell>
                    <StatusChipCell active={option.isActive !== false} />
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                      <Tooltip title={readOnly ? 'View' : 'Edit'}>
                        <IconButton size="small" onClick={() => setEditIndex(index)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {!readOnly ? (
                        <Tooltip title="Delete">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={ratingOptions.length <= 1}
                              onClick={() => setDeleteIndex(index)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : null}
                    </Stack>
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
            <Controller
              control={form.control}
              name={`ratingOptions.${editIndex}.isActive`}
              render={({ field }) => (
                <Box sx={{ pt: 1 }}>
                  <Chip
                    clickable={!readOnly}
                    label={field.value !== false ? 'Active' : 'Inactive'}
                    color={field.value !== false ? 'success' : 'default'}
                    variant="outlined"
                    onClick={() => !readOnly && field.onChange(!(field.value !== false))}
                  />
                </Box>
              )}
            />
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
