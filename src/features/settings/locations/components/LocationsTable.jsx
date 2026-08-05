import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { useIsMobileLayout } from '@/shared/hooks/useIsMobileLayout';
import { MobileDataCard } from '@/shared/components/data/MobileDataCard';
import { TableRowActions } from '@/shared/components/data/TableRowActions';
import { ActiveSwitchCell } from '@/shared/components/data/ActiveSwitchCell';
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
  const isMobileLayout = useIsMobileLayout();

  if (isMobileLayout) {
    return (
      <Stack spacing={1.5}>
        {fields.map((field, index) => {
          const row = watchedLocations?.[index] ?? {};
          const actions = (
            <TableRowActions
              onEdit={() => onEdit(index)}
              onDelete={() => onRemove(index)}
              editLabel="Edit location"
              deleteLabel={fields.length <= 1 ? 'At least one location is required' : 'Remove'}
              deleteDisabled={fields.length <= 1}
            />
          );

          return (
            <MobileDataCard
              key={field.id}
              sx={{
                bgcolor: editingIndex === index && dialogOpen ? 'action.hover' : 'background.default',
              }}
              fields={[
                { label: '#', value: index + 1 },
                { label: 'Name', value: row.name || '—' },
                { label: 'Code', value: row.code || '—' },
                { label: 'Country', value: row.country || '—' },
                { label: 'State', value: row.region || '—' },
                { label: 'City', value: row.city || '—' },
                { label: 'Postal', value: row.postalCode || '—' },
                { label: 'Street', value: row.addressLine1 || '—' },
                { label: 'Lat', value: formatCoordinateCell(row.latitude) },
                { label: 'Lng', value: formatCoordinateCell(row.longitude) },
                {
                  label: 'Active',
                  value: (
                    <Controller
                      name={`locations.${index}.isActive`}
                      control={control}
                      render={({ field: f }) => (
                        <ActiveSwitchCell
                          checked={!!f.value}
                          onChange={(next) => f.onChange(next)}
                          ariaLabel={`Active for location ${index + 1}`}
                        />
                      )}
                    />
                  ),
                },
              ]}
              actions={actions}
            />
          );
        })}
      </Stack>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={LOCATION_TABLE_CONTAINER_SX}>
      <Table size="small" stickyHeader sx={{ minWidth: { xs: 0, md: 960 } }}>
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
                      <ActiveSwitchCell
                        checked={!!f.value}
                        onChange={(next) => f.onChange(next)}
                        ariaLabel={`Active for location ${index + 1}`}
                      />
                    )}
                  />
                </TableCell>
                <TableCell align="right" className="table-actions-cell">
                  <TableRowActions
                    onEdit={() => onEdit(index)}
                    onDelete={() => onRemove(index)}
                    editLabel="Edit location"
                    deleteLabel={fields.length <= 1 ? 'At least one location is required' : 'Remove'}
                    deleteDisabled={fields.length <= 1}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
