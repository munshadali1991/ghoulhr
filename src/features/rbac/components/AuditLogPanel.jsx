import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
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
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useRbacAuditLogs } from '@/features/rbac/hooks/useRbacAdmin';
import { AuditLogDetailDrawer } from '@/features/rbac/components/AuditLogDetailDrawer';
import { MobileDataCard } from '@/shared/components/data/MobileDataCard';
import { useIsMobileLayout } from '@/shared/hooks/useIsMobileLayout';

const ACTION_OPTIONS = [
  { value: '', label: 'All actions' },
  { value: 'ROLE_CREATED', label: 'Role created' },
  { value: 'ROLE_UPDATED', label: 'Role updated' },
  { value: 'ROLE_DEACTIVATED', label: 'Role deactivated' },
  { value: 'ROLE_CLONED', label: 'Role cloned' },
  { value: 'ROLE_PERMISSIONS_UPDATED', label: 'Permissions updated' },
  { value: 'EMPLOYEE_ROLES_ASSIGNED', label: 'Employee roles assigned' },
];

const ACTION_CHIP_COLOR = {
  ROLE_CREATED: 'success',
  ROLE_UPDATED: 'info',
  ROLE_DEACTIVATED: 'error',
  ROLE_CLONED: 'primary',
  ROLE_PERMISSIONS_UPDATED: 'warning',
  EMPLOYEE_ROLES_ASSIGNED: 'secondary',
};

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

function formatAction(action) {
  return ACTION_OPTIONS.find((o) => o.value === action)?.label ?? action.replace(/_/g, ' ');
}

/**
 * Audit trail tab with filters and detail drawer.
 */
export function AuditLogPanel() {
  const isMobileLayout = useIsMobileLayout();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [action, setAction] = useState('');
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const { data, isLoading } = useRbacAuditLogs({
    page: page + 1,
    limit: rowsPerPage,
    action: action || undefined,
  });
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (log) =>
        log.summary?.toLowerCase().includes(q) ||
        log.actorName?.toLowerCase().includes(q) ||
        formatAction(log.action).toLowerCase().includes(q),
    );
  }, [items, search]);

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const rangeStart = total === 0 ? 0 : page * rowsPerPage + 1;
  const rangeEnd = Math.min((page + 1) * rowsPerPage, total);

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Track changes to roles, permissions, and employee assignments for compliance
        and troubleshooting.
      </Typography>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 2 }}
        flexWrap="wrap"
      >
        <TextField
          placeholder="Search actor or summary..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: { xs: 0, sm: 220 }, width: { xs: '100%', sm: 'auto' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: { xs: 0, sm: 220 }, width: { xs: '100%', sm: 'auto' } }}>
          <InputLabel id="audit-action-filter">Action type</InputLabel>
          <Select
            labelId="audit-action-filter"
            label="Action type"
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(0);
            }}
          >
            {ACTION_OPTIONS.map((opt) => (
              <MenuItem key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        {isLoading
          ? 'Loading audit trail...'
          : total === 0
            ? 'No audit entries'
            : `Showing ${rangeStart}–${rangeEnd} of ${total} entries`}
      </Typography>

      {isMobileLayout ? (
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          {isLoading && (
            <Typography color="text.secondary" variant="body2">
              Loading audit trail...
            </Typography>
          )}
          {!isLoading && filteredItems.length === 0 && (
            <Typography color="text.secondary" variant="body2">
              No RBAC audit entries match your filters.
            </Typography>
          )}
          {filteredItems.map((log) => (
            <MobileDataCard
              key={log.id}
              fields={[
                { label: 'When', value: new Date(log.createdAt).toLocaleString() },
                { label: 'Actor', value: log.actorName ?? 'System' },
                {
                  label: 'Action',
                  value: (
                    <Chip
                      label={formatAction(log.action)}
                      size="small"
                      color={ACTION_CHIP_COLOR[log.action] ?? 'default'}
                      variant="outlined"
                    />
                  ),
                },
                { label: 'Summary', value: log.summary },
              ]}
              actions={
                <IconButton size="small" onClick={() => setSelectedLog(log)}>
                  <VisibilityOutlinedIcon fontSize="small" />
                </IconButton>
              }
            />
          ))}
        </Stack>
      ) : (
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>When</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actor</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Summary</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Detail
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color="text.secondary" variant="body2">
                    Loading audit trail...
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {!isLoading && filteredItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color="text.secondary" variant="body2">
                    No RBAC audit entries match your filters.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {filteredItems.map((log) => (
              <TableRow key={log.id} hover>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(log.createdAt).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{log.actorName ?? 'System'}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={formatAction(log.action)}
                    size="small"
                    color={ACTION_CHIP_COLOR[log.action] ?? 'default'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 320 }}>
                    {log.summary}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => setSelectedLog(log)}>
                    <VisibilityOutlinedIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      )}

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        labelRowsPerPage="Rows per page"
      />

      <AuditLogDetailDrawer
        open={Boolean(selectedLog)}
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </Box>
  );
}
