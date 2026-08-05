import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useIsMobileLayout } from '@/shared/hooks/useIsMobileLayout';
import { MobileDataCard } from '@/shared/components/data/MobileDataCard';

/**
 * @param {{
 *   items: { employeeName: string, days: number | string, from: string, to: string }[],
 * }} props
 */
export function LeaveTransactionList({ items }) {
  const isMobileLayout = useIsMobileLayout();

  if (isMobileLayout) {
    return (
      <Stack spacing={1.5}>
        {items.map((t) => (
          <MobileDataCard
            key={`${t.employeeName}-${t.from}`}
            fields={[
              { label: 'Employee', value: t.employeeName },
              { label: 'Days', value: t.days },
              { label: 'From – To', value: `${t.from} – ${t.to}` },
            ]}
          />
        ))}
      </Stack>
    );
  }

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 360 }}>
        <TableHead>
          <TableRow>
            <TableCell>Employee</TableCell>
            <TableCell>Days</TableCell>
            <TableCell>From-To</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((t) => (
            <TableRow key={`${t.employeeName}-${t.from}`}>
              <TableCell>{t.employeeName}</TableCell>
              <TableCell>{t.days}</TableCell>
              <TableCell>
                {t.from} – {t.to}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
