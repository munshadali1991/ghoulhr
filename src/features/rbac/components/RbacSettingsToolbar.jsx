import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { RBAC_TABS, rbacPathForTab } from '@/features/rbac/rbacTabs';

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'flex-start' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 2,
      }}
    >
      <Box>
        <Typography variant="h5" component="h1" fontWeight={700} letterSpacing="-0.02em">
          Roles & Permissions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 560 }}>
          Configure who can do what within modules enabled for your organization.
        </Typography>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          allowScrollButtonsMobile
          sx={{ mt: 2, minHeight: 40 }}
          aria-label="RBAC settings tabs"
        >
          {TAB_ITEMS.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} sx={{ minHeight: 40 }} />
          ))}
        </Tabs>
      </Box>

      {showCreateRole && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateRole}
          sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, flexShrink: 0 }}
        >
          Create role
        </Button>
      )}
    </Box>
  );
}
