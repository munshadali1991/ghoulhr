import { useEffect, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { APP_NAME } from '@/app/config/appConfig';

/**
 * In-page ink greeting strip (Design.md topbar content; does not replace TenantLayout).
 * @param {{ greeting: string, userName?: string }} props
 */
export function HomeGreetingBar({ greeting, userName }) {
  const [now, setNow] = useState(() => dayjs());

  useEffect(() => {
    const id = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(id);
  }, []);

  const title = [greeting, userName].filter(Boolean).join(', ');

  return (
    <Box
      sx={{
        mx: { xs: -2, md: -3 },
        mt: { xs: -2, md: -3 },
        mb: 3.25,
        px: { xs: 2, sm: 3.5 },
        py: { xs: 2.5, sm: 2.75 },
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        borderBottom: 3,
        borderColor: 'warning.main',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2.5}
        sx={{ maxWidth: 1280, mx: 'auto', width: '100%' }}
      >
        <Box>
          <Typography
            sx={{
              m: 0,
              mb: 0.4,
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(174, 185, 214, 0.95)',
            }}
          >
            {APP_NAME} · home
          </Typography>
          <Typography
            component="h1"
            sx={{
              m: 0,
              fontWeight: 600,
              fontSize: { xs: 20, sm: 24 },
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={{ xs: 3, sm: 3.25 }}
          alignItems="center"
          sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}
        >
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Typography
              sx={{
                m: 0,
                mb: 0.25,
                fontSize: 11,
                letterSpacing: '0.04em',
                color: 'rgba(174, 185, 214, 0.95)',
              }}
            >
              Today
            </Typography>
            <Typography
              sx={{
                m: 0,
                fontWeight: 600,
                fontSize: { xs: 16, sm: 19 },
                letterSpacing: '0.01em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {now.format('ddd, DD MMM YYYY')}
            </Typography>
          </Box>
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Typography
              sx={{
                m: 0,
                mb: 0.25,
                fontSize: 11,
                letterSpacing: '0.04em',
                color: 'rgba(174, 185, 214, 0.95)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#4FD1A5',
                  boxShadow: '0 0 0 3px rgba(79, 209, 165, 0.25)',
                  display: 'inline-block',
                }}
              />
              Local time
            </Typography>
            <Typography
              sx={{
                m: 0,
                fontWeight: 600,
                fontSize: { xs: 16, sm: 19 },
                letterSpacing: '0.01em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {now.format('HH:mm:ss')}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
