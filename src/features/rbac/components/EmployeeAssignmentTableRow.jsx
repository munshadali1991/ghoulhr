import {
  Avatar,
  Box,
  Chip,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { MobileDataCard } from '@/shared/components/data/MobileDataCard';
import { TableRowActions } from '@/shared/components/data/TableRowActions';

function initials(name) {
  return String(name ?? '')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function RoleChips({ assignments, isLoading }) {
  if (isLoading) {
    return <Skeleton variant="rounded" width={120} height={24} />;
  }
  if (assignments.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        No roles assigned
      </Typography>
    );
  }
  return (
    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
      {assignments.map((a) => (
        <Chip
          key={a.id ?? a.roleId}
          label={a.role?.name ?? a.roleId}
          size="small"
          sx={{
            height: 22,
            typography: 'overline',
            fontWeight: 700,
            ...(a.isPrimary
              ? {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }
              : {
                  bgcolor: 'transparent',
                  border: 1,
                  borderColor: 'divider',
                  color: 'text.secondary',
                }),
          }}
        />
      ))}
    </Stack>
  );
}

function PersonCell({ name, code }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.25}>
      <Avatar
        sx={{
          width: 32,
          height: 32,
          typography: 'caption',
          fontWeight: 600,
          bgcolor: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(96, 165, 250, 0.16)'
              : 'rgba(59, 130, 246, 0.12)',
          color: 'secondary.main',
        }}
      >
        {initials(name)}
      </Avatar>
      <Box>
        <Typography variant="body2" fontWeight={600}>
          {name}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {code}
        </Typography>
      </Box>
    </Stack>
  );
}

/**
 * @param {{
 *   employee: { id: string, name: string, employeeCode?: string, departmentName?: string },
 *   assignments?: import('@/features/rbac/types/rbac.types').RbacEmployeeAssignment[],
 *   isLoading?: boolean,
 *   onEdit: () => void,
 * }} props
 */
export function EmployeeAssignmentCard({ employee, assignments = [], isLoading = false, onEdit }) {
  const primary = assignments.find((a) => a.isPrimary) ?? assignments[0];

  return (
    <MobileDataCard
      fields={[
        {
          label: 'Employee',
          value: <PersonCell name={employee.name} code={employee.employeeCode} />,
        },
        { label: 'Department', value: employee.departmentName || '—' },
        {
          label: 'Primary role',
          value: isLoading ? (
            <Skeleton variant="text" width={80} />
          ) : primary ? (
            primary.role?.name ?? primary.roleId
          ) : (
            '—'
          ),
        },
        { label: 'All roles', value: <RoleChips assignments={assignments} isLoading={isLoading} /> },
      ]}
      actions={<TableRowActions onEdit={onEdit} />}
    />
  );
}

/**
 * @param {{
 *   employee: { id: string, name: string, employeeCode?: string, departmentName?: string },
 *   assignments?: import('@/features/rbac/types/rbac.types').RbacEmployeeAssignment[],
 *   isLoading?: boolean,
 *   onEdit: () => void,
 * }} props
 */
export function EmployeeAssignmentTableRow({
  employee,
  assignments = [],
  isLoading = false,
  onEdit,
}) {
  const primary = assignments.find((a) => a.isPrimary) ?? assignments[0];

  return (
    <TableRow
      hover
      sx={{
        '&:last-child td': { borderBottom: 0 },
        '& td': { borderColor: 'divider', py: 1.75 },
      }}
    >
      <TableCell>
        <PersonCell name={employee.name} code={employee.employeeCode} />
      </TableCell>
      <TableCell>
        <Typography variant="body2">{employee.departmentName || '—'}</Typography>
      </TableCell>
      <TableCell>
        {isLoading ? (
          <Skeleton variant="text" width={80} />
        ) : primary ? (
          <Typography variant="body2" fontWeight={500}>
            {primary.role?.name ?? primary.roleId}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary">
            —
          </Typography>
        )}
      </TableCell>
      <TableCell>
        {isLoading ? (
          <Skeleton variant="rounded" width={120} height={24} />
        ) : (
          <RoleChips assignments={assignments} isLoading={false} />
        )}
      </TableCell>
      <TableCell align="right" className="table-actions-cell">
        <TableRowActions onEdit={onEdit} />
      </TableCell>
    </TableRow>
  );
}
