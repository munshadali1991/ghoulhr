import { Box, Button, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import { PageCard } from '@/shared/components/ui/PageCard';

/**
 * Accent-rail notice card for IT declaration / POI.
 * @param {{
 *   tone?: 'success' | 'warning',
 *   title: string,
 *   message?: string,
 *   actionLabel?: string,
 *   onAction?: () => void,
 * }} props
 */
export function HomeNoticeCard({
  tone = 'success',
  title,
  message,
  actionLabel,
  onAction,
}) {
  const isSuccess = tone === 'success';

  return (
    <PageCard
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 2,
        p: { xs: 2.5, sm: 3 },
        borderLeft: 3,
        borderLeftColor: isSuccess ? 'success.main' : 'warning.main',
        borderRadius: '0 16px 16px 0',
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          ...(isSuccess
            ? {
                bgcolor: (t) =>
                  t.palette.mode === 'dark'
                    ? 'rgba(34, 197, 94, 0.16)'
                    : 'rgba(16, 185, 129, 0.12)',
                color: 'success.dark',
              }
            : {
                bgcolor: (t) =>
                  t.palette.mode === 'dark'
                    ? 'rgba(245, 158, 11, 0.16)'
                    : 'rgba(245, 158, 11, 0.12)',
                color: 'warning.dark',
              }),
        }}
      >
        {isSuccess ? (
          <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
        ) : (
          <HourglassEmptyOutlinedIcon sx={{ fontSize: 20 }} />
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ m: 0, mb: 0.6 }}>
          {title}
        </Typography>
        {message ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              m: 0,
              mb: actionLabel ? 1.5 : 0,
              lineHeight: 1.5,
            }}
          >
            {message}
          </Typography>
        ) : null}
        {actionLabel ? (
          <Button variant="outlined" size="small" onClick={onAction} sx={{ fontWeight: 600 }}>
            {actionLabel}
          </Button>
        ) : null}
      </Box>
    </PageCard>
  );
}
