import {
  Box,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useIsMobileLayout } from '@/shared/hooks/useIsMobileLayout';
import { MobileDataCard } from '@/shared/components/data/MobileDataCard';
import { EmptyState } from './EmptyState';

export function CrudDataTable({
  columns,
  rows,
  rowKey = 'id',
  isLoading = false,
  emptyTitle,
  emptyDescription,
  onEdit,
  onDelete,
  readOnly = false,
  renderMobileCard,
}) {
  const isMobileLayout = useIsMobileLayout();

  if (isLoading) {
    return (
      <Stack spacing={1}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={48} />
        ))}
      </Stack>
    );
  }

  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const actionButtons = (row) =>
    readOnly ? null : (
    <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
      <Tooltip title="Edit">
        <IconButton size="small" aria-label="Edit row" onClick={() => onEdit?.(row)}>
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton
          size="small"
          color="error"
          aria-label="Delete row"
          onClick={() => onDelete?.(row)}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  if (isMobileLayout) {
    return (
      <Stack spacing={1.5}>
        {rows.map((row) =>
          renderMobileCard ? (
            <Box key={row[rowKey]}>{renderMobileCard(row, actionButtons(row))}</Box>
          ) : (
            <MobileDataCard
              key={row[rowKey]}
              fields={columns.map((col) => ({
                label: col.label,
                value: col.render ? col.render(row) : row[col.id],
              }))}
              actions={actionButtons(row)}
            />
          ),
        )}
      </Stack>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
      <Table size="medium" aria-label="Data table" sx={{ minWidth: 640 }}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.id} align={col.align || 'left'} sx={{ fontWeight: 600 }}>
                {col.label}
              </TableCell>
            ))}
            <TableCell align="right" sx={{ fontWeight: 600, width: 112 }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row[rowKey]} hover>
              {columns.map((col) => (
                <TableCell key={col.id} align={col.align || 'left'}>
                  {col.render ? col.render(row) : row[col.id]}
                </TableCell>
              ))}
              <TableCell align="right">{actionButtons(row)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function StatusChipCell({ active }) {
  return (
    <Typography
      component="span"
      variant="caption"
      sx={{
        px: 1,
        py: 0.25,
        borderRadius: 1,
        fontWeight: 600,
        bgcolor: active ? 'success.light' : 'action.selected',
        color: active ? 'success.dark' : 'text.secondary',
      }}
    >
      {active ? 'Active' : 'Inactive'}
    </Typography>
  );
}
