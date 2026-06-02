import { Box, Typography } from '@mui/material';
import { HolidayMonthGrid } from '@/features/employee-portal/components/HolidayMonthGrid';
import { buildHolidayMonths } from '../utils/buildHolidayMonths';

/**
 * @param {{ year: number, holidays: object[] }} props
 */
export function CalendarYearPreview({ year, holidays }) {
  const months = buildHolidayMonths(holidays, year);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
        Year preview
      </Typography>
      <HolidayMonthGrid year={year} months={months} />
    </Box>
  );
}
