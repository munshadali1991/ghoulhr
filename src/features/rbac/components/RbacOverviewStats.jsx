import { Chip, Stack } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import { Link } from 'react-router-dom';
import { RBAC_TABS, rbacPathForTab } from '@/features/rbac/rbacTabs';

/**
 * @param {{
 *   roles: import('@/features/rbac/types/rbac.types').RbacRole[],
 * }} props
 */
export function RbacOverviewStats({ roles }) {
  const totalRoles = roles.length;
  const customRoles = roles.filter((r) => !r.isSystem).length;
  const employeesAssigned = roles.reduce(
    (sum, r) => sum + (r.assignedEmployeeCount ?? 0),
    0,
  );

  return (
    <Stack direction="row" spacing={1} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
      <Chip label={`${totalRoles} roles`} size="small" variant="outlined" />
      <Chip label={`${customRoles} custom`} size="small" variant="outlined" />
      <Chip
        label={`${employeesAssigned} employee assignments`}
        size="small"
        variant="outlined"
      />
      <Chip
        icon={<HistoryIcon />}
        label="View audit trail"
        size="small"
        variant="outlined"
        component={Link}
        to={rbacPathForTab(RBAC_TABS.audit)}
        clickable
        sx={{ '& .MuiChip-icon': { fontSize: 16 } }}
      />
    </Stack>
  );
}
