import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CrudButton } from '@/shared/components/ui/CrudButton';
import { PageToolbar, ToolbarButtonGroup } from '../../components/PageToolbar';
import { LeaveBalanceCard } from '../../components/LeaveBalanceCard';
import { EmptyStatePanel } from '../../components/EmptyStatePanel';
import { useLeaveBalances } from '../../hooks/useEmployeePortalQueries';
import { useAppSnackbar } from '@/shared/hooks/useAppSnackbar';
import { AppSnackbar } from '@/shared/components/feedback/AppSnackbar';

const currentYear = new Date().getFullYear();

function downloadBalancesCsv(balances, year) {
  const header = ['Leave Type', 'Year', 'Granted', 'Consumed', 'Pending', 'Available'];
  const rows = (balances ?? []).map((b) => [
    b.name ?? '',
    String(year),
    String(b.granted ?? 0),
    String(b.consumed ?? 0),
    String(b.pending ?? 0),
    String(b.balance ?? 0),
  ]);
  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((r) => r.map(escape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leave-balances-${year}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function LeaveBalancesPage() {
  const navigate = useNavigate();
  const [year, setYear] = useState(currentYear);
  const { data, isLoading, error } = useLeaveBalances(year);
  const { snackbar, show, close } = useAppSnackbar();

  const yearOptions = useMemo(
    () => [currentYear - 1, currentYear, currentYear + 1],
    [],
  );

  const balances = data?.balances ?? [];

  const handleDownload = () => {
    if (balances.length === 0) {
      show('No balances to download', 'info');
      return;
    }
    downloadBalancesCsv(balances, year);
    show('Leave balances downloaded');
  };

  return (
    <>
      <PageToolbar
        right={
          <>
            <ToolbarButtonGroup>
              <CrudButton intent="create" onClick={() => navigate('/leave/apply')}>
                Apply
              </CrudButton>
              <Button
                variant="outlined"
                startIcon={<DownloadRoundedIcon />}
                onClick={handleDownload}
                disabled={isLoading || Boolean(error)}
              >
                Download
              </Button>
            </ToolbarButtonGroup>
            <FormControl size="small" sx={{ minWidth: { sm: 100 } }}>
              <InputLabel>Year</InputLabel>
              <Select label="Year" value={year} onChange={(e) => setYear(Number(e.target.value))}>
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

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error.message}</Alert>
      ) : balances.length === 0 ? (
        <EmptyStatePanel
          title="No leave balances for this year"
          description="Balances appear once leave types are configured for your organization."
        />
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          {balances.map((b, i) => (
            <LeaveBalanceCard key={b.id} balance={b} year={year} showProgress={i === 0} />
          ))}
        </Box>
      )}

      <AppSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={close} />
    </>
  );
}
