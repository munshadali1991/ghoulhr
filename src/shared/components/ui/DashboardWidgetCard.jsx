import { CardContent, Stack, Typography } from '@mui/material';
import { PageCard } from './PageCard';

/**
 * Standard dashboard widget shell with consistent padding and header row.
 * @param {{
 *   title?: string;
 *   icon?: import('react').ReactNode;
 *   action?: import('react').ReactNode;
 *   children: import('react').ReactNode;
 *   sx?: import('@mui/material').SxProps;
 *   onClick?: () => void;
 * }} props
 */
export function DashboardWidgetCard({ title, icon, action, children, sx, onClick, ...cardProps }) {
  const contentPadding = { xs: 2, sm: 2.5 };

  return (
    <PageCard
      onClick={onClick}
      sx={[
        {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...cardProps}
    >
      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: contentPadding,
          '&:last-child': { pb: contentPadding },
        }}
      >
        {title || action ? (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              {icon}
              {title ? (
                <Typography variant="subtitle2" fontWeight={700}>
                  {title}
                </Typography>
              ) : null}
            </Stack>
            {action}
          </Stack>
        ) : null}
        <Stack spacing={1.5} sx={{ flex: 1 }}>
          {children}
        </Stack>
      </CardContent>
    </PageCard>
  );
}
