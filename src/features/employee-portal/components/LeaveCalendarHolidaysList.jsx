import { useState } from 'react';
import {
  Box,
  Collapse,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';

/**
 * @param {{
 *   holidays: {
 *     id?: string,
 *     name: string,
 *     holidayType: string,
 *     locationLabel: string,
 *   }[],
 *   defaultExpanded?: boolean,
 * }} props
 */
export function LeaveCalendarHolidaysList({ holidays, defaultExpanded = true }) {
  const [open, setOpen] = useState(defaultExpanded);
  const rows = Array.isArray(holidays) ? holidays : [];

  return (
    <Box sx={{ mt: 2.5 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        onClick={() => setOpen((v) => !v)}
        sx={{ cursor: 'pointer', mb: open ? 1 : 0 }}
      >
        <Typography variant="subtitle2" fontWeight={700} sx={{ m: 0 }}>
          Holidays
        </Typography>
        <IconButton
          size="small"
          sx={{
            transform: open ? 'rotate(180deg)' : 'none',
            transition: '0.2s',
          }}
        >
          <ExpandMoreRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Collapse in={open}>
        {rows.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
            No holidays on this date
          </Typography>
        ) : (
          <Box>
            <Stack
              direction="row"
              sx={{
                px: 1,
                py: 0.75,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                sx={{ flex: 1.2 }}
              >
                Holiday Name
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                sx={{ flex: 1 }}
              >
                Holiday Type
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                sx={{ flex: 0.9, textAlign: 'right' }}
              >
                Location
              </Typography>
            </Stack>

            <Stack spacing={1} sx={{ mt: 1 }}>
              {rows.map((h, index) => (
                <Box
                  key={h.id || `${h.name}-${index}`}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    px: 1.25,
                    py: 1,
                  }}
                >
                  <Stack direction="row" alignItems="flex-start" spacing={1}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ flex: 1.2, m: 0 }}
                    >
                      {h.name}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1 }} color="text.secondary">
                      {h.holidayType}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        flex: 0.9,
                        textAlign: 'right',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={h.locationLabel}
                    >
                      {h.locationLabel || '—'}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Collapse>
    </Box>
  );
}
