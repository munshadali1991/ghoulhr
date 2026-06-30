import {
  Chip,
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
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useIsMobileLayout } from '@/shared/hooks/useIsMobileLayout';
import { MobileDataCard } from '@/shared/components/data/MobileDataCard';

/**
 * @param {{
 *   holidays: object[],
 *   onEdit: (row: object) => void,
 *   onDelete: (row: object) => void,
 * }} props
 */
export function CalendarHolidaysTable({ holidays, onEdit, onDelete }) {
  const isMobileLayout = useIsMobileLayout();

  if (holidays.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        No holidays for this year. Add holidays to build your organization calendar.
      </Typography>
    );
  }

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
            actions={
              <Stack direction="row" spacing={0.5}>
                <IconButton size="small" aria-label="Edit" onClick={() => onEdit(row)}>
                  <EditRoundedIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" aria-label="Delete" onClick={() => onDelete(row)}>
                  <DeleteRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
            }
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
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <IconButton size="small" aria-label="Edit" onClick={() => onEdit(row)}>
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    aria-label="Delete"
                    onClick={() => onDelete(row)}
                  >
                    <DeleteRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
