import { Alert, Box, CircularProgress, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageToolbar } from '../../components/PageToolbar';
import { HolidayMonthGrid } from '../../components/HolidayMonthGrid';
import { useHolidayCalendar } from '../../hooks/useEmployeePortalQueries';

const currentYear = new Date().getFullYear();

export function HolidayCalendarPage() {
  const navigate = useNavigate();
  const [year, setYear] = useState(currentYear);
  const { data, isLoading, error } = useHolidayCalendar(year);

  const yearOptions = useMemo(
    () => [currentYear - 1, currentYear, currentYear + 1],
    [],
  );

  const hasHolidays = useMemo(() => {
    const months = data?.months ?? {};
    return Object.values(months).some((list) => list?.length > 0);
  }, [data?.months]);

  return (
    <>
      <PageToolbar
        right={
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
        }
      />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error.message}</Alert>
      ) : !hasHolidays ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Your organization has not published a holiday calendar for {year} yet.
        </Alert>
      ) : null}

      {!isLoading && !error ? (
        <HolidayMonthGrid
          year={year}
          months={data?.months ?? {}}
          onApply={() => navigate('/leave/apply?tab=apply')}
        />
      ) : null}

      {!isLoading && !error && !hasHolidays ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Contact your HR administrator to publish the organization calendar.
        </Typography>
      ) : null}
    </>
  );
}
