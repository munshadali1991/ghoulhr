import {
  IconButton,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Controller } from 'react-hook-form';
import {
  LOCATION_TABLE_COLUMNS,
  LOCATION_TABLE_CONTAINER_SX,
  LOCATION_TABLE_HEADER_CELL_SX,
} from '../constants';
import { formatCoordinateCell } from '../utils/locationMappers';
import { EllipsisCell } from './EllipsisCell';

const ELLIPSIS_MAX = {
  name: 200,
  code: 100,
  country: 120,
  region: 120,
  city: 120,
  postalCode: 88,
  addressLine1: 200,
};

/**
 * @param {{
 *   fields: { id: string }[],
 *   watchedLocations: Record<string, unknown>[] | undefined,
 *   control: import('react-hook-form').Control<{ locations: unknown[] }>,
 *   editingIndex: number | null,
 *   dialogOpen: boolean,
 *   onEdit: (index: number) => void,
 *   onRemove: (index: number) => void,
 * }} props
 */
export function LocationsTable({
  fields,
  watchedLocations,
  control,
  editingIndex,
  dialogOpen,
  onEdit,
  onRemove,
}) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={LOCATION_TABLE_CONTAINER_SX}>
      <Table size="small" stickyHeader sx={{ minWidth: 960 }}>
        <TableHead>
          <TableRow>
            {LOCATION_TABLE_COLUMNS.map((col) => (
              <TableCell
                key={col.key}
                align={col.align}
                sx={{
                  ...LOCATION_TABLE_HEADER_CELL_SX,
                  ...(col.nowrap ? { whiteSpace: 'nowrap' } : {}),
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {fields.map((field, index) => {
            const row = watchedLocations?.[index] ?? {};

            return (
              <TableRow key={field.id} hover selected={editingIndex === index && dialogOpen}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <EllipsisCell value={row.name} maxWidth={ELLIPSIS_MAX.name} />
                </TableCell>
                <TableCell>
                  <EllipsisCell value={row.code} maxWidth={ELLIPSIS_MAX.code} />
                </TableCell>
                <TableCell>
                  <EllipsisCell value={row.country} maxWidth={ELLIPSIS_MAX.country} />
                </TableCell>
                <TableCell>
                  <EllipsisCell value={row.region} maxWidth={ELLIPSIS_MAX.region} />
                </TableCell>
                <TableCell>
                  <EllipsisCell value={row.city} maxWidth={ELLIPSIS_MAX.city} />
                </TableCell>
                <TableCell>
                  <EllipsisCell value={row.postalCode} maxWidth={ELLIPSIS_MAX.postalCode} />
                </TableCell>
                <TableCell>
                  <EllipsisCell value={row.addressLine1} maxWidth={ELLIPSIS_MAX.addressLine1} />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" noWrap component="span">
                    {formatCoordinateCell(row.latitude)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" noWrap component="span">
                    {formatCoordinateCell(row.longitude)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Controller
                    name={`locations.${index}.isActive`}
                    control={control}
                    render={({ field: f }) => (
                      <Tooltip title={f.value ? 'Active' : 'Inactive'}>
                        <Switch
                          checked={!!f.value}
                          onChange={(e) => f.onChange(e.target.checked)}
                          size="small"
                          inputProps={{ 'aria-label': `Active for location ${index + 1}` }}
                        />
                      </Tooltip>
                    )}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    aria-label="Edit location"
                    onClick={() => onEdit(index)}
                    type="button"
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <Tooltip title={fields.length <= 1 ? 'At least one location is required' : 'Remove'}>
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="Remove location"
                        disabled={fields.length <= 1}
                        onClick={() => onRemove(index)}
                        type="button"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
