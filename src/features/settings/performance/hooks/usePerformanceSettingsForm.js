import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { usePerformanceMaster } from './usePerformanceMaster';
import { useRbacRoles } from '@/features/rbac/hooks/useRbacAdmin';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import {
  createEmptyQuestion,
  createEmptyRatingOption,
  createEmptySection,
  createSectionFromQuickCreate,
  formValuesToMasterPayload,
  masterToFormValues,
  validatePerformanceMasterForm,
} from '../utils/performanceMasterMappers';
import { analyzePerformanceMaster } from '../utils/performanceMasterValidation';

/**
 * @param {string} organizationId
 */
export function usePerformanceSettingsForm(organizationId) {
  const { master, isLoading, error, updateMaster, isUpdating } =
    usePerformanceMaster(organizationId);
  const { snackbar, show, close } = useAppSnackbar();
  const { data: rbacRoles = [] } = useRbacRoles();
  const [formError, setFormError] = useState('');
  const hasInitialized = useRef(false);
  const masterRef = useRef(master);

  const form = useForm({
    defaultValues: masterToFormValues(null),
    shouldUnregister: false,
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    formState: { isDirty },
  } = form;

  const ratingFields = useFieldArray({ control, name: 'ratingOptions' });
  const sectionFields = useFieldArray({ control, name: 'sections' });

  const watchedSections = useWatch({ control, name: 'sections' }) ?? [];
  const watchedRatingOptions = useWatch({ control, name: 'ratingOptions' }) ?? [];
  const watchedValues = useWatch({ control });

  const validation = useMemo(() => {
    const validRoleCodes = new Set(rbacRoles.map((r) => r.code));
    return analyzePerformanceMaster(
      watchedValues ?? { sections: watchedSections, ratingOptions: watchedRatingOptions },
      validRoleCodes,
    );
  }, [watchedValues, watchedSections, watchedRatingOptions, rbacRoles]);

  useEffect(() => {
    masterRef.current = master;
  }, [master]);

  useEffect(() => {
    hasInitialized.current = false;
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId || isLoading || hasInitialized.current) return;
    hasInitialized.current = true;
    reset(masterToFormValues(master ?? { sections: [], ratingOptions: [] }));
  }, [organizationId, isLoading, master, reset]);

  const stats = useMemo(() => {
    const sectionCount = watchedSections.length;
    const questionCount = watchedSections.reduce(
      (sum, section) => sum + (section?.questions?.filter((q) => q?.isActive !== false)?.length ?? 0),
      0,
    );
    const ratingCount = watchedRatingOptions.filter((o) => o?.isActive !== false).length;
    return { sectionCount, questionCount, ratingCount };
  }, [watchedSections, watchedRatingOptions]);

  const dismissFormError = useCallback(() => setFormError(''), []);

  const onSubmit = useCallback(
    async (values) => {
      const validRoleCodes = new Set(rbacRoles.map((r) => r.code));
      const issues = validatePerformanceMasterForm(values, validRoleCodes);
      if (issues.length) {
        setFormError(issues.join(' · '));
        show(`Fix ${issues.length} issue${issues.length === 1 ? '' : 's'} before saving.`, 'warning');
        return;
      }

      try {
        setFormError('');
        const payload = formValuesToMasterPayload(values);
        const updated = await updateMaster(payload);
        reset(masterToFormValues(updated));
        show('Performance master saved.', 'success');
      } catch (err) {
        const message = err?.message || 'Failed to save performance master.';
        setFormError(message);
        show(message, 'error');
      }
    },
    [reset, show, updateMaster, rbacRoles],
  );

  const discardChanges = useCallback(() => {
    reset(masterToFormValues(masterRef.current));
    setFormError('');
  }, [reset]);

  const addSection = useCallback(() => {
    const nextIndex = sectionFields.fields.length;
    sectionFields.append(createEmptySection(nextIndex));
    return nextIndex;
  }, [sectionFields]);

  const addSectionFromQuickCreate = useCallback(
    ({ title, role }) => {
      const existing = getValues('sections') ?? [];
      const section = createSectionFromQuickCreate({ title, role }, existing);
      sectionFields.append(section);
      return existing.length;
    },
    [getValues, sectionFields],
  );

  const addQuestion = useCallback(
    (sectionIndex, sectionKey) => {
      const current = getValues(`sections.${sectionIndex}.questions`) ?? [];
      const next = createEmptyQuestion(sectionKey, current.length);
      setValue(`sections.${sectionIndex}.questions`, [...current, next], {
        shouldDirty: true,
      });
      return current.length;
    },
    [getValues, setValue],
  );

  const removeQuestion = useCallback(
    (sectionIndex, questionIndex) => {
      const current = getValues(`sections.${sectionIndex}.questions`) ?? [];
      setValue(
        `sections.${sectionIndex}.questions`,
        current.filter((_, index) => index !== questionIndex),
        { shouldDirty: true },
      );
    },
    [getValues, setValue],
  );

  const moveSection = useCallback(
    (from, to) => {
      if (to < 0 || to >= sectionFields.fields.length) return;
      sectionFields.move(from, to);
    },
    [sectionFields],
  );

  const moveQuestion = useCallback(
    (sectionIndex, from, to) => {
      const current = [...(getValues(`sections.${sectionIndex}.questions`) ?? [])];
      if (to < 0 || to >= current.length) return;
      const [item] = current.splice(from, 1);
      current.splice(to, 0, item);
      setValue(`sections.${sectionIndex}.questions`, current, { shouldDirty: true });
    },
    [getValues, setValue],
  );

  const addRatingOption = useCallback(() => {
    ratingFields.append(createEmptyRatingOption());
  }, [ratingFields]);

  return {
    control,
    register,
    handleSubmit: handleSubmit(onSubmit),
    isLoading,
    error,
    isUpdating,
    isDirty,
    formError,
    dismissFormError,
    snackbar,
    closeSnackbar: close,
    ratingFields,
    sectionFields,
    watchedSections,
    watchedRatingOptions,
    watchedValues,
    validation,
    stats,
    addSection,
    addSectionFromQuickCreate,
    addQuestion,
    removeQuestion,
    moveSection,
    moveQuestion,
    addRatingOption,
    discardChanges,
    getValues,
    setValue,
    watch,
  };
}
