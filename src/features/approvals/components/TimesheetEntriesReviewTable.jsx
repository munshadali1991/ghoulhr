import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useIsMobileLayout } from '@/shared/hooks/useIsMobileLayout';
import { MobileDataCard } from '@/shared/components/data/MobileDataCard';
import { apiEntryToDisplay } from '@/features/employee-portal/utils/timesheetEntryMappers';

function labelFor(options, value) {
  return options.find((o) => o.value === value)?.label ?? value;
}

/**
 * @param {{
 *   entries: object[],
 *   isLoading?: boolean,
 *   error?: Error | null,
 *   taskStatuses: { value: string, label: string }[],
 *   priorities: { value: string, label: string }[],
 * }} props
 */
export function TimesheetEntriesReviewTable({
  entries,
  isLoading = false,
  error = null,
  taskStatuses,
  priorities,
}) {
  const isMobileLayout = useIsMobileLayout();
  const displayEntries = entries.map(apiEntryToDisplay);

  if (isLoading) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading entries...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  if (!displayEntries.length) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        No entries recorded for this day.
      </Typography>
    );
  }

  if (isMobileLayout) {
    return (
      <Stack spacing={1.5}>
        {displayEntries.map((entry, index) => (
          <MobileDataCard
            key={entry.id ?? index}
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
          />
        ))}
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
          </TableRow>
        </TableHead>
        <TableBody>
          {displayEntries.map((entry, index) => (
            <TableRow key={entry.id ?? index}>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
