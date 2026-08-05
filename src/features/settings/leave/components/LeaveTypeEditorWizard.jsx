import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Link,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { PageCard } from '@/shared/components/ui/PageCard';
import { CrudButton } from '@/shared/components/ui/CrudButton';
import { LEAVE_WIZARD_LAST, LEAVE_WIZARD_STEPS } from '../constants';
import { LeaveWizardStepContent } from './LeaveWizardStepContent';

function StepRail({ wizardStep, onSelectStep }) {
  return (
    <PageCard sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography
        variant="caption"
        sx={{
          mb: 1.5,
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'text.secondary',
        }}
      >
        Steps
      </Typography>
      <Stack spacing={0.5}>
        {LEAVE_WIZARD_STEPS.map((step, index) => {
          const selected = wizardStep === index;
          const done = index < wizardStep;
          return (
            <Box
              key={step.key}
              onClick={() => onSelectStep?.(index)}
              sx={{
                display: 'flex',
                gap: 1.25,
                alignItems: 'flex-start',
                py: 1.25,
                px: 1.25,
                borderRadius: 1.5,
                borderLeft: 3,
                borderLeftColor: selected ? 'warning.main' : 'transparent',
                bgcolor: selected
                  ? (t) =>
                      t.palette.mode === 'dark'
                        ? 'rgba(245, 158, 11, 0.12)'
                        : 'rgba(245, 158, 11, 0.08)'
                  : 'transparent',
                cursor: onSelectStep ? 'pointer' : 'default',
                '&:hover': onSelectStep
                  ? {
                      bgcolor: selected
                        ? undefined
                        : (t) => t.palette.custom?.surfaces?.subtle ?? 'action.hover',
                    }
                  : undefined,
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  typography: 'caption',
                  fontWeight: 700,
                  mt: 0.15,
                  bgcolor: selected
                    ? 'warning.main'
                    : done
                      ? 'success.main'
                      : (t) => t.palette.custom?.surfaces?.muted ?? 'action.hover',
                  color: selected || done ? 'common.white' : 'text.secondary',
                }}
              >
                {index + 1}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.35 }}>
                  {step.label}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.25 }}>
                  {step.description}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </PageCard>
  );
}

function MobileStepChips({ wizardStep, onSelectStep }) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
      {LEAVE_WIZARD_STEPS.map((step, index) => {
        const selected = wizardStep === index;
        return (
          <Chip
            key={step.key}
            size="small"
            label={`${index + 1}. ${step.label}`}
            onClick={() => onSelectStep?.(index)}
            sx={{
              fontWeight: 600,
              bgcolor: selected
                ? (t) =>
                    t.palette.mode === 'dark'
                      ? 'rgba(245, 158, 11, 0.2)'
                      : 'rgba(245, 158, 11, 0.14)'
                : 'transparent',
              border: 1,
              borderColor: selected ? 'warning.main' : 'divider',
              color: selected ? 'warning.dark' : 'text.secondary',
            }}
          />
        );
      })}
    </Stack>
  );
}

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
 *   onSelectStep?: (step: number) => void,
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
  onSelectStep,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isNew = !row.name?.trim();
  const title = row.name?.trim() || 'New leave type';

  return (
    <Box component="form" onSubmit={onSubmit} noValidate sx={{ width: '100%' }}>
      <Button
        type="button"
        startIcon={<ArrowBackRoundedIcon />}
        onClick={onBackToList}
        disabled={isUpdating}
        sx={{ mb: 1.5, color: 'text.secondary', fontWeight: 600 }}
      >
        Back
      </Button>

      <Breadcrumbs sx={{ mb: 1.5 }} aria-label="Leave type breadcrumb">
        <Link
          component="button"
          type="button"
          variant="body2"
          underline="hover"
          color="text.secondary"
          onClick={onBackToList}
        >
          Leave types
        </Link>
        <Typography variant="body2" color="text.primary" fontWeight={600}>
          {isNew ? 'New' : 'Edit'}
        </Typography>
      </Breadcrumbs>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography variant="h5" component="h1" fontWeight={700} sx={{ letterSpacing: '-0.02em' }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 560 }}>
            Work through each step, then save. Saving publishes this policy together with every
            other leave type in your list.
          </Typography>
        </Box>
        <Chip
          size="small"
          variant="outlined"
          color={isDirty ? 'warning' : 'default'}
          label={isDirty ? 'Unsaved changes' : 'Saved'}
          sx={{ flexShrink: 0 }}
        />
      </Stack>

      {isMobile ? (
        <MobileStepChips wizardStep={wizardStep} onSelectStep={onSelectStep} />
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '240px 1fr' },
          gap: 2.25,
          alignItems: 'start',
        }}
      >
        {!isMobile ? (
          <Box sx={{ position: 'sticky', top: 88 }}>
            <StepRail wizardStep={wizardStep} onSelectStep={onSelectStep} />
          </Box>
        ) : null}

        <PageCard sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
            Step {wizardStep + 1} of {LEAVE_WIZARD_STEPS.length} ·{' '}
            {LEAVE_WIZARD_STEPS[wizardStep]?.description}
          </Typography>

          <LeaveWizardStepContent
            wizardStep={wizardStep}
            idx={idx}
            row={row}
            register={register}
            control={control}
            errors={errors}
            savedLocations={savedLocations}
          />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ mt: 3, pt: 2.5, borderTop: 1, borderColor: 'divider' }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 360 }}>
              {wizardStep < LEAVE_WIZARD_LAST
                ? 'Continue checks required fields on the first step.'
                : 'Final step — save to publish all leave types.'}
            </Typography>
            <Stack direction="row" spacing={1.25} flexWrap="wrap" justifyContent="flex-end" useFlexGap>
              <Button
                type="button"
                variant="outlined"
                disabled={wizardStep === 0}
                onClick={onWizardPrev}
              >
                Previous
              </Button>
              <Button type="button" variant="outlined" disabled={!isDirty} onClick={onCancel}>
                Discard
              </Button>
              {wizardStep < LEAVE_WIZARD_LAST ? (
                <CrudButton
                  intent="create"
                  type="button"
                  onClick={onWizardNext}
                  endIcon={<ChevronRightRoundedIcon />}
                >
                  Continue
                </CrudButton>
              ) : (
                <CrudButton intent="save" type="submit" disabled={isUpdating || !isDirty}>
                  {isUpdating ? <CircularProgress size={22} color="inherit" /> : 'Save changes'}
                </CrudButton>
              )}
            </Stack>
          </Stack>
        </PageCard>
      </Box>
    </Box>
  );
}
