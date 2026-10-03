import { useState } from 'react';
import {
  Box,
  Collapse,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import dayjs from 'dayjs';
import { formatDaysCount } from '../utils/displayFormat';

/**
 * @param {{
 *   items: {
 *     id?: string,
 *     employeeName: string,
 *     employeeCode?: string,
 *     designation?: string | null,
 *     location?: string | null,
 *     days: number | string,
 *     from: string,
 *     to: string,
 *     durationLabel?: string,
 *   }[],
 *   defaultExpanded?: boolean,
 * }} props
 */
export function LeaveTransactionList({ items, defaultExpanded = true }) {
  const [open, setOpen] = useState(defaultExpanded);
  const rows = Array.isArray(items) ? items : [];

  const rowKey = (t, index) =>
    t.id || `${t.employeeName}-${t.from}-${t.to}-${index}`;

  const formatFromToDate = (from, to) => {
    if (from === to) return dayjs(from).format('DD MMM');
    return `${dayjs(from).format('DD MMM')} – ${dayjs(to).format('DD MMM')}`;
  };

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        onClick={() => setOpen((v) => !v)}
        sx={{ cursor: 'pointer', mb: open ? 1 : 0 }}
      >
        <Typography variant="subtitle2" fontWeight={700} sx={{ m: 0 }}>
          Leave Transactions ({rows.length})
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
            No Employees are on leave
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
                sx={{ flex: 1.6 }}
              >
                Employee
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                sx={{ flex: 0.7, textAlign: 'center' }}
              >
                Number of days
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                sx={{ flex: 0.9, textAlign: 'right' }}
              >
                From-To
              </Typography>
            </Stack>

            <Stack spacing={1} sx={{ mt: 1 }}>
              {rows.map((t, index) => {
                const meta = [t.location, t.designation].filter(Boolean).join(', ');
                return (
                  <Box
                    key={rowKey(t, index)}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      px: 1.25,
                      py: 1,
                    }}
                  >
                    <Stack direction="row" alignItems="flex-start" spacing={1}>
                      <Box sx={{ flex: 1.6, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            m: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={t.employeeName}
                        >
                          {t.employeeName}
                          {t.employeeCode ? (
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                              fontWeight={400}
                            >
                              {' '}
                              (#{t.employeeCode})
                            </Typography>
                          ) : null}
                        </Typography>
                        {meta ? (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={meta}
                          >
                            {meta}
                          </Typography>
                        ) : null}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ flex: 0.7, textAlign: 'center', pt: 0.25 }}
                      >
                        {formatDaysCount(t.days, { unit: false })}
                      </Typography>
                      <Box sx={{ flex: 0.9, textAlign: 'right' }}>
                        <Typography variant="body2" fontWeight={500} sx={{ m: 0 }}>
                          {formatFromToDate(t.from, t.to)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t.durationLabel || 'Full Day'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        )}
      </Collapse>
    </Box>
  );
}
