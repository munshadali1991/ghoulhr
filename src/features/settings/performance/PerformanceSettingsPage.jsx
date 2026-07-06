import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Box, Skeleton } from '@mui/material';
import { FormStatusAlerts } from '@/shared/components/feedback/FormStatusAlerts';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { PageCard } from '@/shared/components/ui';
import { ConfirmDeleteDialog } from '@/features/settings/shared';
import { useSettingsSectionAccess } from '@/features/settings/hooks/useSettingsSectionAccess';
import { useRbacRoles } from '@/features/rbac/hooks/useRbacAdmin';
import { usePerformanceSettingsForm } from './hooks/usePerformanceSettingsForm';
import { PerformanceSettingsToolbar, PERFORMANCE_TABS } from './components/PerformanceSettingsToolbar';
import { PerformanceSaveBar } from './components/PerformanceSaveBar';
import { RatingScaleTab } from './components/rating/RatingScaleTab';
import { FormBuilderLayout } from './builder/FormBuilderLayout';
import { SectionRail } from './builder/SectionRail';
import { SectionCanvas } from './builder/SectionCanvas';
import { BuilderEmptyState } from './builder/BuilderEmptyState';
import { TemplateContextBanner } from './builder/TemplateContextBanner';
import { CreateSectionModal } from './builder/CreateSectionModal';
import { RatingScaleDrawer } from './builder/RatingScaleDrawer';
import { RolePreviewPanel } from './builder/RolePreviewPanel';
import { resolveActiveTab } from './performanceTabs';

/**
 * @param {{ organizationId: string }} props
 */
