import { useEffect, useRef, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
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
  const [expandedQuestionIndex, setExpandedQuestionIndex] = useState(-1);
  const pendingExpandRef = useRef(false);

  useEffect(() => {
    setExpandedQuestionIndex(-1);
    pendingExpandRef.current = false;
  }, [sectionIndex]);

  useEffect(() => {
    if (pendingExpandRef.current && questions.length > 0) {
      pendingExpandRef.current = false;
      setExpandedQuestionIndex(questions.length - 1);
      return;
    }
    if (expandedQuestionIndex >= questions.length) {
      setExpandedQuestionIndex(questions.length > 0 ? questions.length - 1 : -1);
    }
  }, [questions.length, expandedQuestionIndex]);

  const handleAddQuestion = () => {
    pendingExpandRef.current = true;
    onAddQuestion?.();
  };

  const handleDeleteQuestion = (questionIndex) => {
    onDeleteQuestion(questionIndex);
    setExpandedQuestionIndex((prev) => {
      if (prev === questionIndex) return -1;
      if (prev > questionIndex) return prev - 1;
      return prev;
    });
  };

  const handleMoveQuestion = (from, to) => {
    onMoveQuestion(from, to);
    setExpandedQuestionIndex((prev) => {
      if (prev === from) return to;
      if (prev === to) return from;
      return prev;
    });
  };

  return (
    <Stack spacing={2.5}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          color: 'text.secondary',
        }}
      >
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
          border: 1,
          borderColor: 'divider',
          borderRadius: 1.5,
          bgcolor: (theme) => theme.palette.custom?.surfaces?.subtle ?? 'background.default',
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
              label="Section description"
              fullWidth
              multiline
              minRows={2}
              disabled={readOnly}
              placeholder="Shown above this section when someone fills out the assessment."
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

      <Divider />

      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.75 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Questions
          </Typography>
          {!readOnly && onAddQuestion ? (
            <Button
              size="small"
              color="inherit"
              startIcon={<AddRoundedIcon />}
              onClick={handleAddQuestion}
              sx={{ fontWeight: 600, px: 0.5 }}
            >
              Add question
            </Button>
          ) : null}
        </Stack>

        {questions.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No questions yet. Add a text box, radio, dropdown, or other input type.
          </Typography>
        ) : (
          <Stack spacing={1}>
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
                onMoveUp={() => handleMoveQuestion(questionIndex, questionIndex - 1)}
                onMoveDown={() => handleMoveQuestion(questionIndex, questionIndex + 1)}
                onDelete={() => handleDeleteQuestion(questionIndex)}
                expanded={expandedQuestionIndex === questionIndex}
                onExpand={() => setExpandedQuestionIndex(questionIndex)}
                onCollapse={() => setExpandedQuestionIndex(-1)}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
