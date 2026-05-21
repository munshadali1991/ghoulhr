import { useCallback, useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useLocationConfigurations } from './useLocationConfigurations';
import { LOCATIONS_SUCCESS_MESSAGE_MS } from '../constants';
import {
  createEmptyLocationRow,
  locationsApiToFormRows,
  locationsFormToPayload,
  validateLocationsForm,
} from '../utils/locationMappers';

/**
 * @param {string} organizationId
 */
export function useLocationsSettingsForm(organizationId) {
  const { locations, isLoading, error, updateLocations, isUpdating } =
    useLocationConfigurations(organizationId);

  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isAddIntent, setIsAddIntent] = useState(false);
  const hasInitialized = useRef(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
  } = useForm({ defaultValues: { locations: [] } });

  const { fields, append, remove } = useFieldArray({ control, name: 'locations' });
  const watchedLocations = useWatch({ control, name: 'locations' });

  useEffect(() => {
    hasInitialized.current = false;
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId || isLoading || hasInitialized.current) return;
    hasInitialized.current = true;
    reset({ locations: locationsApiToFormRows(locations) });
  }, [organizationId, isLoading, locations, reset]);

  const openAddDialog = useCallback(() => {
    const idx = fields.length;
    append(createEmptyLocationRow(idx));
    setIsAddIntent(true);
    setEditingIndex(idx);
    setDialogOpen(true);
  }, [append, fields.length]);

  const openEditDialog = useCallback((index) => {
    setIsAddIntent(false);
    setEditingIndex(index);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingIndex(null);
    setIsAddIntent(false);
  }, []);

  const dismissFormError = useCallback(() => setFormError(''), []);

  const onSubmit = useCallback(
    async (formData) => {
      try {
        setFormError('');
        setSuccessMessage('');

        const validationError = validateLocationsForm(formData);
        if (validationError) {
          setFormError(validationError);
          return;
        }

        const result = await updateLocations(locationsFormToPayload(formData));
        const nextList = locationsApiToFormRows(
          Array.isArray(result?.locations) && result.locations.length > 0 ? result.locations : [],
        );
        reset({ locations: nextList });
        setSuccessMessage('Locations saved successfully.');
        setTimeout(() => setSuccessMessage(''), LOCATIONS_SUCCESS_MESSAGE_MS);
      } catch (err) {
        setFormError(err.message || 'Failed to save locations.');
      }
    },
    [reset, updateLocations],
  );

  return {
    isLoading,
    error,
    isUpdating,
    isDirty,
    successMessage,
    formError,
    dismissFormError,
    fields,
    watchedLocations,
    locationCount: fields.length,
    register,
    control,
    errors,
    handleSubmit,
    onSubmit,
    remove,
    dialogOpen,
    editingIndex,
    isAddIntent,
    openAddDialog,
    openEditDialog,
    closeDialog,
  };
}
