import { useEffect, useState } from 'react';
import { Alert, Box, Skeleton } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';
import { RolesPanel } from '@/features/rbac/components/RolesPanel';
import { EmployeeRoleAssignmentsPanel } from '@/features/rbac/components/EmployeeRoleAssignmentsPanel';
import { AuditLogPanel } from '@/features/rbac/components/AuditLogPanel';
import { RbacSettingsToolbar } from '@/features/rbac/components/RbacSettingsToolbar';
import { RbacOverviewStats } from '@/features/rbac/components/RbacOverviewStats';
import { DraftStatusBar } from '@/features/settings/shell/components/DraftStatusBar';
import { PageCard } from '@/shared/components/ui/PageCard';
import { SETTINGS_PAGE_WIDE_MAX_WIDTH } from '@/shared/components/settings/settingsLayout';
import { useRbacRoles } from '@/features/rbac/hooks/useRbacAdmin';
import {
  RBAC_BASE_PATH,
  RBAC_ROLES_PATH,
  RBAC_TABS,
  rbacPathForTab,
  rbacTabFromPath,
} from '@/features/rbac/rbacTabs';

function RbacPageSkeleton() {
  return (
    <Box>
      <Skeleton variant="text" width={280} height={40} sx={{ mb: 1 }} />
      <Skeleton variant="text" width={400} height={24} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" height={40} width={360} sx={{ mb: 3 }} />
      <Skeleton variant="rounded" height={480} />
    </Box>
  );
}

function RbacTabPanel({ activeTab, createOpen, onCreateOpenChange, onDraftStateChange }) {
  switch (activeTab) {
    case RBAC_TABS.employees:
      return <EmployeeRoleAssignmentsPanel />;
    case RBAC_TABS.audit:
      return <AuditLogPanel />;
    default:
      return (
        <RolesPanel
          createOpen={createOpen}
          onCreateOpenChange={onCreateOpenChange}
          onDraftStateChange={onDraftStateChange}
        />
      );
  }
}

/**
 * Org admin — enterprise roles & permissions management.
 */
export function RbacSettingsPage() {
  const { can } = useAuthorization();
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = rbacTabFromPath(location.pathname);
  const { data: roles = [], isLoading: rolesLoading } = useRbacRoles();
  const canManage = can('rbac:manage');

  const [createOpen, setCreateOpen] = useState(false);
  const [draftState, setDraftState] = useState(null);

  useEffect(() => {
    if (activeTab !== RBAC_TABS.roles) {
      setDraftState(null);
    }
  }, [activeTab]);

  useEffect(() => {
    if (
      location.pathname === RBAC_BASE_PATH ||
      location.pathname === `${RBAC_BASE_PATH}/`
    ) {
      navigate(RBAC_ROLES_PATH, { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleTabChange = (tab) => {
    navigate(rbacPathForTab(tab));
  };

  if (!can('rbac:read')) {
    return (
      <Alert severity="warning">
        You do not have permission to view roles and permissions.
      </Alert>
    );
  }

  const showDraftBar = activeTab === RBAC_TABS.roles && draftState?.hasChanges;

  if (rolesLoading && activeTab === RBAC_TABS.roles) {
    return <RbacPageSkeleton />;
  }

  return (
    <Box sx={{ pb: showDraftBar ? 8 : 0 }} data-testid="settings-rbac-page">
      <RbacSettingsToolbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        canManage={canManage}
        onCreateRole={() => setCreateOpen(true)}
      />

      <RbacOverviewStats roles={roles} />

      <PageCard>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <RbacTabPanel
            key={activeTab}
            activeTab={activeTab}
            createOpen={createOpen}
            onCreateOpenChange={setCreateOpen}
            onDraftStateChange={setDraftState}
          />
        </Box>
      </PageCard>

      {showDraftBar && draftState && (
        <DraftStatusBar
          hasChanges={draftState.hasChanges}
          isPublishing={draftState.isSaving}
          onPublish={draftState.onSave}
          onDiscard={draftState.onDiscard}
          changeCount={draftState.changeCount}
          maxWidth={SETTINGS_PAGE_WIDE_MAX_WIDTH}
          publishLabel="Save permissions"
          publishingLabel="Saving..."
          statusText="You have unsaved permission changes"
        />
      )}
    </Box>
  );
}
