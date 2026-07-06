import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';
import { FormStatusAlerts } from '@/shared/components/feedback/FormStatusAlerts';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { AssessmentsDataTable } from '../components/AssessmentsDataTable';
import { AssignAssessmentDialog } from '../components/AssignAssessmentDialog';
import { useReviewAssessments } from '../hooks/usePerformanceQueries';

export function HrPerformancePage() {
  const navigate = useNavigate();
  const { snackbar, show, close } = useAppSnackbar();
  const [assignOpen, setAssignOpen] = useState(false);
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
        loadError={{ message: error?.message || 'Unable to load assessments.' }}
      />
    );
  }

  return (
    <>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          spacing={1.5}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Manage & assign
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Assign review cycles and monitor assessments across the organization.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setAssignOpen(true)}
            sx={{ alignSelf: { xs: 'stretch', sm: 'auto' }, flexShrink: 0 }}
          >
            Assign assessment
          </Button>
        </Stack>

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

      <AssignAssessmentDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onSuccess={() => show('Assessment assigned successfully.')}
      />

      <AppSnackbar snackbar={snackbar} onClose={close} />
    </>
  );
}
