import { Tab, Tabs } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { SettingsPageToolbar } from '@/shared/components/layout/SettingsPageToolbar';
import { CrudButton } from '@/shared/components/ui/CrudButton';

export function OrgStructureToolbar({
  activeTab,
  allowedTabs = [],
  onTabChange,
  onAdd,
  canWrite = false,
  addDisabled = false,
}) {
  const isDepartments = activeTab === 'departments';

  return (
    <SettingsPageToolbar
      title="Organization structure"
      subtitle="Manage departments and designations used across employee records and onboarding."
      primaryAction={
        canWrite ? (
          <CrudButton intent="create" startIcon={<AddIcon />} onClick={onAdd} disabled={addDisabled}>
            {isDepartments ? 'Add Department' : 'Add Designation'}
          </CrudButton>
        ) : null
      }
    >
      <Tabs
        value={activeTab}
        onChange={(_, value) => onTabChange(value)}
        sx={{ mt: 2, minHeight: 40 }}
        aria-label="Department and designation tabs"
      >
        {allowedTabs.map((tab) => (
          <Tab key={tab.key} label={tab.label} value={tab.key} sx={{ minHeight: 40 }} />
        ))}
      </Tabs>
    </SettingsPageToolbar>
  );
}
