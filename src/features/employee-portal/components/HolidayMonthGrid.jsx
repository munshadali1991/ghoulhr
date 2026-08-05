import { Box, Grid, Link, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { PageCard } from '@/shared/components/ui/PageCard';

const MONTH_LABELS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const LIST_MAX_HEIGHT = 280;
const ROW_COLUMNS = '44px minmax(0, 1fr) 72px';

/**
 * @param {{
 *   holiday: import('../types/employeePortal.types').Holiday,
 *   onApply?: (holiday: import('../types/employeePortal.types').Holiday) => void,
 * }} props
 */
function HolidayRow({ holiday, onApply }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: ROW_COLUMNS,
        columnGap: 1,
        alignItems: 'center',
        py: 0.75,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight={700} lineHeight={1.1}>
          {dayjs(holiday.date).format('DD')}
        </Typography>
        <Typography variant="caption" color="text.secondary" lineHeight={1.2}>
          {holiday.dayOfWeek}
        </Typography>
      </Box>

      <Typography
        variant="body2"
        fontWeight={500}
        title={holiday.name}
        sx={{
          minWidth: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.35,
        }}
      >
        {holiday.name}
      </Typography>

      <Box
        sx={{
          width: 72,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        {holiday.applicationStatus === 'applied' ? (
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            APPLIED
          </Typography>
        ) : holiday.applicationStatus === 'applicable' ? (
          <Link
            component="button"
            variant="body2"
            color="secondary"
            underline="hover"
            onClick={() => onApply?.(holiday)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Apply
          </Link>
        ) : null}
      </Box>
    </Box>
  );
}

/**
 * @param {{
 *   year: number,
 *   months: Record<number, import('../types/employeePortal.types').Holiday[]>,
 *   onApply?: (holiday: import('../types/employeePortal.types').Holiday) => void,
 * }} props
 */
export function HolidayMonthGrid({ year, months, onApply }) {
  return (
    <Grid container spacing={2} alignItems="stretch">
      {MONTH_LABELS.map((label, index) => {
        const holidays = months[index] ?? [];
        return (
          <Grid
            key={label}
            size={{ xs: 12, sm: 6, md: 3 }}
            sx={{ display: 'flex' }}
          >
            <PageCard
              sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 160,
              }}
            >
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minHeight: 0,
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color="text.secondary"
                  sx={{ flexShrink: 0, mb: 1 }}
                >
                  {label} {year}
                </Typography>

                {holidays.length === 0 ? (
                  <Box
                    sx={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 120,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      No Holidays
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      flex: 1,
                      minHeight: 0,
                      maxHeight: LIST_MAX_HEIGHT,
                      overflowY: 'auto',
                      pr: 0.5,
                    }}
                  >
                    {holidays.map((h) => (
                      <HolidayRow
                        key={`${h.date}-${h.name}`}
                        holiday={h}
                        onApply={onApply}
                      />
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
