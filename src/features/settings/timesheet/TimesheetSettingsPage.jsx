import { useState } from 'react';
import { Alert, Box, Skeleton } from '@mui/material';
import { FormStatusAlerts } from '@/shared/components/feedback/FormStatusAlerts';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { useTimesheetSettingsForm } from './hooks/useTimesheetSettingsForm';
import { useTimesheetCategories } from './hooks/useTimesheetCategories';
import { TimesheetSettingsToolbar } from './components/TimesheetSettingsToolbar';
import { TIMESHEET_TABS } from './timesheetTabs';
import { GeneralSettingsTab } from './GeneralSettingsTab';
import { CategoryTab } from './category/CategoryTab';
import { CategoryFormPage } from './category/CategoryFormPage';

/**
 * @param {{ organizationId: string }} props
 */
export function TimesheetSettingsPage({ organizationId }) {
  const [activeTab, setActiveTab] = useState(TIMESHEET_TABS.general);
  const [categoryFormView, setCategoryFormView] = useState(null);
  const form = useTimesheetSettingsForm(organizationId);
  const categories = useTimesheetCategories(organizationId);
  const { snackbar, show, close } = useAppSnackbar();

  const closeCategoryForm = () => {
    categories.clearActionError();
    setCategoryFormView(null);
  };

  const handleTabChange = (tab) => {
    closeCategoryForm();
    setActiveTab(tab);
  };

  if (form.isLoading && activeTab === TIMESHEET_TABS.general && !categoryFormView) {
    return (
      <Box>
        <Skeleton variant="text" width={280} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={320} />
      </Box>
    );
  }

  if (categoryFormView !== null) {
    return (
      <Box>
        <CategoryFormPage
          record={categoryFormView?.id ? categoryFormView : null}
          isSaving={categories.isSaving}
          actionError={categories.actionError}
          onClearActionError={categories.clearActionError}
          onBack={closeCategoryForm}
          onSave={async (values, id) => {
            await categories.saveCategory(values, id);
            show(id ? 'Category updated' : 'Category created');
          }}
        />
        <AppSnackbar snackbar={snackbar} onClose={close} />
      </Box>
    );
  }

  return (
    <Box>
      <TimesheetSettingsToolbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showAddCategory={activeTab === TIMESHEET_TABS.category}
        onAddCategory={() => {
          categories.clearActionError();
          setCategoryFormView({});
        }}
      />

      {activeTab === TIMESHEET_TABS.general ? (
        <>
          <FormStatusAlerts
            loadError={form.error}
            loadErrorMessage="Failed to load timesheet settings."
            formError={form.formError}
            onDismissFormError={form.dismissFormError}
            successMessage={form.successMessage}
          />
          <GeneralSettingsTab form={form} />
        </>
      ) : (
        <>
          {categories.error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {categories.error.message || 'Failed to load categories.'}
            </Alert>
          ) : null}
          <CategoryTab
            categories={categories.categories}
            isLoading={categories.isLoading}
            isSaving={categories.isSaving}
            actionError={categories.actionError}
            onClearActionError={categories.clearActionError}
            onEdit={(row) => {
              categories.clearActionError();
              setCategoryFormView(row);
            }}
            onDelete={categories.removeCategory}
          />
        </>
      )}

      <AppSnackbar snackbar={snackbar} onClose={close} />
    </Box>
  );
}
