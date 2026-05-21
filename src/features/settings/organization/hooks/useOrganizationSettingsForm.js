import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSettings } from './useSettings';
import {
  DEFAULT_ORG_PROFILE_FORM,
  hasOrgProfileDraftChanges,
  orgProfileToFormValues,
} from '@/features/settings/shell/organizationSettings';

const SUCCESS_MESSAGE_DURATION_MS = 3000;

/**
 * Organization profile tab: form state, logo preview, draft detection, publish/discard.
 * @param {string} organizationId
 */
export function useOrganizationSettingsForm(organizationId) {
  const { settings: orgSettings, isLoading, updateSettings } = useSettings(organizationId);

  const [successMessage, setSuccessMessage] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  const {
    register,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({ defaultValues: DEFAULT_ORG_PROFILE_FORM });

  const formValues = watch();
  const hasChanges = hasOrgProfileDraftChanges(formValues, orgSettings, logoPreview);

  useEffect(() => {
    const values = orgProfileToFormValues(orgSettings);
    if (!values) return;

    reset(values);
    setLogoPreview(orgSettings.logo || null);
  }, [orgSettings, reset]);

  const handleLogoUpload = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setLogoPreview(base64String);
        setValue('logo', base64String);
      };
      reader.readAsDataURL(file);
    },
    [setValue]
  );

  const handlePublish = useCallback(async () => {
    if (!hasChanges) return;

    try {
      setIsPublishing(true);
      setSuccessMessage('');
      await updateSettings(formValues);
      setSuccessMessage('All changes published successfully!');
      setTimeout(() => setSuccessMessage(''), SUCCESS_MESSAGE_DURATION_MS);
    } catch (err) {
      console.error('Failed to publish changes:', err);
    } finally {
      setIsPublishing(false);
    }
  }, [hasChanges, formValues, updateSettings]);

  const handleDiscard = useCallback(() => {
    const values = orgProfileToFormValues(orgSettings);
    if (!values) return;

    reset(values);
    setLogoPreview(orgSettings.logo || null);
  }, [orgSettings, reset]);

  return {
    orgSettings,
    isLoading,
    successMessage,
    isPublishing,
    hasChanges,
    changeCount: hasChanges ? 1 : 0,
    logoPreview,
    register,
    errors,
    handleLogoUpload,
    handlePublish,
    handleDiscard,
  };
}
