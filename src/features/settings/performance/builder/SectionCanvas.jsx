import { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { Controller } from 'react-hook-form';
import { FilledByRoleSelect } from './FilledByRoleSelect';
import { QuestionCard } from './QuestionCard';

/**
 * @param {{
 *   sectionIndex: number,
 *   register: import('react-hook-form').UseFormRegister<object>,
 *   control: import('react-hook-form').Control<object>,
 *   watch: import('react-hook-form').UseFormWatch<object>,
 *   setValue: import('react-hook-form').UseFormSetValue<object>,
 *   readOnly?: boolean,
 *   fieldErrors?: Record<string, string>,
 *   ratingOptions?: object[],
 *   onAddQuestion?: () => void,
 *   onMoveQuestion: (from: number, to: number) => void,
 *   onDeleteQuestion: (questionIndex: number) => void,
 *   onOpenRatingDrawer?: () => void,
 * }} props
 */
export function SectionCanvas({
  sectionIndex,
  register,
  control,
  watch,
  setValue,
  readOnly = false,
  fieldErrors = {},
  ratingOptions = [],
  onAddQuestion,
  onMoveQuestion,
  onDeleteQuestion,
  onOpenRatingDrawer,
}) {
  const prefix = `sections.${sectionIndex}`;
  const questions = watch(`${prefix}.questions`) ?? [];
  const role = watch(`${prefix}.role`);

  return (
    <Stack spacing={2.5}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Section details
      </Typography>

      <TextField
        {...register(`${prefix}.title`)}
        label="Section title"
        fullWidth
        required
        disabled={readOnly}
        error={Boolean(fieldErrors[`${prefix}.title`])}
        helperText={fieldErrors[`${prefix}.title`] || ' '}
      />

      <FilledByRoleSelect
        value={role}
        disabled={readOnly}
        onChange={(next) => setValue(`${prefix}.role`, next, { shouldDirty: true })}
      />
      {fieldErrors[`${prefix}.role`] ? (
        <Typography variant="caption" color="error">
          {fieldErrors[`${prefix}.role`]}
        </Typography>
      ) : null}

      <Accordion
        disableGutters
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1.5,
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Advanced settings
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <TextField
              {...register(`${prefix}.banner`)}
              label="Banner text (optional)"
              fullWidth
              disabled={readOnly}
              helperText="Shown as a highlighted header on the assessment form."
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller
                control={control}
                name={`${prefix}.scored`}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                        disabled={readOnly}
                      />
                    }
                    label="Scored section"
                  />
                )}
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
                      />
                    }
                    label="Active"
                  />
                )}
              />
            </Stack>

            <TextField
              {...register(`${prefix}.key`)}
              label="Section key"
              fullWidth
              size="small"
              disabled={readOnly}
              error={Boolean(fieldErrors[`${prefix}.key`])}
              helperText={
                fieldErrors[`${prefix}.key`] ||
                'Stable identifier for stored answers. Auto-generated from title; edit if needed.'
              }
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Box sx={{ pt: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Questions
          </Typography>
          {!readOnly && onAddQuestion ? (
            <Button size="small" startIcon={<AddRoundedIcon />} onClick={onAddQuestion}>
              Add question
            </Button>
          ) : null}
        </Stack>

        {questions.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No questions yet. Add a text box, radio, dropdown, or other input type.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {questions.map((_, questionIndex) => (
              <QuestionCard
                key={questions[questionIndex]?.id ?? questionIndex}
                sectionIndex={sectionIndex}
                questionIndex={questionIndex}
                register={register}
                control={control}
                watch={watch}
                setValue={setValue}
                readOnly={readOnly}
                fieldErrors={fieldErrors}
                ratingOptions={ratingOptions}
                onOpenRatingDrawer={onOpenRatingDrawer}
                canMoveUp={questionIndex > 0}
                canMoveDown={questionIndex < questions.length - 1}
                onMoveUp={() => onMoveQuestion(questionIndex, questionIndex - 1)}
                onMoveDown={() => onMoveQuestion(questionIndex, questionIndex + 1)}
                onDelete={() => onDeleteQuestion(questionIndex)}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
