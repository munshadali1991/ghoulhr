import { Box, Stack, Typography } from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageCard } from '@/shared/components/ui/PageCard';

/**
 * @param {{
 *   leaveTypeName: string,
 *   year: number,
 *   monthlyChart: import('../types/employeePortal.types').LeaveBalanceMonthlyChartPoint[],
 * }} props
 */
export function LeaveBalanceMonthlyChart({ leaveTypeName, year, monthlyChart }) {
  const chartTitle = `${leaveTypeName}: ${year}`;

  return (
    <PageCard sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} align="center" sx={{ mb: 2 }}>
        {chartTitle}
      </Typography>
      <Box sx={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyChart} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-45} textAnchor="end" height={56} />
            <YAxis
              label={{
                value: 'Number of days',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 12 },
              }}
              allowDecimals
            />
            <Tooltip />
            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: 16 }}
            />
            <Bar dataKey="balance" name="Balance" fill="#90CAF9" radius={[2, 2, 0, 0]} />
            <Bar dataKey="consumed" name="Consumed" fill="#EF9A9A" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Stack direction="row" spacing={3} justifyContent="center" sx={{ mt: 1 }}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#90CAF9', borderRadius: 0.5 }} />
          <Typography variant="caption">Balance</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#EF9A9A', borderRadius: 0.5 }} />
          <Typography variant="caption">Consumed</Typography>
        </Stack>
      </Stack>
    </PageCard>
  );
}
