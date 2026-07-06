import { useNavigate } from 'react-router-dom';
import {
  Box,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import dayjs from 'dayjs';
import { PageCard } from '@/shared/components/ui';
import { FormStatusAlerts } from '@/shared/components/feedback/FormStatusAlerts';
import { useMyAssessments } from '../hooks/usePerformanceQueries';
import { ASSESSMENT_STATUS_META } from '../constants/performanceEnums';

function StatusChip({ status }) {
  const meta = ASSESSMENT_STATUS_META[status] ?? { label: status, color: 'default' };
  return <Chip size="small" label={meta.label} color={meta.color} variant="outlined" />;
}

export function MyAssessmentsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useMyAssessments();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <FormStatusAlerts loadError={{ message: error?.message || 'Unable to load assessments.' }} />;
  }

  const assessments = data ?? [];

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Performance Assessments
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Complete your self-assessments and review the status of your performance cycles.
        </Typography>
      </Box>

      {assessments.length === 0 ? (
        <PageCard sx={{ p: 4 }}>
          <Stack alignItems="center" spacing={1.5} sx={{ py: 4, color: 'text.secondary' }}>
            <AssignmentTurnedInRoundedIcon sx={{ fontSize: 40 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              No assessments assigned yet
            </Typography>
            <Typography variant="body2">
              When HR assigns a performance review cycle, it will appear here. HR can assign cycles from{' '}
              <strong>Performance → Manage & assign</strong>.
            </Typography>
          </Stack>
        </PageCard>
      ) : (
        <Stack spacing={1.5}>
          {assessments.map((item) => (
            <PageCard
              key={item.id}
              onClick={() => navigate(`/performance/${item.id}`)}
              sx={{
                p: 2,
                cursor: 'pointer',
                transition: 'border-color 120ms ease',
                '&:hover': { borderColor: 'secondary.main' },
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                spacing={1.5}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {item.cycleLabel}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.dueDate ? `Due ${dayjs(item.dueDate).format('DD MMM YYYY')}` : 'No deadline set'}
                    {item.submittedAt
                      ? ` \u2022 Submitted ${dayjs(item.submittedAt).format('DD MMM YYYY')}`
                      : ''}
                  </Typography>
                </Box>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Score: {Number(item.score ?? 0).toFixed(item.score % 1 === 0 ? 0 : 2)}
                  </Typography>
                  <StatusChip status={item.status} />
                  <ChevronRightRoundedIcon sx={{ color: 'text.secondary' }} />
                </Stack>
              </Stack>
            </PageCard>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
