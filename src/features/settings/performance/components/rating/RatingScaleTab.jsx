import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Collapse,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { Controller } from 'react-hook-form';
import { PageCard } from '@/shared/components/ui/PageCard';
import { ActiveSwitchCell } from '@/shared/components/data/ActiveSwitchCell';
import { ConfirmDeleteDialog, EmptyState } from '@/features/settings/shared';

/**
 * @param {{
 *   ratingOptions: object[],
 *   form: object,
 *   readOnly?: boolean,
 * }} props
 */
export function RatingScaleTab({ ratingOptions, form, readOnly = false }) {
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [expandedMore, setExpandedMore] = useState({});

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
      <PageCard sx={{ p: { xs: 2, sm: 3 }, maxWidth: 640 }}>
        <EmptyState
          title="No rating options"
          description="Add at least one KPI rating level for scored questions."
        />
        {!readOnly ? (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={() => form.addRatingOption()}
            >
              Add rating level
            </Button>
          </Box>
        ) : null}
      </PageCard>
    );
  }

  return (
    <>
      {weightsWarning ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {weightsWarning}
        </Alert>
      ) : null}

      <PageCard sx={{ p: { xs: 2, sm: 3 }, maxWidth: 640 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            display: 'block',
            mb: 1.75,
            color: 'text.secondary',
          }}
        >
          Rating levels
        </Typography>

        <Stack>
          {ratingOptions.map((option, index) => {
            const moreOpen = Boolean(expandedMore[index]);
            return (
              <Box
                key={option.id ?? index}
                sx={{
                  py: 1.5,
                  borderTop: index === 0 ? 0 : 1,
                  borderColor: 'divider',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(96, 165, 250, 0.16)'
                          : 'rgba(59, 130, 246, 0.12)',
                      color: 'secondary.main',
                      fontWeight: 700,
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <TextField
                    {...form.register(`ratingOptions.${index}.label`)}
                    placeholder="e.g. Meets expectations"
                    fullWidth
                    size="small"
                    disabled={readOnly}
                  />
                  {!readOnly ? (
                    <Stack direction="row" spacing={0} flexShrink={0}>
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
                      <Tooltip title="Weight & active">
                        <IconButton
                          size="small"
                          onClick={() =>
                            setExpandedMore((prev) => ({
                              ...prev,
                              [index]: !prev[index],
                            }))
                          }
                        >
                          {moreOpen ? (
                            <ExpandLessRoundedIcon fontSize="small" />
                          ) : (
                            <ExpandMoreRoundedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={
                          ratingOptions.length <= 1
                            ? 'At least one rating option is required'
                            : 'Delete'
                        }
                      >
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
                    </Stack>
                  ) : null}
                </Stack>

                <Collapse in={moreOpen}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ sm: 'center' }}
                    sx={{ mt: 1.5, pl: { sm: 5.5 } }}
                  >
                    <TextField
                      {...form.register(`ratingOptions.${index}.weight`, {
                        valueAsNumber: true,
                      })}
                      label="Weight"
                      type="number"
                      size="small"
                      sx={{ width: { sm: 120 } }}
                      disabled={readOnly}
                    />
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
                    <Typography variant="caption" color="text.secondary">
                      Higher weights = stronger ratings
                    </Typography>
                  </Stack>
                </Collapse>
              </Box>
            );
          })}
        </Stack>

        {!readOnly ? (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={() => form.addRatingOption()}
            >
              Add rating level
            </Button>
          </Box>
        ) : null}
      </PageCard>

      <ConfirmDeleteDialog
        open={deleteIndex != null}
        title="Delete rating option?"
        description="Scored KPI questions rely on this scale. Existing assessments keep their snapshot."
        onClose={() => setDeleteIndex(null)}
        onConfirm={() => {
          if (deleteIndex != null) {
            form.ratingFields.remove(deleteIndex);
            setExpandedMore({});
          }
          setDeleteIndex(null);
        }}
      />
    </>
  );
}
