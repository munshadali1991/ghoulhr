import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import {
  Box,
  Button,
  CircularProgress,
  GlobalStyles,
  Stack,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { FormStatusAlerts } from '@/shared/components/feedback/FormStatusAlerts';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { PageCard } from '@/shared/components/ui';
import { useBeforeUnloadDirty } from '@/features/employees/onboarding/hooks/useBeforeUnloadDirty';
import {
  useAssessment,
  useSaveAssessmentDraft,
  useSaveHrReview,
  useSaveManagerReview,
  useSaveRoleReview,
  useSubmitAssessment,
} from '../hooks/usePerformanceQueries';
import { useAssessmentDraft } from '../hooks/useAssessmentDraft';
import {
  getDefaultFormValues,
  mapAssessmentToFormValues,
  mapFormValuesToAnswers,
  questionsForRole,
} from '../utils/assessmentForm';
import { computeLiveScore } from '../utils/scoring';
import { validateForSubmit } from '../schemas/assessmentSchema';
import {
  ANSWER_ROLES,
  ASSESSMENT_STATUS,
  isHrClassRole,
  isManagerClassRole,
  normalizeSectionRoleCode,
} from '../constants/performanceEnums';
import { mapAssessmentViewer } from '../utils/assessmentAccess';
import { AssessmentHeaderBar } from '../components/AssessmentHeaderBar';
import { AssessmentActions } from '../components/AssessmentActions';
import { AssessmentFooterBar } from '../components/AssessmentFooterBar';
import { ProfileMetaGrid } from '../components/ProfileMetaGrid';
import { InstructionalCallout } from '../components/InstructionalCallout';
import { AssessmentSectionList } from '../components/AssessmentSectionList';

const printStyles = {
  '@media print': {
    '.assessment-actions-print-hide': { display: 'none !important' },
    '.MuiAppBar-root': { display: 'none !important' },
    '.MuiDrawer-root': { display: 'none !important' },
    'main.MuiBox-root': { margin: '0 !important', padding: '0 !important' },
  },
};

export function PerformanceAssessmentPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { snackbar, show, close } = useAppSnackbar();

  const { data: assessment, isLoading, isError, error } = useAssessment(assessmentId);
  const saveDraftMutation = useSaveAssessmentDraft();
  const submitMutation = useSubmitAssessment();
  const managerReviewMutation = useSaveManagerReview();
  const hrReviewMutation = useSaveHrReview();
  const roleReviewMutation = useSaveRoleReview();

  const { saveLocalDraft, loadLocalDraft, clearLocalDraft } = useAssessmentDraft(assessmentId);

  const schema = assessment?.schema;
  const sections = schema?.sections ?? [];

  const methods = useForm({
    defaultValues: getDefaultFormValues(schema),
    mode: 'onTouched',
  });
  const { control, getValues, reset, formState } = methods;
  const [fieldErrors, setFieldErrors] = useState({});

  const hydratedRef = useRef(null);

  useEffect(() => {
    if (!assessment || hydratedRef.current === assessment.id) return;
    const serverValues = mapAssessmentToFormValues(assessment);
    const localDraft = loadLocalDraft();
    reset(localDraft ?? serverValues);
    hydratedRef.current = assessment.id;
  }, [assessment, loadLocalDraft, reset]);

  const viewer = assessment?.viewer;
  const status = assessment?.status ?? ASSESSMENT_STATUS.DRAFT;

  const { actingRole, employeeEditable, canManagerReview, canHrReview, editableByRole } =
    useMemo(() => mapAssessmentViewer(viewer, status), [viewer, status]);

  const perms = useMemo(
    () => ({
      employeeEditable,
      canManagerReview,
      canHrReview,
      editableByRole,
    }),
    [employeeEditable, canManagerReview, canHrReview, editableByRole],
  );

  const answers = useWatch({ control, name: 'answers' });
  const live = useMemo(() => computeLiveScore(answers, schema), [answers, schema]);
  const liveScore = employeeEditable ? live.score : (assessment?.score ?? 0);

  useBeforeUnloadDirty(formState.isDirty && employeeEditable);

  // localStorage crash-safety autosave (employee, debounced).
  useEffect(() => {
    if (!employeeEditable || !formState.isDirty) return undefined;
    const timer = setTimeout(() => saveLocalDraft(getValues()), 1000);
    return () => clearTimeout(timer);
  }, [answers, employeeEditable, formState.isDirty, getValues, saveLocalDraft]);

  const scrollToFirstError = useCallback((keys) => {
    const first = keys[0];
    if (!first) return;
    const el = document.querySelector(`[data-question="${first}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleMutationSuccess = useCallback(
    (updated, message) => {
      clearLocalDraft();
      if (updated) {
        hydratedRef.current = null; // allow re-hydration from fresh server data
        reset(mapAssessmentToFormValues(updated));
        hydratedRef.current = updated.id;
      }
      setFieldErrors({});
      show(message, 'success');
    },
    [clearLocalDraft, reset, show],
  );

  const handleError = useCallback(
    (err) => show(err?.message || 'Something went wrong. Please try again.', 'error'),
    [show],
  );

  const persist = useCallback(
    ({ submit }) => {
      const values = getValues();
      const role = normalizeSectionRoleCode(actingRole);
      if (!role) return;

      if (role === ANSWER_ROLES.EMPLOYEE) {
        const payload = {
          answers: mapFormValuesToAnswers(values, questionsForRole(schema, ANSWER_ROLES.EMPLOYEE)),
        };
        if (submit) {
          const { ok, issues } = validateForSubmit(values, schema);
          if (!ok) {
            const keys = issues
              .map((i) => i.path.split('.')[1])
              .filter(Boolean);
            const map = {};
            keys.forEach((k) => {
              map[k] = 'This field is required';
            });
            setFieldErrors(map);
            show('Please complete all required fields before submitting.', 'warning');
            scrollToFirstError(keys);
            return;
          }
          submitMutation.mutate(
            { id: assessmentId, payload },
            {
              onSuccess: (data) => handleMutationSuccess(data, 'Assessment submitted successfully.'),
              onError: handleError,
            },
          );
        } else {
          saveDraftMutation.mutate(
            { id: assessmentId, payload },
            {
              onSuccess: (data) => handleMutationSuccess(data, 'Draft saved.'),
              onError: handleError,
            },
          );
        }
        return;
      }

      const reviewPayload = {
        answers: mapFormValuesToAnswers(values, questionsForRole(schema, role)),
        complete: Boolean(submit),
      };

      if (isManagerClassRole(role)) {
        managerReviewMutation.mutate(
          { id: assessmentId, payload: reviewPayload },
          {
            onSuccess: (data) =>
              handleMutationSuccess(data, submit ? 'Manager review submitted.' : 'Manager review saved.'),
            onError: handleError,
          },
        );
        return;
      }

      if (isHrClassRole(role)) {
        hrReviewMutation.mutate(
          { id: assessmentId, payload: reviewPayload },
          {
            onSuccess: (data) =>
              handleMutationSuccess(data, submit ? 'HR feedback submitted.' : 'HR feedback saved.'),
            onError: handleError,
          },
        );
        return;
      }

      roleReviewMutation.mutate(
        { id: assessmentId, roleCode: role, payload: reviewPayload },
        {
          onSuccess: (data) =>
            handleMutationSuccess(
              data,
              submit ? 'Section submitted.' : 'Section saved.',
            ),
          onError: handleError,
        },
      );
    },
    [
      assessmentId,
      getValues,
      handleError,
      handleMutationSuccess,
      hrReviewMutation,
      managerReviewMutation,
      roleReviewMutation,
      actingRole,
      saveDraftMutation,
      schema,
      scrollToFirstError,
      show,
      submitMutation,
    ],
  );

  const handlePrint = useCallback(() => window.print(), []);

  const savingDraft =
    saveDraftMutation.isPending ||
    managerReviewMutation.isPending ||
    hrReviewMutation.isPending ||
    roleReviewMutation.isPending;
  const submitting =
    submitMutation.isPending ||
    managerReviewMutation.isPending ||
    hrReviewMutation.isPending ||
    roleReviewMutation.isPending;

  const actionsDisabled = !actingRole;
  const actionsNode = (
    <AssessmentActions
      onSaveDraft={() => persist({ submit: false })}
      onSubmit={() => persist({ submit: true })}
      onSavePdf={handlePrint}
      savingDraft={savingDraft}
      submitting={submitting}
      disabled={actionsDisabled}
      showDraft={Boolean(actingRole)}
      showSubmit={Boolean(actingRole)}
    />
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !assessment) {
    return (
      <Box>
        <FormStatusAlerts
          loadError={{ message: error?.message || 'Unable to load this assessment.' }}
        />
      </Box>
    );
  }

  return (
    <FormProvider {...methods}>
      <GlobalStyles styles={printStyles} />
      <Box component="form" noValidate onSubmit={(e) => e.preventDefault()}>
        <Stack spacing={2}>
          <Button
            className="assessment-actions-print-hide"
            color="inherit"
            size="small"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate('/performance')}
            sx={{ alignSelf: 'flex-start' }}
          >
            Back to assessments
          </Button>

          <ProfileMetaGrid header={assessment.header} />

          <AssessmentHeaderBar
            title={assessment.cycleLabel}
            score={liveScore}
            answered={employeeEditable ? live.answered : undefined}
            total={employeeEditable ? live.total : undefined}
            actions={actionsNode}
          />

          <InstructionalCallout
            description={assessment.description}
            dueDate={assessment.dueDate}
          />

          <PageCard sx={{ p: { xs: 1.5, sm: 2.5 } }}>
            <AssessmentSectionList sections={sections} perms={perms} errors={fieldErrors} />
          </PageCard>

          <AssessmentFooterBar
            onSaveDraft={() => persist({ submit: false })}
            onSubmit={() => persist({ submit: true })}
            savingDraft={savingDraft}
            submitting={submitting}
            disabled={actionsDisabled}
            showDraft={Boolean(actingRole)}
            showSubmit={Boolean(actingRole)}
          />
        </Stack>
      </Box>
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={close}
      />
    </FormProvider>
  );
}
