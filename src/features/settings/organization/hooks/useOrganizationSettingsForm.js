import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { fetchStoragePreviewUrl, uploadStorageFile } from '@/shared/api/storageApi';
import { useSettings } from './useSettings';
import {
  DEFAULT_ORG_PROFILE_FORM,
  hasOrgProfileDraftChanges,
  orgProfileToFormValues,
} from '@/features/settings/shell/organizationSettings';

const SUCCESS_MESSAGE_DURATION_MS = 3000;

function isS3LogoValue(value) {
  if (typeof value === 'string' && value.startsWith('organizations/')) return true;
  return Boolean(value && typeof value === 'object' && value.storageKey);
}

function extractLogoStorageKey(value) {
  if (typeof value === 'string' && value.startsWith('organizations/')) return value;
  if (value && typeof value === 'object' && value.storageKey) return value.storageKey;
  return null;
}

async function resolveLogoPreview(logoValue) {
  if (!logoValue) return null;
  if (typeof logoValue === 'string' && (logoValue.startsWith('data:') || logoValue.startsWith('http'))) {
    return logoValue;
  }
  const storageKey = extractLogoStorageKey(logoValue);
  if (!storageKey) return null;
  const mimeType =
    typeof logoValue === 'object' && logoValue.mimeType ? logoValue.mimeType : 'image/png';
  try {
    const { url } = await fetchStoragePreviewUrl(storageKey, mimeType);
    return url;
  } catch {
    return null;
  }
}

/**
 * Organization profile tab: form state, logo preview, draft detection, save/discard.
 * @param {string} organizationId
 */
export function useOrganizationSettingsForm(organizationId) {
  const { settings: orgSettings, isLoading, updateSettings } = useSettings(organizationId);

  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const {
    register,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({ defaultValues: DEFAULT_ORG_PROFILE_FORM });

  const formValues = watch();
  const hasChanges = hasOrgProfileDraftChanges(formValues, orgSettings, logoPreview);

  useEffect(() => {
    const values = orgProfileToFormValues(orgSettings);
    reset(values);
    let cancelled = false;
    resolveLogoPreview(orgSettings?.logo).then((preview) => {
      if (!cancelled) setLogoPreview(preview);
    });
    return () => {
      cancelled = true;
    };
  }, [orgSettings, reset]);

  const handleLogoUpload = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        setFormError('Logo must be 2 MB or smaller.');
        event.target.value = '';
        return;
      }

      try {
        setLogoUploading(true);
        setFormError('');
        const result = await uploadStorageFile({
          file,
          category: 'organization-files',
          module: 'branding',
          documentType: 'logo',
        });
        const logoValue = {
          storageKey: result.storageKey,
          mimeType: result.mimeType,
        };
        setValue('logo', logoValue, { shouldDirty: true });
        setLogoPreview(result.previewUrl || null);
      } catch (err) {
        setFormError(err?.message || 'Failed to upload logo.');
      } finally {
        setLogoUploading(false);
        event.target.value = '';
      }
    },
    [setValue],
  );

  const dismissFormError = useCallback(() => {
    setFormError('');
  }, []);

  const handlePublish = useCallback(async () => {
    if (!hasChanges) return;

    try {
      setIsPublishing(true);
      setSuccessMessage('');
      setFormError('');
      await updateSettings(formValues);
      setSuccessMessage('Changes saved successfully.');
      setTimeout(() => setSuccessMessage(''), SUCCESS_MESSAGE_DURATION_MS);
    } catch (err) {
      setFormError(err?.message || 'Failed to save organization settings. Please try again.');
      console.error('Failed to save organization settings:', err);
    } finally {
      setIsPublishing(false);
    }
  }, [hasChanges, formValues, updateSettings]);

  const handleDiscard = useCallback(() => {
    const values = orgProfileToFormValues(orgSettings);
    reset(values);
    resolveLogoPreview(orgSettings?.logo).then(setLogoPreview);
    setFormError('');
  }, [orgSettings, reset]);

  return {
    orgSettings,
    isLoading,
    successMessage,
    formError,
    dismissFormError,
    isPublishing,
    hasChanges,
    changeCount: hasChanges ? 1 : 0,
    logoPreview,
    logoUploading,
    register,
    control,
    errors,
    formValues,
    handleLogoUpload,
    handlePublish,
    handleDiscard,
    isS3Logo: isS3LogoValue(formValues.logo),
  };
}
