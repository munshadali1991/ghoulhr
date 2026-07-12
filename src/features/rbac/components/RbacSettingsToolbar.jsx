import { Tab, Tabs } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { SettingsPageToolbar } from '@/shared/components/layout/SettingsPageToolbar';
import { CrudButton } from '@/shared/components/ui/CrudButton';
import { RBAC_TABS } from '@/features/rbac/rbacTabs';

const TAB_ITEMS = [
  { value: RBAC_TABS.roles, label: 'Role catalog' },
  { value: RBAC_TABS.employees, label: 'Employee access' },
  { value: RBAC_TABS.audit, label: 'Audit trail' },
];

/**
 * @param {{
 *   activeTab: string,
 *   onTabChange: (tab: string) => void,
 *   canManage?: boolean,
 *   onCreateRole?: () => void,
 * }} props
 */
export function RbacSettingsToolbar({
  activeTab,
  onTabChange,
  canManage = false,
  onCreateRole,
}) {
  const showCreateRole = activeTab === RBAC_TABS.roles && canManage;

  const handleTabChange = (_, tab) => {
    if (tab !== activeTab) {
      onTabChange(tab);
    }
  };

  return (
    <SettingsPageToolbar
      title="Roles & permissions"
      subtitle="Configure who can do what within modules enabled for your organization."
      primaryAction={
        showCreateRole ? (
          <CrudButton intent="create" startIcon={<AddIcon />} onClick={onCreateRole}>
            Create role
          </CrudButton>
        ) : null
      }
      sx={{ mb: 0 }}
    >
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{
          mt: 2,
          minHeight: 40,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTabs-indicator': {
            height: 2,
            bgcolor: 'warning.main',
          },
        }}
        aria-label="RBAC settings tabs"
      >
        {TAB_ITEMS.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            value={tab.value}
            sx={{
              minHeight: 40,
              mr: 2.5,
              px: 0.75,
              fontSize: 13.5,
              fontWeight: 600,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              color: 'text.disabled',
              '&.Mui-selected': {
                color: 'text.primary',
              },
            }}
          />
        ))}
      </Tabs>
    </SettingsPageToolbar>
  );
}