export function PerformanceSettingsPage({ organizationId }) {
  const form = usePerformanceSettingsForm(organizationId);
  const { data: rbacRoles = [] } = useRbacRoles();
  const { canWrite } = useSettingsSectionAccess('performance');
  const readOnly = !canWrite;

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = resolveActiveTab(searchParams.get('tab'));

  const [deleteSectionIndex, setDeleteSectionIndex] = useState(null);
  const [createSectionOpen, setCreateSectionOpen] = useState(false);
  const [ratingDrawerOpen, setRatingDrawerOpen] = useState(false);

  const selectedSectionId = searchParams.get('section');
  const selectedSectionIndex = useMemo(() => {
    if (!selectedSectionId) return form.watchedSections.length ? 0 : null;
    const idx = form.watchedSections.findIndex((s) => s.id === selectedSectionId);
    return idx >= 0 ? idx : form.watchedSections.length ? 0 : null;
  }, [form.watchedSections, selectedSectionId]);

  const setSelectedSection = useCallback(
    (index) => {
      const section = form.watchedSections[index];
      if (!section?.id) return;
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', PERFORMANCE_TABS.builder);
        next.set('section', section.id);
        return next;
      });
    },
    [form.watchedSections, setSearchParams],
  );

  useEffect(() => {
    if (activeTab !== PERFORMANCE_TABS.builder) return;
    if (!form.watchedSections.length) return;
    if (selectedSectionIndex == null) {
      setSelectedSection(0);
    }
  }, [activeTab, form.watchedSections.length, selectedSectionIndex, setSelectedSection]);

  const handleTabChange = useCallback(
    (tab) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', tab);
        if (tab !== PERFORMANCE_TABS.builder) {
          next.delete('section');
        }
        return next;
      });
    },
    [setSearchParams],
  );

  const openCreateSection = useCallback(() => {
    setCreateSectionOpen(true);
  }, []);

  const handleQuickCreateSection = useCallback(
    ({ title, role }) => {
      const newIndex = form.addSectionFromQuickCreate({ title, role });
      const section = form.getValues(`sections.${newIndex}`);
      if (section?.id) {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.set('tab', PERFORMANCE_TABS.builder);
          next.set('section', section.id);
          return next;
        });
      }
    },
    [form, setSearchParams],
  );

  const handleDeleteSection = useCallback(() => {
    if (deleteSectionIndex == null) return;
    form.sectionFields.remove(deleteSectionIndex);
    setDeleteSectionIndex(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('section');
      return next;
    });
  }, [deleteSectionIndex, form.sectionFields, setSearchParams]);

  const handleDiscard = useCallback(() => {
    form.discardChanges();
    setDeleteSectionIndex(null);
  }, [form]);

  const previewFormValues = useMemo(
    () => ({
      sections: form.watchedSections,
      ratingOptions: form.watchedRatingOptions,
    }),
    [form.watchedSections, form.watchedRatingOptions],
  );

  if (form.isLoading) {
    return (
      <Box data-testid="settings-performance-page">
        <Skeleton variant="text" width={320} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={48} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={360} />
      </Box>
    );
  }

  const ratingFormApi = {
    register: form.register,
    control: form.control,
    ratingFields: form.ratingFields,
  };

  return (
    <Box data-testid="settings-performance-page">
      <PerformanceSettingsToolbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        sectionCount={form.stats.sectionCount}
        questionCount={form.stats.questionCount}
        ratingCount={form.stats.ratingCount}
        showAddSection={activeTab === PERFORMANCE_TABS.builder && !readOnly}
        showAddRating={activeTab === PERFORMANCE_TABS.rating && !readOnly}
        onAddSection={openCreateSection}
        onAddRating={form.addRatingOption}
      />

      <TemplateContextBanner />

      <FormStatusAlerts
        loadError={form.error ? { message: form.error.message } : null}
        formError={form.formError ? { message: form.formError } : null}
        onDismissFormError={form.dismissFormError}
      />

      {activeTab === PERFORMANCE_TABS.rating ? (
        <RatingScaleTab
          ratingOptions={form.watchedRatingOptions}
          form={ratingFormApi}
          readOnly={readOnly}
        />
      ) : activeTab === PERFORMANCE_TABS.preview ? (
        <RolePreviewPanel formValues={previewFormValues} rbacRoles={rbacRoles} />
      ) : form.watchedSections.length === 0 ? (
        <BuilderEmptyState onAddSection={openCreateSection} readOnly={readOnly} />
      ) : (
        <FormBuilderLayout
          left={
            <SectionRail
              sections={form.watchedSections}
              selectedIndex={selectedSectionIndex}
              sectionStatuses={form.validation.sectionStatuses}
              onSelect={setSelectedSection}
              onAdd={openCreateSection}
              onMove={form.moveSection}
              onDelete={readOnly ? undefined : setDeleteSectionIndex}
              readOnly={readOnly}
            />
          }
          main={
            selectedSectionIndex != null ? (
              <PageCard sx={{ p: { xs: 2, sm: 3 } }}>
                <SectionCanvas
                  sectionIndex={selectedSectionIndex}
                  register={form.register}
                  control={form.control}
                  watch={form.watch}
                  setValue={form.setValue}
                  readOnly={readOnly}
                  fieldErrors={form.validation.fieldErrors}
                  ratingOptions={form.watchedRatingOptions}
                  onOpenRatingDrawer={() => setRatingDrawerOpen(true)}
                  onAddQuestion={() => {
                    const sectionKey = form.getValues(`sections.${selectedSectionIndex}.key`);
                    form.addQuestion(selectedSectionIndex, sectionKey);
                  }}
                  onMoveQuestion={(from, to) =>
                    form.moveQuestion(selectedSectionIndex, from, to)
                  }
                  onDeleteQuestion={(questionIndex) =>
                    form.removeQuestion(selectedSectionIndex, questionIndex)
                  }
                />
              </PageCard>
            ) : (
              <Alert severity="info">Select a section to edit.</Alert>
            )
          }
        />
      )}

      {!readOnly ? (
        <PerformanceSaveBar
          hasChanges={form.isDirty}
          isSaving={form.isUpdating}
          validationIssues={form.validation.issues}
          onDiscard={handleDiscard}
          onSave={() => {
            if (!form.validation.isValid) {
              form.dismissFormError();
              // Trigger submit path which shows all issues
              form.handleSubmit();
              return;
            }
            form.handleSubmit();
          }}
        />
      ) : null}

      <CreateSectionModal
        open={createSectionOpen}
        onClose={() => setCreateSectionOpen(false)}
        onSubmit={handleQuickCreateSection}
      />

      <RatingScaleDrawer
        open={ratingDrawerOpen}
        onClose={() => setRatingDrawerOpen(false)}
        ratingOptions={form.watchedRatingOptions}
        form={ratingFormApi}
        readOnly={readOnly}
        onAddRating={form.addRatingOption}
      />

      <ConfirmDeleteDialog
        open={deleteSectionIndex != null}
        title="Delete section?"
        message="This removes the section and all of its questions from the template."
        onCancel={() => setDeleteSectionIndex(null)}
        onConfirm={handleDeleteSection}
      />

      <AppSnackbar
        open={form.snackbar.open}
        message={form.snackbar.message}
        severity={form.snackbar.severity}
        onClose={form.closeSnackbar}
      />
    </Box>
  );
}
