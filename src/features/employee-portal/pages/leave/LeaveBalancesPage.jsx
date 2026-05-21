import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageToolbar } from '../../components/PageToolbar';
import { LeaveBalanceCard } from '../../components/LeaveBalanceCard';
import { useLeaveBalances } from '../../hooks/useEmployeePortalQueries';

export function LeaveBalancesPage() {
  const navigate = useNavigate();
  const [year, setYear] = useState(2026);
  const { data, isLoading, error } = useLeaveBalances(year);

  return (
    <>
      <PageToolbar
        right={
          <>
            <Button variant="outlined" color="secondary" onClick={() => navigate('/leave/apply')}>
              Apply
            </Button>
            <Button variant="contained" color="secondary" startIcon={<DownloadRoundedIcon />}>
              Download
            </Button>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Year</InputLabel>
              <Select label="Year" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {[2025, 2026, 2027].map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        }
      />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error.message}</Alert>
      ) : (
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          {data?.balances?.map((b, i) => (
            <LeaveBalanceCard key={b.id} balance={b} showProgress={i === 0} />
          ))}
        </Stack>
      )}
    </>
  );
}
