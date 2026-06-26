import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { BrandedButton } from '@/shared/components/ui/BrandedButton';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { checkEmployeeDuplicate, submitHrOnboarding, updateHrOnboarding } from '@/features/employees/api/employeesApi';
import { STEP_LABELS } from './constants';
import {
  buildFullOnboardingSchema,
  buildHrOnboardingPayload,
  getDefaultOnboardingValues,
  getStepIndexFromIssuePath,
  validateOnboardingStep,
} from './onboardingSchema';
import { useBeforeUnloadDirty } from './hooks/useBeforeUnloadDirty';
import { useOnboardingDraft } from './hooks/useOnboardingDraft';
import { useEmploymentLocationShifts } from './hooks/useEmploymentLocationShifts';
import {
  getShiftsForLocation,
  resolveBusinessUnitToLocationId,
} from './utils/employmentLocationShift';
import { StepBasicInfo } from './steps/StepBasicInfo';
import { StepEmployment } from './steps/StepEmployment';
import { StepExperience } from './steps/StepExperience';
import { StepPayrollBank } from './steps/StepPayrollBank';
import { StepCompliance } from './steps/StepCompliance';
import { StepDocuments } from './steps/StepDocuments';
import { StepAccess } from './steps/StepAccess';
import { useEmployeeSettings } from '@/features/settings/employees';

function applyZodIssues(setError, issues) {
  issues.forEach((issue) => {
    const path = issue.path.join('.');
    if (path) {
      setError(path, { type: 'manual', message: issue.message }, { shouldFocus: issues[0] === issue });
    }
  });
}

