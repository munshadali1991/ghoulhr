import { Tab, Tabs } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { SettingsPageToolbar } from '@/shared/components/layout/SettingsPageToolbar';
import { CrudButton } from '@/shared/components/ui/CrudButton';
import { TIMESHEET_TABS } from '../timesheetTabs';

/**
 * @param {{
 *   activeTab: string,
 *   onTabChange: (tab: string) => void,
 *   onAddCategory?: () => void,
 *   showAddCategory?: boolean,
 * }} props
 */
export function TimesheetSettingsToolbar({
  activeTab,
  tabs = [],
  onTabChange,
  onAddCategory,
  showAddCategory = false,
}) {
  return (
    <SettingsPageToolbar
      title="Timesheet settings"
      subtitle="Configure daily hour limits, submission windows, employee guidance, and categories."
      primaryAction={
        showAddCategory ? (
          <CrudButton intent="create" color="primary" startIcon={<AddIcon />} onClick={onAddCategory}>
            Add category
          </CrudButton>
        ) : null
      }
    >
      <Tabs
        value={activeTab}
        onChange={(_, value) => onTabChange(value)}
        sx={{ mt: 2, minHeight: 40 }}
        aria-label="Timesheet settings tabs"
      >
        {(tabs.length
          ? tabs
          : [
              { key: TIMESHEET_TABS.general, label: 'General' },
              { key: TIMESHEET_TABS.category, label: 'Category' },
            ]
        ).map((tab) => (
          <Tab key={tab.key} label={tab.label} value={tab.key} sx={{ minHeight: 40 }} />
        ))}
      </Tabs>
    </SettingsPageToolbar>
  );
}
