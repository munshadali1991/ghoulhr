import {
  Box,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { surface } from '@/shared/theme/surfaces';
import { LEAVE_WIZARD_LAST, LEAVE_WIZARD_STEPS } from '../constants';
import { LeaveWizardStepContent } from './LeaveWizardStepContent';

/**
 * @param {{
 *   idx: number,
 *   row: Record<string, unknown>,
 *   wizardStep: number,
 *   isDirty: boolean,
 *   isUpdating: boolean,
 *   register: import('react-hook-form').UseFormRegister<{ leaves: unknown[] }>,
 *   control: import('react-hook-form').Control<{ leaves: unknown[] }>,
 *   errors: import('react-hook-form').FieldErrors<{ leaves: unknown[] }>,
 *   savedLocations: { id: string, name: string, code?: string }[],
 *   onBackToList: () => void,
 *   onWizardPrev: () => void,
 *   onWizardNext: () => void,
 *   onCancel: () => void,
 *   onSubmit: (e: React.FormEvent) => void,
 * }} props
 */
export function LeaveTypeEditorWizard({
  idx,
  row,
  wizardStep,
  isDirty,
  isUpdating,
  register,
  control,
  errors,
  savedLocations,
  onBackToList,
  onWizardPrev,
  onWizardNext,
  onCancel,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} noValidate>
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          borderRadius: 2,
          borderColor: 'divider',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'flex-start' }}
          justifyContent="space-between"
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            py: 2.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: surface.subtle,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
            <Button
              type="button"
              variant="outlined"
              size="small"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={onBackToList}
              sx={{ flexShrink: 0, mt: 0.25 }}
            >
              Back to list
            </Button>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}
              >
                {row.name?.trim() ? 'Edit policy' : 'New policy'}
              </Typography>
              <Typography
                variant="h5"
                component="h2"
                fontWeight={800}
                sx={{ mt: 0.25, letterSpacing: '-0.02em' }}
              >
                {row.name?.trim() || 'Leave type'}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, maxWidth: 'min(100%, 640px)', lineHeight: 1.55 }}
              >
                Work through each step, then save on the last screen. Saving publishes this policy
                together with every other leave type in your list.
              </Typography>
            </Box>
          </Stack>
          <Chip
            size="small"
            variant="outlined"
            color={isDirty ? 'warning' : 'default'}
            label={isDirty ? 'Unsaved changes' : 'Saved'}
            sx={{ alignSelf: { xs: 'flex-start', md: 'center' }, flexShrink: 0 }}
          />
        </Stack>

        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 2, pb: 1, width: '100%' }}>
          <Stepper
            activeStep={wizardStep}
            alternativeLabel
            sx={{
              mb: 2,
              '& .MuiStepLabel-label': {
                fontSize: { xs: '0.68rem', sm: '0.8125rem' },
                fontWeight: 500,
              },
              '& .MuiStepLabel-labelContainer': { maxWidth: { xs: 76, sm: 'none' } },
            }}
          >
            {LEAVE_WIZARD_STEPS.map((s) => (
              <Step key={s.key}>
                <StepLabel>{s.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <LinearProgress
            variant="determinate"
            value={((wizardStep + 1) / LEAVE_WIZARD_STEPS.length) * 100}
            sx={{
              height: 4,
              borderRadius: 2,
              mb: 0,
              bgcolor: surface.progressTrack,
              '& .MuiLinearProgress-bar': { borderRadius: 2 },
            }}
          />
        </Box>

        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, md: 3 }, width: '100%' }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2.5, fontWeight: 500 }}>
            Step {wizardStep + 1} of {LEAVE_WIZARD_STEPS.length}
            {wizardStep > 0 ? ' · ' : ': '}
            {LEAVE_WIZARD_STEPS[wizardStep]?.description}
          </Typography>
          <Box
            sx={{
              maxWidth: 920,
              mx: 'auto',
              width: '100%',
              minHeight: { xs: 260, md: 300 },
            }}
          >
            <LeaveWizardStepContent
              wizardStep={wizardStep}
              idx={idx}
              row={row}
              register={register}
              control={control}
              errors={errors}
              savedLocations={savedLocations}
            />
          </Box>
        </Box>

        <Box
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            py: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: surface.subtle,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            flexWrap: 'wrap',
            gap: 2,
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: { md: 480 } }}>
            {wizardStep < LEAVE_WIZARD_LAST
              ? 'Use Continue to move forward. Required fields are checked before you leave the first step.'
              : isDirty
                ? 'You are on the final step — save to publish this policy with all other leave types.'
                : 'No pending changes on this policy.'}
          </Typography>
          <Stack
            direction="row"
            spacing={1.5}
            flexWrap="wrap"
            justifyContent="flex-end"
            alignItems="center"
          >
            <Button
              type="button"
              variant="outlined"
              color="inherit"
              disabled={wizardStep === 0}
              onClick={onWizardPrev}
            >
              Previous step
            </Button>
            <Button variant="outlined" color="inherit" disabled={!isDirty} onClick={onCancel}>
              Discard
            </Button>
            {wizardStep < LEAVE_WIZARD_LAST ? (
              <Button
                type="button"
                variant="contained"
                onClick={onWizardNext}
                endIcon={<ChevronRightRoundedIcon />}
              >
                Continue
              </Button>
            ) : (
              <Button type="submit" variant="contained" disabled={isUpdating || !isDirty}>
                {isUpdating ? <CircularProgress size={22} color="inherit" /> : 'Save changes'}
              </Button>
            )}
          </Stack>
        </Box>
      </Paper>
    </form>
  );
}
