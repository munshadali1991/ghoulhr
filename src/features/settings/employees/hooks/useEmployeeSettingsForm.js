import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useEmployeeSettings } from './useEmployeeSettings';
import { DEFAULT_EMPLOYEE_SETTINGS_FORM, EMPLOYEE_SETTINGS_SUCCESS_MS } from '../constants';
import {
  buildEmployeeSettingsPayload,
  employeeSettingsToFormValues,
} from '../utils/employeeSettingsMappers';

/**
 * @param {string} organizationId
 */
export function useEmployeeSettingsForm(organizationId) {
  const { settings, isLoading, error, updateSettings, isUpdating } =
    useEmployeeSettings(organizationId);

  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    control,
  } = useForm({ defaultValues: DEFAULT_EMPLOYEE_SETTINGS_FORM });

  useEffect(() => {
    const values = employeeSettingsToFormValues(settings);
    if (values) reset(values);
  }, [settings, reset]);

  const dismissFormError = useCallback(() => setFormError(''), []);

  const onSubmit = useCallback(
    async (formData) => {
      try {
        setSuccessMessage('');
        setFormError('');
        await updateSettings(buildEmployeeSettingsPayload(settings, formData));
        setSuccessMessage('Employee settings updated successfully!');
        setTimeout(() => setSuccessMessage(''), EMPLOYEE_SETTINGS_SUCCESS_MS);
      } catch (err) {
        setFormError(err.message || 'Failed to update employee settings. Please try again.');
      }
    },
    [settings, updateSettings],
  );

  const handleReset = useCallback(() => {
    const values = employeeSettingsToFormValues(settings);
    if (values) reset(values);
    setSuccessMessage('');
    setFormError('');
  }, [reset, settings]);

  return {
    isLoading,
    error,
    isUpdating,
    isDirty,
    successMessage,
    formError,
    dismissFormError,
    register,
    control,
    errors,
    handleSubmit,
    onSubmit,
    handleReset,
  };
}
