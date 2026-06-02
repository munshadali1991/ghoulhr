import { Box, IconButton, Typography } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useRef } from 'react';

const METRICS_STRIP_BG = '#FFF8E1';

/**
 * @param {{
 *   summary: import('../types/employeePortal.types').LeaveBalanceSummary,
 * }} props
 */
export function LeaveBalanceMetricsCarousel({ summary }) {
  const scrollRef = useRef(null);

  const metrics = [
    { label: 'Available Balance', value: summary.availableBalance },
    { label: 'Opening Balance', value: summary.openingBalance },
    { label: 'Granted', value: summary.granted },
    { label: 'Availed', value: summary.availed },
    { label: 'Applied', value: summary.applied },
  ];

  const scrollBy = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 200, behavior: 'smooth' });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        bgcolor: METRICS_STRIP_BG,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        mb: 2,
        overflow: 'hidden',
      }}
    >
      <IconButton
        size="small"
        onClick={() => scrollBy(-1)}
        aria-label="Scroll metrics left"
        sx={{ alignSelf: 'center', flexShrink: 0 }}
      >
        <ChevronLeftRoundedIcon />
      </IconButton>

      <Box
        ref={scrollRef}
        sx={{
          display: 'flex',
          flex: 1,
          gap: 0,
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          py: 2,
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      >
        {metrics.map((metric) => (
          <Box
            key={metric.label}
            sx={{
              minWidth: { xs: 140, sm: 160 },
              flex: '1 0 auto',
              px: 2,
              textAlign: 'center',
              borderRight: '1px solid',
              borderColor: 'divider',
              '&:last-of-type': { borderRight: 'none' },
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              {metric.label}
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {metric.value}
            </Typography>
          </Box>
        ))}
      </Box>

      <IconButton
        size="small"
        onClick={() => scrollBy(1)}
        aria-label="Scroll metrics right"
        sx={{ alignSelf: 'center', flexShrink: 0 }}
      >
        <ChevronRightRoundedIcon />
      </IconButton>
    </Box>
  );
}
