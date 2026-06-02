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

/**
 * @param {{
 *   holidays: object[],
 *   onEdit: (row: object) => void,
 *   onDelete: (row: object) => void,
 * }} props
 */
export function CalendarHolidaysTable({ holidays, onEdit, onDelete }) {
  if (holidays.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        No holidays for this year. Add holidays to build your organization calendar.
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
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