function scrollToFirstError() {
  requestAnimationFrame(() => {
    const el = document.querySelector('.Mui-error, [aria-invalid="true"]');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

export function EmployeeOnboardingWizard({
  organizationId,
  employees,
  onCancel,
  onSuccess,
  employeeId,
  initialValues,
}) {
  const isEditMode = Boolean(employeeId);
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down('md'));
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { snackbar, show: showSnackbar, close: closeSnackbar } = useAppSnackbar();
  const [duplicateResult, setDuplicateResult] = useState(null);
  const { settings: employeeSettings } = useEmployeeSettings(organizationId);
  const { activeLocations, shifts } = useEmploymentLocationShifts(organizationId);

  const methods = useForm({
    defaultValues: initialValues || getDefaultOnboardingValues(),
    mode: 'onTouched',
  });

  const { getValues, reset, setError, clearErrors, formState, control } = methods;

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const { saveDraftNow, resumeDraft, clearDraft } = useOnboardingDraft(organizationId, getValues, reset);

  const watchedForm = useWatch({ control });

  useBeforeUnloadDirty(formState.isDirty);

  useEffect(() => {
    if (isEditMode) return;
    if (!resumeDraft()) return;
    showSnackbar('Draft restored from this device.', 'info');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on mount
  }, [isEditMode]);

  useEffect(() => {
    if (isEditMode) return;
    if (!formState.isDirty) return;
    const id = setTimeout(() => saveDraftNow(), 1000);
    return () => clearTimeout(id);
  }, [isEditMode, watchedForm, formState.isDirty, saveDraftNow]);

  const watchedBasic = methods.watch(['basic.personalEmail', 'employment.officialEmail', 'basic.mobileNumber']);
  useEffect(() => {
    const t = setTimeout(async () => {
      const [pe, oe, mob] = watchedBasic;
      if (!pe && !oe && !mob) {
        setDuplicateResult(null);
        return;
      }
      try {
        const res = await checkEmployeeDuplicate({
          personalEmail: pe || undefined,
          officialEmail: oe || undefined,
          mobileNumber: mob || undefined,
        });
        setDuplicateResult(res);
      } catch {
        setDuplicateResult(null);
      }
    }, 650);
    return () => clearTimeout(t);
  }, [watchedBasic]);

  const hrManagerOptions = useMemo(() => {
    return (employees || [])
      .filter((e) => e.status !== 'TERMINATED')
      .map((e) => ({
        id: e.id,
        label: `${e.name} (${e.employeeCode})`,
      }));
  }, [employees]);

  const validationOptions = useCallback(() => {
    const values = getValues();
    const locationId = resolveBusinessUnitToLocationId(values.employment?.businessUnit, activeLocations);
    const shiftsForLocation = getShiftsForLocation(shifts, locationId);
    const requireShift = Boolean(locationId && shiftsForLocation.length > 0);

    return {
      requiredFields: employeeSettings?.required_fields,
      employmentContext: { requireShift },
    };
  }, [activeLocations, employeeSettings?.required_fields, getValues, shifts]);

  const progress = ((activeStep + 1) / STEP_LABELS.length) * 100;

  const goNext = useCallback(async () => {
    clearErrors();
    const options = validationOptions();
    const r = validateOnboardingStep(activeStep, getValues(), options);
    if (!r.success) {
      applyZodIssues(setError, r.error.issues);
      showSnackbar('Please fix the highlighted fields.', 'warning');
      scrollToFirstError();
      return;
    }

    if (activeStep === 0 && duplicateResult) {
      let blocked = false;
      if (duplicateResult.emailTaken) {
        setError('basic.personalEmail', {
          type: 'manual',
          message: 'This email is already registered in your organization',
        });
        blocked = true;
      }
      if (duplicateResult.mobileTaken) {
        setError('basic.mobileNumber', {
          type: 'manual',
          message: 'This mobile number is already registered in your organization',
        });
        blocked = true;
      }
      if (blocked) {
        showSnackbar('Resolve duplicate contact details before continuing.', 'warning');
        scrollToFirstError();
        return;
      }
    }

    setActiveStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }, [activeStep, clearErrors, duplicateResult, getValues, setError, showSnackbar, validationOptions]);

  const goBack = useCallback(() => {
    clearErrors();
    setActiveStep((s) => Math.max(s - 1, 0));
  }, [clearErrors]);

  const finalizeSubmit = async () => {
    clearErrors();
    const values = getValues();
    const options = validationOptions();
    const schema = buildFullOnboardingSchema(options);
    const r = schema.safeParse(values);
    if (!r.success) {
      applyZodIssues(setError, r.error.issues);
      const firstIssue = r.error.issues[0];
      if (firstIssue?.path) {
        setActiveStep(getStepIndexFromIssuePath(firstIssue.path));
      }
      showSnackbar('Review validation errors before submitting.', 'warning');
      scrollToFirstError();
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildHrOnboardingPayload(r.data);
      const approxJsonBytes = new Blob([JSON.stringify(payload)]).size;
      if (approxJsonBytes > 6 * 1024 * 1024) {
        showSnackbar(
          `This request is about ${(approxJsonBytes / (1024 * 1024)).toFixed(1)} MB. If submit fails with 413, remove some documents or shrink files.`,
          'warning',
        );
      }
      const result = employeeId
        ? await updateHrOnboarding(employeeId, payload)
        : await submitHrOnboarding(payload);
      if (!employeeId) clearDraft();
      onSuccess(result);
    } catch (e) {
      const msg = e.message || 'Failed to create employee';
      showSnackbar(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    if (isEditMode) return;
    if (saveDraftNow()) {
      showSnackbar('Draft saved on this device.', 'success');
    }
  };

  const stepPanel = () => {
    switch (activeStep) {
      case 0:
        return <StepBasicInfo duplicateResult={duplicateResult} />;
      case 1:
        return (
          <StepEmployment
            organizationId={organizationId}
            hrManagerOptions={hrManagerOptions}
            employeeSettings={employeeSettings}
          />
        );
      case 2:
        return <StepExperience />;
      case 3:
        return <StepPayrollBank />;
      case 4:
        return <StepCompliance />;
      case 5:
        return <StepDocuments />;
      case 6:
        return <StepAccess />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: { xs: 'calc(100vh - 120px)', md: 'auto' },
          mx: { xs: -1, sm: 0 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            position: { xs: 'sticky', md: 'static' },
            top: 0,
            zIndex: 2,
            px: { xs: 1.5, sm: 2 },
            py: 1.5,
            mb: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                color="inherit"
                startIcon={<ArrowBackRoundedIcon />}
                onClick={onCancel}
                disabled={submitting}
              >
                Back to list
              </Button>
              <Button
                variant="outlined"
                startIcon={<SaveRoundedIcon />}
                onClick={handleSaveDraft}
                disabled={submitting || isEditMode}
              >
                Save draft
              </Button>
            </Stack>
            <Box textAlign={{ xs: 'left', sm: 'right' }}>
              <Typography variant="h5" fontWeight={700}>
                {employeeId ? 'Edit employee' : 'HR onboarding'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Step {activeStep + 1} of {STEP_LABELS.length} — {STEP_LABELS[activeStep]}
              </Typography>
            </Box>
          </Stack>
          <LinearProgress variant="determinate" value={progress} sx={{ mt: 2, borderRadius: 1, height: 6 }} />
        </Paper>

        <Card
          elevation={0}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
            <Box sx={{ mb: { xs: 2, md: 3 } }}>
              {isNarrow ? (
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
                  {STEP_LABELS.map((label, i) => (
                    <Chip
                      key={label}
                      size="small"
                      label={label}
                      color={i === activeStep ? 'primary' : i < activeStep ? 'success' : 'default'}
                      variant={i === activeStep ? 'filled' : 'outlined'}
                    />
                  ))}
                </Stack>
              ) : (
                <Stepper activeStep={activeStep} alternativeLabel>
                  {STEP_LABELS.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              )}
            </Box>

            <Box sx={{ maxWidth: 900, mx: 'auto', width: '100%' }}>{stepPanel()}</Box>
          </CardContent>

          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'grey.50',
              position: { xs: 'sticky', sm: 'static' },
              bottom: 0,
            }}
          >
            <Stack
              direction={{ xs: 'column-reverse', sm: 'row' }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <Button
                variant="outlined"
                onClick={activeStep === 0 ? onCancel : goBack}
                disabled={submitting}
                fullWidth={isNarrow}
              >
                {activeStep === 0 ? 'Cancel' : 'Previous'}
              </Button>
              <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                {activeStep < STEP_LABELS.length - 1 ? (
                  <BrandedButton
                    brandVariant="onboarding"
                    endIcon={<ArrowForwardRoundedIcon />}
                    onClick={goNext}
                    disabled={submitting}
                    fullWidth={isNarrow}
                  >
                    Next
                  </BrandedButton>
                ) : (
                  <BrandedButton
                    brandVariant="onboarding"
                    endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckRoundedIcon />}
                    disabled={submitting}
                    fullWidth={isNarrow}
                    onClick={finalizeSubmit}
                    sx={{ minWidth: { sm: 200 } }}
                  >
                    {submitting ? 'Submitting…' : employeeId ? 'Save changes' : 'Complete onboarding'}
                  </BrandedButton>
                )}
              </Stack>
            </Stack>
          </Box>
        </Card>

        <AppSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={closeSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Box>
    </FormProvider>
  );
}
