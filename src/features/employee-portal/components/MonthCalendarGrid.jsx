import { Box, Button, Grid, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * @param {dayjs.Dayjs} month
 */
function buildCalendarCells(month) {
  const start = month.startOf('month');
  const end = month.endOf('month');
  const gridStart = start.startOf('week');
  const gridEnd = end.endOf('week');
  const cells = [];
  let cursor = gridStart;
  while (cursor.isBefore(gridEnd) || cursor.isSame(gridEnd, 'day')) {
    cells.push({
      date: cursor,
      inMonth: cursor.month() === month.month(),
    });
    cursor = cursor.add(1, 'day');
  }
  return cells;
}

/**
 * @param {{
 *   month: import('dayjs').Dayjs,
 *   selectedDate: import('dayjs').Dayjs | null,
 *   onMonthChange: (month: import('dayjs').Dayjs) => void,
 *   onDateSelect: (date: import('dayjs').Dayjs) => void,
 *   renderCell?: (args: { date: import('dayjs').Dayjs, inMonth: boolean, selected: boolean }) => import('react').ReactNode,
 *   legend?: import('react').ReactNode,
 * }} props
 */
export function MonthCalendarGrid({
  month,
  selectedDate,
  onMonthChange,
  onDateSelect,
  renderCell,
  legend,
}) {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('sm'));
  const cells = buildCalendarCells(month);
  const weekdayLabels = isCompact ? WEEKDAYS_SHORT : WEEKDAYS;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 1 }}>
        {isCompact ? (
          <IconButton
            size="small"
            onClick={() => onMonthChange(month.subtract(1, 'month'))}
            aria-label="Previous month"
          >
            <ChevronLeftRoundedIcon />
          </IconButton>
        ) : (
          <Button
            size="small"
            startIcon={<ChevronLeftRoundedIcon />}
            onClick={() => onMonthChange(month.subtract(1, 'month'))}
          >
            Prev
          </Button>
        )}
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, textAlign: 'center' }}
        >
          {month.format('MMMM YYYY')}
        </Typography>
        {isCompact ? (
          <IconButton
            size="small"
            onClick={() => onMonthChange(month.add(1, 'month'))}
            aria-label="Next month"
          >
            <ChevronRightRoundedIcon />
          </IconButton>
        ) : (
          <Button
            size="small"
            endIcon={<ChevronRightRoundedIcon />}
            onClick={() => onMonthChange(month.add(1, 'month'))}
          >
            Next
          </Button>
        )}
      </Box>

      <Grid container columns={7} spacing={{ xs: 0.25, sm: 0.5 }} sx={{ mb: 1 }}>
        {weekdayLabels.map((d, i) => (
          <Grid key={`${d}-${i}`} size={1}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              align="center"
              display="block"
              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
            >
              {d}
            </Typography>
          </Grid>
        ))}
      </Grid>

      <Grid container columns={7} spacing={{ xs: 0.25, sm: 0.5 }}>
        {cells.map(({ date, inMonth }) => {
          const selected = selectedDate ? date.isSame(selectedDate, 'day') : false;
          const iso = date.format('YYYY-MM-DD');

          return (
            <Grid key={iso} size={1}>
              <Box
                onClick={() => onDateSelect(date)}
                sx={{
                  minHeight: { xs: 52, sm: 64, md: 72 },
                  p: { xs: 0.5, sm: 0.75 },
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: selected ? 'secondary.main' : 'divider',
                  bgcolor: selected ? 'action.selected' : 'background.paper',
                  cursor: 'pointer',
                  opacity: inMonth ? 1 : 0.45,
                  transition: 'border-color 0.15s, background-color 0.15s',
                  '&:hover': { borderColor: 'secondary.light', bgcolor: 'action.hover' },
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={selected ? 700 : 500}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: { xs: 20, sm: 22 },
                    height: { xs: 20, sm: 22 },
                    borderRadius: '50%',
                    bgcolor: selected ? 'secondary.main' : 'transparent',
                    color: selected ? 'secondary.contrastText' : 'text.primary',
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  }}
                >
                  {date.date()}
                </Typography>
                {renderCell ? renderCell({ date, inMonth, selected }) : null}
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {legend ? <Box sx={{ mt: 2 }}>{legend}</Box> : null}
    </Box>
  );
}
