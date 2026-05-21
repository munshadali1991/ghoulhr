import { useState } from 'react';
import { Alert, Box, Skeleton } from '@mui/material';
import { FormStatusAlerts } from '@/shared/components/feedback/FormStatusAlerts';
import { PageCard } from '@/shared/components/ui/PageCard';
import { useOrgStructure } from './hooks/useOrgStructure';
import { OrgStructureToolbar } from './OrgStructureToolbar';
import { ORG_STRUCTURE_TABS } from './orgStructureTabs';
import { DepartmentTab } from './departments/DepartmentTab';
import { DepartmentFormPage } from './departments/DepartmentFormPage';
import { DesignationTab } from './designations/DesignationTab';
import { DesignationFormPage } from './designations/DesignationFormPage';

export function OrgStructurePage({ organizationId }) {
  const [activeTab, setActiveTab] = useState(ORG_STRUCTURE_TABS.departments);
  const [formView, setFormView] = useState(null);

  const {
    departments,
    designations,
    isLoading,
    isSaving,
    error,
    actionError,
    clearActionError,
    saveDepartment,
    deleteDepartment,
    saveDesignation,
    deleteDesignation,
  } = useOrgStructure(organizationId);

  const closeForm = () => {
    clearActionError();
    setFormView(null);
  };

  const handleTabChange = (tab) => {
    closeForm();
    setActiveTab(tab);
  };

  const handleAdd = () => {
    clearActionError();
    if (activeTab === ORG_STRUCTURE_TABS.departments) {
      setFormView({ type: 'department', record: null });
      return;
    }
    setFormView({ type: 'designation', record: null });
  };

  const openDepartmentEdit = (record) => {
    clearActionError();
    setFormView({ type: 'department', record });
  };

  const openDesignationEdit = (record) => {
    clearActionError();
    setFormView({ type: 'designation', record });
  };

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Skeleton variant="text" width={280} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={320} />
      </Box>
    );
  }

  if (formView?.type === 'department') {
    return (
      <Box sx={{ width: '100%' }}>
        <FormStatusAlerts
          loadError={error}
          loadErrorMessage="Failed to load organization structure. Please try again."
        />
        <DepartmentFormPage
          record={formView.record}
          isSaving={isSaving}
          actionError={actionError}
          onClearActionError={clearActionError}
          onBack={closeForm}
          onSave={saveDepartment}
        />
      </Box>
    );
  }

  if (formView?.type === 'designation') {
    return (
      <Box sx={{ width: '100%' }}>
        <FormStatusAlerts
          loadError={error}
          loadErrorMessage="Failed to load organization structure. Please try again."
        />
        <DesignationFormPage
          record={formView.record}
          departments={departments}
          isSaving={isSaving}
          actionError={actionError}
          onClearActionError={clearActionError}
          onBack={closeForm}
          onSave={saveDesignation}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
      <FormStatusAlerts
        loadError={error}
        loadErrorMessage="Failed to load organization structure. Please try again."
      />

      <OrgStructureToolbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onAdd={handleAdd}
        addDisabled={
          activeTab === ORG_STRUCTURE_TABS.designations && departments.length === 0
        }
      />

      <PageCard>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {activeTab === ORG_STRUCTURE_TABS.departments ? (
            <DepartmentTab
              departments={departments}
              isLoading={isLoading}
              isSaving={isSaving}
              actionError={actionError}
              onClearActionError={clearActionError}
              onEdit={openDepartmentEdit}
              onDelete={deleteDepartment}
            />
          ) : (
            <DesignationTab
              departments={departments}
              designations={designations}
              isLoading={isLoading}
              isSaving={isSaving}
              actionError={actionError}
              onClearActionError={clearActionError}
              onEdit={openDesignationEdit}
              onDelete={deleteDesignation}
            />
          )}
        </Box>
      </PageCard>

      {isSaving ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Saving changes…
        </Alert>
      ) : null}
    </Box>
  );
}
