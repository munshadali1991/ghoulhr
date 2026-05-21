import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useLeaveConfigurations } from './useLeaveConfigurations';
import { useLocationConfigurations } from '@/features/settings/locations';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { LEAVE_WIZARD_LAST } from '../constants';
import {
  buildInitialLeaveRows,
  createEmptyLeaveRow,
  getSavedLocations,
  leavesFormToPayload,
  validateLeaveForm,
} from '../utils/leaveMappers';

const EMPTY_LEAVES = [];

/**
 * @param {string} organizationId
 */
export function useLeaveSettingsForm(organizationId) {
  const {
    leaves,
    isLoading: leavesLoading,
    error: leavesError,
    updateLeaves,
    isUpdating,
  } = useLeaveConfigurations(organizationId);
  const { locations, isLoading: locLoading, error: locError } = useLocationConfigurations(organizationId);

  const [formError, setFormError] = useState('');
  const { snackbar, show: showSnackbar, close: closeSnackbar } = useAppSnackbar();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [listView, setListView] = useState(true);
  const [wizardStep, setWizardStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const hasInitialized = useRef(false);
  const initialSnapshotRef = useRef(null);

  const isLoading = leavesLoading || locLoading;
  const error = leavesError || locError;
  const savedLocations = useMemo(() => getSavedLocations(locations), [locations]);

  const locationNameById = useMemo(() => {
    const m = new Map();
    savedLocations.forEach((l) => m.set(String(l.id), l.name));
    return m;
  }, [savedLocations]);

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    defaultValues: { leaves: [createEmptyLeaveRow('')] },
    shouldUnregister: false,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'leaves' });
  const watchedRaw = useWatch({ control, name: 'leaves' });
  const watchedLeaves = watchedRaw ?? EMPTY_LEAVES;

  useEffect(() => {
    hasInitialized.current = false;
  }, [organizationId]);

  useEffect(() => {
    if (listView) setWizardStep(0);
  }, [listView]);

  const displayIndices = useMemo(() => {
    const indices = Array.from({ length: fields.length }, (_, i) => i);
    return indices.sort((a, b) => {
      const la = locationNameById.get(watchedLeaves[a]?.locationId) || '\uFFFF';
      const lb = locationNameById.get(watchedLeaves[b]?.locationId) || '\uFFFF';
      if (la !== lb) return la.localeCompare(lb);
      return String(watchedLeaves[a]?.name || '').localeCompare(String(watchedLeaves[b]?.name || ''));
    });
  }, [fields.length, watchedLeaves, locationNameById]);

  const filteredDisplayIndices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return displayIndices;
    return displayIndices.filter((i) => {
      const r = watchedLeaves[i] || {};
      const location = (locationNameById.get(r.locationId) || '').toLowerCase();
      const name = String(r.name || '').toLowerCase();
      const code = String(r.code || '').toLowerCase();
      return name.includes(q) || code.includes(q) || location.includes(q);
    });
  }, [displayIndices, watchedLeaves, searchQuery, locationNameById]);

  useEffect(() => {
    if (selectedIndex >= fields.length) {
      setSelectedIndex(Math.max(0, fields.length - 1));
    }
  }, [fields.length, selectedIndex]);

  const leavesSyncKey = useMemo(
    () =>
      leaves
        .map((l) => `${l.id}:${l.locationId ?? l.location_id ?? ''}:${l.appliesTo ?? l.applies_to ?? ''}`)
        .join('|'),
    [leaves],
  );

  useEffect(() => {
    if (!organizationId || isLoading || hasInitialized.current) return;
    hasInitialized.current = true;

    const defaultLocId = String(savedLocations[0]?.id || '');
    const next = buildInitialLeaveRows(leaves, defaultLocId, savedLocations.length);
    reset({ leaves: next });
    initialSnapshotRef.current = JSON.parse(JSON.stringify(next));
    setSelectedIndex(0);
  }, [organizationId, isLoading, leavesSyncKey, savedLocations, reset, leaves]);

  const dismissFormError = useCallback(() => setFormError(''), []);

  const handleCancel = useCallback(() => {
    if (initialSnapshotRef.current) {
      reset({ leaves: JSON.parse(JSON.stringify(initialSnapshotRef.current)) });
    }
    setWizardStep(0);
  }, [reset]);

  const handleWizardNext = useCallback(async () => {
    if (wizardStep === 0) {
      const ok = await trigger(
        [`leaves.${selectedIndex}.name`, `leaves.${selectedIndex}.locationId`],
        { shouldFocus: true },
      );
      if (!ok) return;
    }
    setWizardStep((s) => Math.min(s + 1, LEAVE_WIZARD_LAST));
  }, [wizardStep, selectedIndex, trigger]);

  const handleWizardPrev = useCallback(() => {
    setWizardStep((s) => Math.max(0, s - 1));
  }, []);

  const startAddLeave = useCallback(() => {
    const newRow = createEmptyLeaveRow(savedLocations[0]?.id || '');
    const nextIdx = fields.length;
    append(newRow);
    setSelectedIndex(nextIdx);
    setListView(false);
    setWizardStep(0);
  }, [append, fields.length, savedLocations]);

  const openEditor = useCallback((fieldIndex) => {
    setSelectedIndex(fieldIndex);
    setWizardStep(0);
    setListView(false);
  }, []);

  const removeLeaveAt = useCallback(
    (fieldIndex) => {
      remove(fieldIndex);
      setSelectedIndex((cur) => {
        if (cur === fieldIndex) return Math.max(0, fieldIndex - 1);
        if (cur > fieldIndex) return cur - 1;
        return cur;
      });
    },
    [remove],
  );

  const onSubmit = useCallback(
    async (formData) => {
      try {
        setFormError('');
        closeSnackbar();

        const validation = validateLeaveForm(formData, savedLocations.length);
        if (validation) {
          setFormError(validation.message);
          if (validation.index != null) setSelectedIndex(validation.index);
          return;
        }

        const result = await updateLeaves(leavesFormToPayload(formData));
        const next = Array.isArray(result?.leaves) ? result.leaves : [];
        const defaultLocId = savedLocations[0]?.id || '';
        const nextList = buildInitialLeaveRows(next, defaultLocId, savedLocations.length);

        reset({ leaves: nextList });
        initialSnapshotRef.current = JSON.parse(JSON.stringify(nextList));
        showSnackbar('Leave configuration saved.', 'success');
        setListView(true);
      } catch (err) {
        setFormError(err.message || 'Failed to save leave policies.');
      }
    },
    [closeSnackbar, reset, savedLocations, showSnackbar, updateLeaves],
  );

  const selectedRow = watchedLeaves[selectedIndex] || {};

  return {
    isLoading,
    error,
    isUpdating,
    isDirty,
    formError,
    dismissFormError,
    snackbar,
    closeSnackbar,
    savedLocations,
    locationNameById,
    listView,
    setListView,
    searchQuery,
    setSearchQuery,
    policyCount: fields.length,
    fields,
    watchedLeaves,
    filteredDisplayIndices,
    selectedIndex,
    selectedRow,
    wizardStep,
    register,
    control,
    errors,
    handleSubmit,
    onSubmit,
    handleCancel,
    handleWizardNext,
    handleWizardPrev,
    startAddLeave,
    openEditor,
    removeLeaveAt,
  };
}
