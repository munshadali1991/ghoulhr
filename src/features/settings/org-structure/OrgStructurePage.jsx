import { useEffect, useState } from 'react';
import { Alert, Box, Skeleton } from '@mui/material';
import { FormStatusAlerts } from '@/shared/components/feedback/FormStatusAlerts';
import { PageCard } from '@/shared/components/ui/PageCard';
import { useTabAccess } from '@/features/auth/hooks/useAuthorization';
import { ORG_STRUCTURE_TAB_DEFS } from './orgStructureTabs';
import { useOrgStructure } from './hooks/useOrgStructure';
import { OrgStructureToolbar } from './OrgStructureToolbar';
import { DepartmentTab } from './departments/DepartmentTab';
import { DepartmentFormPage } from './departments/DepartmentFormPage';
import { DesignationTab } from './designations/DesignationTab';
import { DesignationFormPage } from './designations/DesignationFormPage';

export function OrgStructurePage({ organizationId }) {
  const { allowedTabs, firstAllowedKey, canWriteTab, isTabAllowed } =
    useTabAccess(ORG_STRUCTURE_TAB_DEFS);
  const [activeTab, setActiveTab] = useState(firstAllowedKey ?? 'departments');
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

  useEffect(() => {
    if (!isTabAllowed(activeTab) && firstAllowedKey) {
      setActiveTab(firstAllowedKey);
    }
  }, [activeTab, firstAllowedKey, isTabAllowed]);

  const activeTabDef = allowedTabs.find((t) => t.key === activeTab) ?? allowedTabs[0];
  const canWriteActive = activeTabDef ? canWriteTab(activeTabDef) : false;

  const closeForm = () => {
    clearActionError();
    setFormView(null);
  };

  const handleTabChange = (tab) => {
    closeForm();
    setActiveTab(tab);
  };

  const handleAdd = () => {
    if (!canWriteActive) return;
    clearActionError();
    if (activeTab === 'departments') {
      setFormView({ type: 'department', record: null });
      return;
    }
    setFormView({ type: 'designation', record: null });
  };

  const openDepartmentEdit = (record) => {
    if (!canWriteTab(ORG_STRUCTURE_TAB_DEFS[0])) return;
    clearActionError();
    setFormView({ type: 'department', record });
  };

  const openDesignationEdit = (record) => {
    if (!canWriteTab(ORG_STRUCTURE_TAB_DEFS[1])) return;
    clearActionError();
    setFormView({ type: 'designation', record });
  };

  if (!allowedTabs.length) {
    return (
      <Alert severity="warning">
        You do not have permission to view departments or designations.
      </Alert>
    );
  }

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
          readOnly={!canWriteTab(ORG_STRUCTURE_TAB_DEFS[0])}
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
          readOnly={!canWriteTab(ORG_STRUCTURE_TAB_DEFS[1])}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }} data-testid="settings-departments-page">
      <FormStatusAlerts
        loadError={error}
        loadErrorMessage="Failed to load organization structure. Please try again."
      />

      <OrgStructureToolbar
        activeTab={activeTab}
        allowedTabs={allowedTabs}
        onTabChange={handleTabChange}
        onAdd={handleAdd}
        canWrite={canWriteActive}
        addDisabled={
          activeTab === 'designations' && departments.length === 0
        }
      />

      <PageCard>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {activeTab === 'departments' ? (
            <DepartmentTab
              departments={departments}
              isLoading={isLoading}
              isSaving={isSaving}
              actionError={actionError}
              onClearActionError={clearActionError}
              onEdit={openDepartmentEdit}
              onDelete={deleteDepartment}
              readOnly={!canWriteTab(ORG_STRUCTURE_TAB_DEFS[0])}
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
              readOnly={!canWriteTab(ORG_STRUCTURE_TAB_DEFS[1])}
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
