import { Box, Link, Stack, Typography } from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { PageCard } from '@/shared/components/ui/PageCard';
import { HomeCardEyebrow } from './HomeCardEyebrow';

/**
 * Decorative payslip dial matching Design.md composition (API values for period only).
 * @param {{ payslip?: { month?: string, paidDays?: number } }} props
 */
export function PayslipCard({ payslip }) {
  const month = payslip?.month || '—';
  const paidDays = payslip?.paidDays ?? 0;
  const monthShort = String(month).split(' ')[0] || month;

  return (
    <PageCard
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        p: { xs: 2.5, sm: 3 },
      }}
    >
      <HomeCardEyebrow icon={<ReceiptLongOutlinedIcon />} sx={{ alignSelf: 'flex-start' }}>
        Payslip
      </HomeCardEyebrow>
      <Typography variant="body2" color="text.secondary" sx={{ mt: -1, mb: 2, alignSelf: 'flex-start' }}>
        {month} · {paidDays} paid days
      </Typography>

      <Box
        sx={{
          position: 'relative',
          width: 118,
          height: 118,
          borderRadius: '50%',
          mb: 2,
          background: (t) =>
            `conic-gradient(${t.palette.secondary.main} 0deg 345deg, ${t.palette.warning.main} 345deg 360deg)`,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 14,
            borderRadius: '50%',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 20, lineHeight: 1 }}>{monthShort}</Typography>
          <Typography
            sx={{
              mt: 0.5,
              fontSize: 10.5,
              color: 'text.disabled',
              lineHeight: 1.3,
              textAlign: 'center',
            }}
          >
            {paidDays} paid
            <br />
            days
          </Typography>
        </Box>
      </Box>

      <Stack direction="row" spacing={2.25}>
        <Link
          component="button"
          underline="hover"
          sx={{ fontSize: 13, fontWeight: 600, color: 'secondary.main', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
        >
          <DownloadOutlinedIcon sx={{ fontSize: 15 }} />
          Download
        </Link>
        <Link
          component="button"
          underline="hover"
          sx={{ fontSize: 13, fontWeight: 600, color: 'secondary.main' }}
        >
          Show salary
        </Link>
      </Stack>
    </PageCard>
  );
}
