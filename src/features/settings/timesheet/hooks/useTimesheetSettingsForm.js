import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTimesheetSettings } from './useTimesheetSettings';
import {
  DEFAULT_TIMESHEET_SETTINGS_FORM,
  TIMESHEET_SETTINGS_SUCCESS_MS,
} from '../constants';
import { timesheetSettingsSchema } from '../schemas';

/**
 * @param {string} organizationId
 */
export function useTimesheetSettingsForm(organizationId) {
  const { settings, isLoading, error, updateSettings, isUpdating } =
    useTimesheetSettings(organizationId);

  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');

  const form = useForm({
    resolver: zodResolver(timesheetSettingsSchema),
    defaultValues: DEFAULT_TIMESHEET_SETTINGS_FORM,
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        max_hours_per_day: settings.max_hours_per_day ?? 12,
        max_past_days: settings.max_past_days ?? 7,
        require_submission_by_eod: settings.require_submission_by_eod ?? true,
        employee_helper_text: settings.employee_helper_text ?? '',
        week_starts_on: settings.week_starts_on ?? 1,
      });
    }
  }, [settings, form]);

  const dismissFormError = useCallback(() => setFormError(''), []);

  const onSubmit = useCallback(
    async (formData) => {
      try {
        setSuccessMessage('');
        setFormError('');
        await updateSettings(formData);
        setSuccessMessage('Timesheet settings updated successfully!');
        setTimeout(() => setSuccessMessage(''), TIMESHEET_SETTINGS_SUCCESS_MS);
      } catch (err) {
        setFormError(err.message || 'Failed to update timesheet settings.');
      }
    },
    [updateSettings],
  );

  const handleReset = useCallback(() => {
    if (settings) {
      form.reset({
        max_hours_per_day: settings.max_hours_per_day ?? 12,
        max_past_days: settings.max_past_days ?? 7,
        require_submission_by_eod: settings.require_submission_by_eod ?? true,
        employee_helper_text: settings.employee_helper_text ?? '',
        week_starts_on: settings.week_starts_on ?? 1,
      });
    }
    setSuccessMessage('');
    setFormError('');
  }, [form, settings]);

  return {
    ...form,
    isLoading,
    error,
    isUpdating,
    successMessage,
    formError,
    dismissFormError,
    onSubmit: form.handleSubmit(onSubmit),
    handleReset,
  };
}
