import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useIsMobileLayout } from '@/shared/hooks/useIsMobileLayout';
import { MobileDataCard } from '@/shared/components/data/MobileDataCard';

function labelFor(options, value) {
  return options.find((o) => o.value === value)?.label ?? value;
}

/**
 * @param {{
 *   entries: object[],
 *   isLoading: boolean,
 *   error: Error | null,
 *   isEditable: boolean,
 *   editingKey: string | null,
 *   entryKey: (entry: object) => string,
 *   taskStatuses: { value: string, label: string }[],
 *   priorities: { value: string, label: string }[],
 *   onRowClick: (entry: object) => void,
 *   onDelete: (entry: object) => void,
 * }} props
 */
export function TimesheetSavedEntriesTable({
  entries,
  isLoading,
  error,
  isEditable,
  editingKey,
  entryKey,
  taskStatuses,
  priorities,
  onRowClick,
  onDelete,
}) {
  const isMobileLayout = useIsMobileLayout();

  if (isLoading) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading records...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  if (!entries.length) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
        No records for this date. Use the form above to add your first entry.
      </Typography>
    );
  }

  if (isMobileLayout) {
    return (
      <Stack spacing={1.5}>
        {entries.map((entry, index) => {
          const key = entryKey(entry);
          const actions = isEditable ? (
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" aria-label="Edit" onClick={() => onRowClick(entry)}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="error" aria-label="Delete" onClick={() => onDelete(entry)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Stack>
          ) : null;

          return (
            <MobileDataCard
              key={key}
              onClick={isEditable ? () => onRowClick(entry) : undefined}
              sx={{
                bgcolor: editingKey === key ? 'action.hover' : 'background.default',
              }}
              fields={[
                { label: '#', value: index + 1 },
                {
                  label: 'Category',
                  value: (
                    <Chip
                      label={entry.categoryName || '—'}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  ),
                },
                { label: 'Work Area/Description', value: entry.workAreaDescription },
                { label: 'Hours', value: Number(entry.hoursSpent).toFixed(1) },
                {
                  label: 'Task status',
                  value: (
                    <Chip
                      label={labelFor(taskStatuses, entry.taskStatus)}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  ),
                },
                {
                  label: 'Priority',
                  value: (
                    <Chip
                      label={labelFor(priorities, entry.priority)}
                      size="small"
                      color={
                        entry.priority === 'CRITICAL' || entry.priority === 'HIGH'
                          ? 'error'
                          : entry.priority === 'LOW'
                            ? 'default'
                            : 'warning'
                      }
                      variant="outlined"
                    />
                  ),
                },
                { label: 'Ref #', value: entry.refNumber || '—' },
              ]}
              actions={actions}
            />
          );
        })}
      </Stack>
    );
  }

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: { xs: 0, md: 900 } }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'background.default' }}>
            <TableCell><strong>#</strong></TableCell>
            <TableCell><strong>Category</strong></TableCell>
            <TableCell><strong>Work Area/Description</strong></TableCell>
            <TableCell align="right"><strong>Hours</strong></TableCell>
            <TableCell><strong>Task status</strong></TableCell>
            <TableCell><strong>Priority</strong></TableCell>
            <TableCell><strong>Ref #</strong></TableCell>
            {isEditable ? (
              <TableCell align="right"><strong>Actions</strong></TableCell>
            ) : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((entry, index) => (
            <TableRow
              key={entryKey(entry)}
              hover
              sx={{
                cursor: isEditable ? 'pointer' : 'default',
                bgcolor: editingKey === entryKey(entry) ? 'action.hover' : undefined,
              }}
              onClick={() => isEditable && onRowClick(entry)}
            >
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <Chip label={entry.categoryName || '—'} size="small" color="secondary" variant="outlined" />
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {entry.workAreaDescription}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography fontWeight={600}>{Number(entry.hoursSpent).toFixed(1)}</Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={labelFor(taskStatuses, entry.taskStatus)}
                  size="small"
                  color="info"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={labelFor(priorities, entry.priority)}
                  size="small"
                  color={
                    entry.priority === 'CRITICAL' || entry.priority === 'HIGH'
                      ? 'error'
                      : entry.priority === 'LOW'
                        ? 'default'
                        : 'warning'
                  }
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {entry.refNumber || '—'}
                </Typography>
              </TableCell>
              {isEditable ? (
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                    <IconButton size="small" aria-label="Edit" onClick={() => onRowClick(entry)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" aria-label="Delete" onClick={() => onDelete(entry)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
