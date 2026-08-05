import {
  Chip,
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
import { TableRowActions } from '@/shared/components/data/TableRowActions';

/**
 * @param {{
 *   holidays: object[],
 *   emptyMessage?: string,
 *   onEdit?: (row: object) => void,
 *   onDelete?: (row: object) => void,
 * }} props
 */
export function CalendarHolidaysTable({
  holidays,
  emptyMessage = 'No holidays for this year. Add holidays to build your organization calendar.',
  onEdit,
  onDelete,
}) {
  const isMobileLayout = useIsMobileLayout();

  if (holidays.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        {emptyMessage}
      </Typography>
    );
  }

  const actions = (row) =>
    onEdit || onDelete ? (
      <TableRowActions
        onEdit={onEdit ? () => onEdit(row) : undefined}
        onDelete={onDelete ? () => onDelete(row) : undefined}
      />
    ) : undefined;

  if (isMobileLayout) {
    return (
      <Stack spacing={1.5}>
        {holidays.map((row) => (
          <MobileDataCard
            key={row.id}
            fields={[
              {
                label: 'Date',
                value: new Date(`${row.holidayDate}T12:00:00.000Z`).toLocaleDateString(),
              },
              { label: 'Name', value: row.name },
              {
                label: 'Type',
                value: (
                  <Chip
                    label={row.holidayType === 'RESTRICTED' ? 'Restricted' : 'General'}
                    size="small"
                    color={row.holidayType === 'RESTRICTED' ? 'warning' : 'default'}
                    variant="outlined"
                  />
                ),
              },
              { label: 'Location', value: row.locationName || 'All locations' },
            ]}
            actions={actions(row)}
          />
        ))}
      </Stack>
    );
  }

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 600 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'background.default' }}>
            <TableCell>
              <strong>Date</strong>
            </TableCell>
            <TableCell>
              <strong>Name</strong>
            </TableCell>
            <TableCell>
              <strong>Type</strong>
            </TableCell>
            <TableCell>
              <strong>Location</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Actions</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {holidays.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>
                {new Date(`${row.holidayDate}T12:00:00.000Z`).toLocaleDateString()}
              </TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>
                <Chip
                  label={row.holidayType === 'RESTRICTED' ? 'Restricted' : 'General'}
                  size="small"
                  color={row.holidayType === 'RESTRICTED' ? 'warning' : 'default'}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{row.locationName || 'All locations'}</TableCell>
              <TableCell align="right" className="table-actions-cell">
                {actions(row)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
