import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageToolbar } from '../../components/PageToolbar';
import { LeaveBalanceMetricsCarousel } from '../../components/LeaveBalanceMetricsCarousel';
import { LeaveBalanceMonthlyChart } from '../../components/LeaveBalanceMonthlyChart';
import { LeaveBalanceLedgerTable } from '../../components/LeaveBalanceLedgerTable';
import { useLeaveBalanceDetail } from '../../hooks/useEmployeePortalQueries';

const currentYear = new Date().getFullYear();

export function LeaveBalanceDetailPage() {
  const navigate = useNavigate();
  const { leaveConfigurationId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const yearFromQuery = Number(searchParams.get('year'));
  const initialYear =
    Number.isFinite(yearFromQuery) && yearFromQuery >= 2000 ? yearFromQuery : currentYear;

  const [year, setYear] = useState(initialYear);

  const yearOptions = useMemo(
    () => [currentYear - 1, currentYear, currentYear + 1],
    [],
  );

  const { data, isLoading, error } = useLeaveBalanceDetail(leaveConfigurationId, year);

  const handleYearChange = (nextYear) => {
    setYear(nextYear);
    setSearchParams({ year: String(nextYear) }, { replace: true });
  };

  const breadcrumbs = (
    <Breadcrumbs sx={{ mb: 2 }} aria-label="Leave balance breadcrumb">
      <Link
        component="button"
        variant="body2"
        underline="hover"
        color="text.secondary"
        onClick={() => navigate('/leave/balances')}
        sx={{ cursor: 'pointer', border: 0, bgcolor: 'transparent', p: 0 }}
      >
        Leave Balances
      </Link>
      {data?.leaveType?.name ? (
        <Typography variant="body2" color="text.primary" fontWeight={600}>
          {data.leaveType.name}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary">
          …
        </Typography>
      )}
    </Breadcrumbs>
  );

  if (isLoading) {
    return (
      <>
        {breadcrumbs}
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        {breadcrumbs}
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/leave/balances')}>
          Back to Leave Balances
        </Button>
      </>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <>
      {breadcrumbs}

      <PageToolbar
        right={
          <>
            <Button variant="outlined" color="secondary" onClick={() => navigate('/leave/apply')}>
              Apply
            </Button>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Year</InputLabel>
              <Select label="Year" value={year} onChange={(e) => handleYearChange(Number(e.target.value))}>
                {yearOptions.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        }
      />

      <LeaveBalanceMetricsCarousel summary={data.summary} />

      <LeaveBalanceMonthlyChart
        leaveTypeName={data.leaveType.name}
        year={data.year}
        monthlyChart={data.monthlyChart}
      />

      <LeaveBalanceLedgerTable transactions={data.transactions} />
    </>
  );
}
