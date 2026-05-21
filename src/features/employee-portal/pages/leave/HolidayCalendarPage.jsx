import { Alert, Box, CircularProgress, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageToolbar } from '../../components/PageToolbar';
import { HolidayMonthGrid } from '../../components/HolidayMonthGrid';
import { useHolidayCalendar } from '../../hooks/useEmployeePortalQueries';

export function HolidayCalendarPage() {
  const navigate = useNavigate();
  const [year, setYear] = useState(2026);
  const { data, isLoading, error } = useHolidayCalendar(year);

  return (
    <>
      <PageToolbar
        right={
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
        }
      />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error.message}</Alert>
      ) : (
        <HolidayMonthGrid
          year={year}
          months={data?.months ?? {}}
          onApply={() => navigate('/leave/apply?tab=apply')}
        />
      )}
    </>
  );
}
