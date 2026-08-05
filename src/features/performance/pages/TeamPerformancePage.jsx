import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { FormStatusAlerts } from '@/shared/components/feedback/FormStatusAlerts';
import { AssessmentsDataTable } from '../components/AssessmentsDataTable';
import { useReviewAssessments } from '../hooks/usePerformanceQueries';

export function TeamPerformancePage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const filters = useMemo(
    () => ({
      status: statusFilter || undefined,
      search: debouncedSearch || undefined,
    }),
    [statusFilter, debouncedSearch],
  );

  const { data, isLoading, isError, error } = useReviewAssessments(filters);

  const rows = data?.assessments ?? [];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <FormStatusAlerts
        loadError={{ message: error?.message || 'Unable to load team assessments.' }}
      />
    );
  }

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Team reviews
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review performance assessments for your direct reports.
        </Typography>
      </Box>

      <AssessmentsDataTable
        rows={rows}
        showEmployeeColumn
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        search={search}
        onSearchChange={setSearch}
        onRowClick={(row) => navigate(`/performance/${row.id}`)}
      />
    </Stack>
  );
}