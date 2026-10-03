import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import { MobileDataCard } from '@/shared/components/data/MobileDataCard';
import { useIsMobileLayout } from '@/shared/hooks/useIsMobileLayout';
import { PeopleEmptyState } from './PeopleEmptyState';

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50];

const cellSx = {
  py: 1.25,
  px: 1.5,
  verticalAlign: 'middle',
};

const headerCellSx = {
  ...cellSx,
  color: 'text.secondary',
  fontWeight: 600,
  fontSize: '0.75rem',
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
};

function PersonAvatar({ name, src }) {
  const initials = (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  return (
    <Avatar src={src || undefined} alt={name || ''} sx={{ width: 36, height: 36, fontSize: 14 }}>
      {initials}
    </Avatar>
  );
}

function DesignationChip({ label }) {
  if (!label) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  }
  return (
    <Chip
      size="small"
      icon={<WorkOutlineRoundedIcon sx={{ fontSize: '14px !important' }} />}
      label={label}
      variant="outlined"
      color="default"
      sx={{
        fontWeight: 500,
        maxWidth: '100%',
        height: 26,
        '& .MuiChip-label': { px: 0.75, overflow: 'hidden', textOverflow: 'ellipsis' },
      }}
    />
  );
}

function StatusCell({ status }) {
  const active = status === 'ACTIVE';
  const inactive = status === 'INACTIVE' || status === 'TERMINATED';
  const color = active ? 'success.main' : inactive ? 'error.main' : 'warning.main';
  const label =
    status === 'PENDING_ACTIVATION'
      ? 'Pending'
      : status
        ? status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ')
        : '—';

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: color,
          flexShrink: 0,
        }}
      />
      <Typography variant="body2">{label}</Typography>
    </Stack>
  );
}

/**
 * @param {{
 *   items: Array<Record<string, unknown>>,
 *   total: number,
 *   page: number,
 *   limit: number,
 *   loading?: boolean,
 *   emptyTitle: string,
 *   emptyDescription?: string,
 *   onPageChange: (pageZeroBased: number) => void,
 *   onRowsPerPageChange: (limit: number) => void,
 *   onSelect: (person: Record<string, unknown>) => void,
 * }} props
 */
export function PeopleList({
  items,
  total,
  page,
  limit,
  loading,
  emptyTitle,
  emptyDescription,
  onPageChange,
  onRowsPerPageChange,
  onSelect,
}) {
  const isMobile = useIsMobileLayout();
  const pageIndex = Math.max(0, (page ?? 1) - 1);

  if (loading && (!items || items.length === 0)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!loading && (!items || items.length === 0)) {
    return <PeopleEmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const footer = (
    <Stack
      direction="row"
      justifyContent="flex-end"
      alignItems="center"
      flexWrap="wrap"
      spacing={1}
      useFlexGap
      sx={{ mt: 1.5 }}
    >
      <Typography variant="body2" color="text.secondary">
        Total people: {total}
      </Typography>
      <TablePagination
        component="div"
        count={total}
        page={pageIndex}
        onPageChange={(_, next) => onPageChange(next)}
        rowsPerPage={limit}
        onRowsPerPageChange={(e) => onRowsPerPageChange(Number(e.target.value))}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        sx={{ border: 0, '.MuiToolbar-root': { pl: 1, minHeight: 40 } }}
      />
    </Stack>
  );

  if (isMobile) {
    return (
      <Stack spacing={1.5}>
        {items.map((person) => (
          <MobileDataCard
            key={person.id}
            onClick={() => onSelect(person)}
            fields={[
              {
                label: 'Name',
                value: (
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                    <PersonAvatar name={person.name} src={person.profilePhotoPreviewUrl} />
                    <Typography variant="body2" fontWeight={600}>
                      {person.name}
                    </Typography>
                  </Stack>
                ),
              },
              { label: 'Designation', value: person.designationName || '—' },
              { label: 'Department', value: person.departmentName || '—' },
              { label: 'Email', value: person.email || '—' },
              { label: 'Status', value: <StatusCell status={person.status} /> },
            ]}
          />
        ))}
        {footer}
      </Stack>
    );
  }

  return (
    <>
      <TableContainer>
        <Table
          size="small"
          aria-label="People directory"
          sx={{ tableLayout: 'fixed', width: '100%' }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headerCellSx, width: '28%' }}>User</TableCell>
              <TableCell sx={{ ...headerCellSx, width: '22%' }}>Designation</TableCell>
              <TableCell sx={{ ...headerCellSx, width: '26%' }}>Email</TableCell>
              <TableCell sx={{ ...headerCellSx, width: '14%' }}>Department</TableCell>
              <TableCell sx={{ ...headerCellSx, width: '10%' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((person) => (
              <TableRow
                key={person.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => onSelect(person)}
              >
                <TableCell sx={cellSx}>
                  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                    <PersonAvatar name={person.name} src={person.profilePhotoPreviewUrl} />
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      noWrap
                      title={person.name || ''}
                    >
                      {person.name}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={cellSx}>
                  <DesignationChip label={person.designationName} />
                </TableCell>
                <TableCell sx={cellSx}>
                  <Typography variant="body2" noWrap title={person.email || ''}>
                    {person.email || '—'}
                  </Typography>
                </TableCell>
                <TableCell sx={cellSx}>
                  <Typography variant="body2" noWrap title={person.departmentName || ''}>
                    {person.departmentName || '—'}
                  </Typography>
                </TableCell>
                <TableCell sx={cellSx}>
                  <StatusCell status={person.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {footer}
    </>
  );
}
