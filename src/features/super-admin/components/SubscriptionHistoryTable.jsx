import { useEffect, useState } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Paper,
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
import { useOrganizationSubscriptionHistory } from '@/features/super-admin/hooks/useOrganizationSubscriptionHistory';
import {
  formatDisplayDate,
  formatSubscriptionType,
} from '@/features/super-admin/utils/subscriptionPeriodUtils';

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25];

const STATUS_CHIP_COLOR = {
  ACTIVE: 'success',
  EXPIRED: 'error',
  SUPERSEDED: 'default',
  CANCELLED: 'warning',
};

/**
 * Paginated subscription history for super admin org edit.
 * @param {{ organizationId: string, refreshKey?: number }} props
 */
export function SubscriptionHistoryTable({ organizationId, refreshKey = 0 }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setPage(0);
  }, [refreshKey]);

  const { data, isLoading, isFetching, error } = useOrganizationSubscriptionHistory(
    organizationId,
    {
      page: page + 1,
      limit: rowsPerPage,
      refreshKey,
    },
  );

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const handlePageChange = (_event, nextPage) => {
    setPage(nextPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading && !data) {
    return (
      <Stack direction="row" justifyContent="center" py={2}>
        <CircularProgress size={24} />
      </Stack>
    );
  }

  if (error) {
    return (
      <Typography variant="body2" color="error">
        {error.message}
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
        Subscription history ({total})
      </Typography>

      {total === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No subscription history yet.
        </Typography>
      ) : (
        <>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ maxHeight: 360, opacity: isFetching ? 0.7 : 1 }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Plan</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>Expires</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{formatSubscriptionType(row.subscriptionType)}</TableCell>
                    <TableCell>{formatDisplayDate(row.startsAt)}</TableCell>
                    <TableCell>{formatDisplayDate(row.expiresAt)}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        variant="outlined"
                        color={STATUS_CHIP_COLOR[row.status] ?? 'default'}
                      />
                    </TableCell>
                    <TableCell>{formatDisplayDate(row.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

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
      )}
    </Box>
  );
}
