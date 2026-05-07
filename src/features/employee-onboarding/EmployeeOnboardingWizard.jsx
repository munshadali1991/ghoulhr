import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { checkEmployeeDuplicate, submitHrOnboarding, updateHrOnboarding } from '../../services/employeesApi';
import { STEP_LABELS } from './constants';
import {
  buildHrOnboardingPayload,
  fullOnboardingSchema,
  getDefaultOnboardingValues,
  validateOnboardingStep,
} from './onboardingSchema';
import { useBeforeUnloadDirty } from './hooks/useBeforeUnloadDirty';
import { useOnboardingDraft } from './hooks/useOnboardingDraft';
import { StepBasicInfo } from './steps/StepBasicInfo';
import { StepEmployment } from './steps/StepEmployment';
import { StepExperience } from './steps/StepExperience';
import { StepPayrollBank } from './steps/StepPayrollBank';
import { StepCompliance } from './steps/StepCompliance';
import { StepEmergency } from './steps/StepEmergency';
import { StepDocuments } from './steps/StepDocuments';
import { StepAccess } from './steps/StepAccess';
import { useEmployeeSettings } from '../../hooks/useEmployeeSettings';

function applyZodIssues(setError, issues) {
  issues.forEach((issue) => {
    const path = issue.path.join('.');
    if (path) setError(path, { type: 'manual', message: issue.message });
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [duplicateResult, setDuplicateResult] = useState(null);
  const { settings: employeeSettings } = useEmployeeSettings(organizationId);

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
    setSnackbar({ open: true, message: 'Draft restored from this device.', severity: 'info' });
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

  const managerOptions = useMemo(() => {
    return (employees || [])
      .filter((e) => e.role === 'MANAGER' || e.role === 'ORG_ADMIN')
      .map((e) => ({
        id: e.id,
        label: `${e.name} (${e.employeeCode}) — ${e.role}`,
      }));
  }, [employees]);

  const progress = ((activeStep + 1) / STEP_LABELS.length) * 100;

  const goNext = useCallback(async () => {
    clearErrors();
    const r = validateOnboardingStep(activeStep, getValues());
    if (!r.success) {
      applyZodIssues(setError, r.error.issues);
      setSnackbar({ open: true, message: 'Please fix the highlighted fields.', severity: 'warning' });
      return;
    }
    setActiveStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }, [activeStep, clearErrors, getValues, setError]);

  const goBack = useCallback(() => {
    clearErrors();
    setActiveStep((s) => Math.max(s - 1, 0));
  }, [clearErrors]);

  const finalizeSubmit = async () => {
    clearErrors();
    const values = getValues();
    const r = fullOnboardingSchema.safeParse(values);
    if (!r.success) {
      applyZodIssues(setError, r.error.issues);
      setSnackbar({ open: true, message: 'Review validation errors before submitting.', severity: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildHrOnboardingPayload(r.data);
      const approxJsonBytes = new Blob([JSON.stringify(payload)]).size;
      if (approxJsonBytes > 6 * 1024 * 1024) {
        setSnackbar({
          open: true,
          severity: 'warning',
          message: `This request is about ${(approxJsonBytes / (1024 * 1024)).toFixed(1)} MB. If submit fails with 413, remove some documents or shrink files.`,
        });
      }
      const result = employeeId
        ? await updateHrOnboarding(employeeId, payload)
        : await submitHrOnboarding(payload);
      if (!employeeId) clearDraft();
      onSuccess(result);
    } catch (e) {
      const msg = e.message || 'Failed to create employee';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    if (isEditMode) return;
    if (saveDraftNow()) {
      setSnackbar({ open: true, message: 'Draft saved on this device.', severity: 'success' });
    }
  };

  const stepPanel = () => {
    switch (activeStep) {
      case 0:
        return <StepBasicInfo duplicateResult={duplicateResult} />;
      case 1:
        return <StepEmployment managerOptions={managerOptions} employeeSettings={employeeSettings} />;
      case 2:
        return <StepExperience />;
      case 3:
        return <StepPayrollBank />;
      case 4:
        return <StepCompliance />;
      case 5:
        return <StepEmergency />;
      case 6:
        return <StepDocuments />;
      case 7:
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
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardRoundedIcon />}
                    onClick={goNext}
                    disabled={submitting}
                    fullWidth={isNarrow}
                    sx={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #1e3a5f 100%)',
                      fontWeight: 600,
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckRoundedIcon />}
                    disabled={submitting}
                    fullWidth={isNarrow}
                    onClick={finalizeSubmit}
                    sx={{
                      minWidth: { sm: 200 },
                      background: 'linear-gradient(135deg, #2563eb 0%, #1e3a5f 100%)',
                      fontWeight: 600,
                    }}
                  >
                    {submitting ? 'Submitting…' : employeeId ? 'Save changes' : 'Complete onboarding'}
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>
        </Card>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </FormProvider>
  );
}
