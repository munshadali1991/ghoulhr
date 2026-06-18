import {
  Button,
  Chip,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

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
    <TableRow hover>
      <TableCell>
        <Typography variant="body2" fontWeight={600}>
          {employee.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {employee.employeeCode}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">{employee.departmentName || '—'}</Typography>
      </TableCell>
      <TableCell>
        {isLoading ? (
          <Skeleton variant="text" width={80} />
        ) : primary ? (
          <Typography variant="body2">{primary.role?.name ?? primary.roleId}</Typography>
        ) : (
          <Typography variant="caption" color="text.secondary">
            —
          </Typography>
        )}
      </TableCell>
      <TableCell>
        {isLoading ? (
          <Skeleton variant="rounded" width={120} height={24} />
        ) : assignments.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            No roles assigned
          </Typography>
        ) : (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {assignments.map((a) => (
              <Chip
                key={a.id ?? a.roleId}
                label={a.role?.name ?? a.roleId}
                size="small"
                color={a.isPrimary ? 'primary' : 'default'}
                variant={a.isPrimary ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>
        )}
      </TableCell>
      <TableCell align="right">
        <Button size="small" startIcon={<EditOutlinedIcon />} onClick={onEdit}>
          Edit
        </Button>
      </TableCell>
    </TableRow>
  );
}
