import { Box, Grid, Link, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { PageCard } from '@/shared/components/ui/PageCard';
import { EmptyStatePanel } from './EmptyStatePanel';

const MONTH_LABELS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/**
 * @param {{
 *   year: number,
 *   months: Record<number, import('../types/employeePortal.types').Holiday[]>,
 *   onApply?: (holiday: import('../types/employeePortal.types').Holiday) => void,
 * }} props
 */
export function HolidayMonthGrid({ year, months, onApply }) {
  return (
    <Grid container spacing={2}>
      {MONTH_LABELS.map((label, index) => {
        const holidays = months[index] ?? [];
        return (
          <Grid key={label} size={{ xs: 12, sm: 6, md: 3 }}>
            <PageCard sx={{ minHeight: 160 }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                  {label} {year}
                </Typography>
                {holidays.length === 0 ? (
                  <EmptyStatePanel title="No Holidays" />
                ) : (
                  <Box sx={{ mt: 1 }}>
                    {holidays.map((h) => (
                      <Box
                        key={h.date}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '48px 1fr auto',
                          gap: 1,
                          alignItems: 'center',
                          py: 1,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': { borderBottom: 'none' },
                        }}
                      >
                        <Box>
                          <Typography variant="h6" fontWeight={700} lineHeight={1}>
                            {dayjs(h.date).format('DD')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {h.dayOfWeek}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={500}>
                          {h.name}
                        </Typography>
                        {h.applicationStatus === 'applied' ? (
                          <Typography variant="caption" fontWeight={700}>
                            APPLIED
                          </Typography>
                        ) : h.applicationStatus === 'applicable' ? (
                          <Link
                            component="button"
                            variant="body2"
                            color="secondary"
                            underline="hover"
                            onClick={() => onApply?.(h)}
                          >
                            Apply
                          </Link>
                        ) : null}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </PageCard>
          </Grid>
        );
      })}
    </Grid>
  );
}
