import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from '@tanstack/react-query';
import { listEmployees } from '@/features/employees/api/employeesApi';
import { getEmployeeRoles } from '@/features/rbac/api/rbacApi';
import { useRbacRoles } from '@/features/rbac/hooks/useRbacAdmin';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';
import { EmployeeRoleDialog } from '@/features/rbac/components/EmployeeRoleDialog';
import { EmployeeAssignmentTableRow } from '@/features/rbac/components/EmployeeAssignmentTableRow';

const DEFAULT_ROWS_PER_PAGE = 20;
const ROWS_PER_PAGE_OPTIONS = [10, 20, 50];

async function fetchAssignmentsForEmployees(employees) {
  const entries = await Promise.all(
    employees.map(async (emp) => {
      const assignments = await getEmployeeRoles(emp.id);
      return [emp.id, assignments];
    }),
  );
  return Object.fromEntries(entries);
}

/**
 * Employee access tab — searchable list with batched role loading per page.
 */
export function EmployeeRoleAssignmentsPanel() {
  const { can } = useAuthorization();
  const { data: roles = [], isLoading: rolesLoading } = useRbacRoles();
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['employees', 'list'],
    queryFn: listEmployees,
  });

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [drawerEmployee, setDrawerEmployee] = useState(null);

  useEffect(() => {
    return () => {
      document.body.style.removeProperty('pointer-events');
      document.body.style.removeProperty('overflow');
    };
  }, []);

  const departments = useMemo(() => {
    const names = new Set();
    for (const emp of employees) {
      if (emp.departmentName) names.add(emp.departmentName);
    }
    return [...names].sort();
  }, [employees]);

  const searchFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((emp) => {
      const matchesSearch =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.employeeCode?.toLowerCase().includes(q) ||
        emp.departmentName?.toLowerCase().includes(q);
      const matchesDept =
        !departmentFilter || emp.departmentName === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [employees, search, departmentFilter]);

  const needsAssignmentData = Boolean(roleFilter) || unassignedOnly;
  const filterEmployeeIds = useMemo(
    () => searchFiltered.map((emp) => emp.id).join(','),
    [searchFiltered],
  );

  const { data: filterAssignments = {}, isLoading: filterAssignmentsLoading } = useQuery({
    queryKey: ['rbac', 'employee-roles-filter', filterEmployeeIds, roleFilter, unassignedOnly],
    queryFn: () => fetchAssignmentsForEmployees(searchFiltered),
    enabled: needsAssignmentData && searchFiltered.length > 0,
    staleTime: 60_000,
  });

  const filteredEmployees = useMemo(() => {
    if (!needsAssignmentData) return searchFiltered;

    return searchFiltered.filter((emp) => {
      const assignments = filterAssignments[emp.id];
      if (!assignments) return false;
      if (unassignedOnly && assignments.length > 0) return false;
      if (roleFilter && !assignments.some((a) => a.roleId === roleFilter)) return false;
      return true;
    });
  }, [searchFiltered, needsAssignmentData, filterAssignments, unassignedOnly, roleFilter]);

  const maxPage = Math.max(0, Math.ceil(filteredEmployees.length / rowsPerPage) - 1);

  useEffect(() => {
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, maxPage]);

  const pageEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const pageEmployeeIds = useMemo(
    () => pageEmployees.map((emp) => emp.id).join(','),
    [pageEmployees],
  );

  const { data: pageAssignments = {}, isLoading: pageAssignmentsLoading } = useQuery({
    queryKey: ['rbac', 'page-employee-roles', pageEmployeeIds],
    queryFn: () => fetchAssignmentsForEmployees(pageEmployees),
    enabled: !needsAssignmentData && pageEmployees.length > 0,
    staleTime: 60_000,
  });

  const assignmentsForRow = needsAssignmentData ? filterAssignments : pageAssignments;
  const assignmentsLoading = needsAssignmentData
    ? filterAssignmentsLoading
    : pageAssignmentsLoading;

  const rangeStart =
    filteredEmployees.length === 0 ? 0 : page * rowsPerPage + 1;
  const rangeEnd = Math.min((page + 1) * rowsPerPage, filteredEmployees.length);

  if (!can('rbac:read')) {
    return null;
  }

  if (employeesLoading || rolesLoading) {
    return (
      <Box>
        <Typography color="text.secondary" variant="body2">
          Loading employees...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Assign roles to employees so they can access entitled modules. Click Edit to
        manage an employee&apos;s roles.
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
        <TextField
          placeholder="Search employees..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          size="small"
          sx={{ minWidth: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="role-filter">Filter by role</InputLabel>
          <Select
            labelId="role-filter"
            label="Filter by role"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(0);
            }}
            MenuProps={{ disableScrollLock: true }}
          >
            <MenuItem value="">All roles</MenuItem>
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="dept-filter">Department</InputLabel>
          <Select
            labelId="dept-filter"
            label="Department"
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setPage(0);
            }}
            MenuProps={{ disableScrollLock: true }}
          >
            <MenuItem value="">All departments</MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={unassignedOnly}
              onChange={(e) => {
                setUnassignedOnly(e.target.checked);
                setPage(0);
              }}
            />
          }
          label="Unassigned only"
        />
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        {assignmentsLoading
          ? 'Loading role assignments...'
          : filteredEmployees.length === 0
            ? 'No employees to display'
            : `Showing ${rangeStart}–${rangeEnd} of ${filteredEmployees.length} employees`}
      </Typography>

      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Primary role</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>All roles</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.length === 0 && !assignmentsLoading && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color="text.secondary" variant="body2">
                    {unassignedOnly
                      ? 'All matching employees have roles assigned.'
                      : 'No employees match your search.'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {pageEmployees.map((emp) => (
              <EmployeeAssignmentTableRow
                key={emp.id}
                employee={emp}
                assignments={assignmentsForRow[emp.id]}
                isLoading={assignmentsLoading && !assignmentsForRow[emp.id]}
                onEdit={() => setDrawerEmployee(emp)}
              />
            ))}
          </TableBody>
        </Table>
      </Box>

      <TablePagination
        component="div"
        count={filteredEmployees.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        labelRowsPerPage="Rows per page"
      />

      {drawerEmployee && (
        <EmployeeRoleDialog
          open
          employee={drawerEmployee}
          onClose={() => setDrawerEmployee(null)}
        />
      )}    </Box>
  );
}
