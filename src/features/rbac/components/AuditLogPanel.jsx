import { useMemo, useState } from 'react';
import {
  Avatar,
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
import { PageCard } from '@/shared/components/ui/PageCard';
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

/** Soft tag styles mapped from Design.md assigned/updated tags onto app tokens. */
const ACTION_TAG_SX = {
  ROLE_CREATED: {
    bgcolor: (t) =>
      t.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.16)' : 'rgba(34, 197, 94, 0.12)',
    color: 'success.dark',
  },
  ROLE_CLONED: {
    bgcolor: (t) =>
      t.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.16)' : 'rgba(34, 197, 94, 0.12)',
    color: 'success.dark',
  },
  EMPLOYEE_ROLES_ASSIGNED: {
    bgcolor: (t) =>
      t.palette.mode === 'dark' ? 'rgba(96, 165, 250, 0.16)' : 'rgba(59, 130, 246, 0.12)',
    color: 'secondary.main',
  },
  ROLE_UPDATED: {
    bgcolor: (t) =>
      t.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.16)' : 'rgba(245, 158, 11, 0.12)',
    color: 'warning.dark',
  },
  ROLE_PERMISSIONS_UPDATED: {
    bgcolor: (t) =>
      t.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.16)' : 'rgba(245, 158, 11, 0.12)',
    color: 'warning.dark',
  },
  ROLE_DEACTIVATED: {
    bgcolor: (t) =>
      t.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.16)' : 'rgba(239, 68, 68, 0.12)',
    color: 'error.dark',
  },
};

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

function formatAction(action) {
  return ACTION_OPTIONS.find((o) => o.value === action)?.label ?? action.replace(/_/g, ' ');
}

function initials(name) {
  return String(name ?? 'System')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function ActionTag({ action }) {
  return (
    <Chip
      label={formatAction(action)}
      size="small"
      sx={{
        height: 22,
        typography: 'overline',
        fontWeight: 700,
        border: 0,
        ...(ACTION_TAG_SX[action] ?? {
          bgcolor: 'action.hover',
          color: 'text.secondary',
        }),
      }}
    />
  );
}

function ActorCell({ name }) {
  const label = name ?? 'System';
  return (
    <Stack direction="row" alignItems="center" spacing={1.25}>
      <Avatar
        sx={{
          width: 28,
          height: 28,
          typography: 'overline',
          fontWeight: 600,
          bgcolor: (t) => t.palette.custom?.surfaces?.subtle ?? 'action.hover',
          color: 'text.secondary',
        }}
      >
        {initials(label)}
      </Avatar>
      <Typography variant="body2">{label}</Typography>
    </Stack>
  );
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

  const headerSx = {
    typography: 'overline',
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: 'text.disabled',
    borderColor: 'divider',
    pb: 1.5,
  };

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.25}
        sx={{ mb: 2.25 }}
        flexWrap="wrap"
        useFlexGap
        alignItems={{ sm: 'center' }}
      >
        <TextField
          placeholder="Search actor or summary..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{
            flex: { sm: 1 },
            minWidth: { xs: 0, sm: 220 },
            '& .MuiOutlinedInput-root': {
              bgcolor: (t) => t.palette.custom?.surfaces?.subtle ?? 'background.default',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: { xs: 0, sm: 200 }, width: { xs: '100%', sm: 'auto' } }}>
          <InputLabel id="audit-action-filter">Action type</InputLabel>
          <Select
            labelId="audit-action-filter"
            label="Action type"
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(0);
            }}
            MenuProps={{ disableScrollLock: true }}
          >
            {ACTION_OPTIONS.map((opt) => (
              <MenuItem key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {isMobileLayout ? (
        <>
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
                  { label: 'Actor', value: <ActorCell name={log.actorName} /> },
                  { label: 'Action', value: <ActionTag action={log.action} /> },
                  { label: 'Summary', value: log.summary },
                ]}
                actions={
                  <IconButton
                    size="small"
                    aria-label="View detail"
                    onClick={() => setSelectedLog(log)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <VisibilityOutlinedIcon fontSize="small" />
                  </IconButton>
                }
              />
            ))}
          </Stack>
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
        </>
      ) : (
        <PageCard sx={{ p: 1.5 }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={headerSx}>When</TableCell>
                  <TableCell sx={headerSx}>Actor</TableCell>
                  <TableCell sx={headerSx}>Action</TableCell>
                  <TableCell sx={headerSx}>Summary</TableCell>
                  <TableCell sx={headerSx} align="right">
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
                  <TableRow
                    key={log.id}
                    hover
                    sx={{
                      '&:last-child td': { borderBottom: 0 },
                      '& td': { borderColor: 'divider', py: 1.75 },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <ActorCell name={log.actorName} />
                    </TableCell>
                    <TableCell>
                      <ActionTag action={log.action} />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        noWrap
                        title={log.summary}
                        sx={{ maxWidth: 360 }}
                      >
                        {log.summary}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        aria-label="View detail"
                        onClick={() => setSelectedLog(log)}
                        sx={{ color: 'text.secondary' }}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ px: 0.5, pt: 1 }}
          >
            <Typography variant="caption" color="text.secondary">
              {isLoading
                ? 'Loading audit trail...'
                : total === 0
                  ? 'No audit entries'
                  : `Showing ${rangeStart}–${rangeEnd} of ${total} entries`}
            </Typography>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
              labelRowsPerPage="Rows per page"
              sx={{ border: 0, '.MuiToolbar-root': { minHeight: 40, pl: 0 } }}
            />
          </Stack>
        </PageCard>
      )}

      <AuditLogDetailDrawer
        open={Boolean(selectedLog)}
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </Box>
  );
}
