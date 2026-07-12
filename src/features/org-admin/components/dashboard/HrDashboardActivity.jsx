import { Box, Skeleton, Stack, Typography } from '@mui/material';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { PageCard } from '@/shared/components/ui/PageCard';
import { DashboardEyebrow } from './DashboardEyebrow';

dayjs.extend(relativeTime);

/**
 * @param {{
 *   items?: Array<{
 *     id: string,
 *     message: string,
 *     actorName: string,
 *     createdAt: string,
 *   }>,
 *   isLoading?: boolean,
 * }} props
 */
export function HrDashboardActivity({ items = [], isLoading = false }) {
  return (
    <PageCard sx={{ height: '100%', p: { xs: 2.5, sm: 3 } }}>
      <DashboardEyebrow icon={<HistoryRoundedIcon />}>Recent activity</DashboardEyebrow>

      {isLoading ? (
        <Stack spacing={1.5}>
          <Skeleton variant="rounded" height={52} />
          <Skeleton variant="rounded" height={52} />
          <Skeleton variant="rounded" height={52} />
        </Stack>
      ) : items.length === 0 ? (
        <Box
          sx={{
            py: 3,
            px: 1,
            borderRadius: 1.5,
            border: '1px dashed',
            borderColor: 'divider',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            No recent activity
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Updates will appear here as your team uses the system.
          </Typography>
        </Box>
      ) : (
        <Stack
          spacing={0}
          divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}
        >
          {items.map((item) => (
            <Box key={item.id} sx={{ py: 1.5 }}>
              <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.4 }}>
                {item.message}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.35 }}>
                {item.actorName || 'System'} · {dayjs(item.createdAt).fromNow()}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}
    </PageCard>
  );
}
