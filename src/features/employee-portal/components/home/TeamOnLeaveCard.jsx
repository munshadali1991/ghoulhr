import { PageCard } from '@/shared/components/ui/PageCard';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import {
  Avatar,
  Box,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { formatDaysCount } from '../../utils/displayFormat';

/**
 * @param {string[]} dates YYYY-MM-DD sorted
 * @returns {string}
 */
function formatLeaveDatesLabel(dates = []) {
  if (!dates.length) return '';

  const parsed = dates.map((d) => dayjs(d));
  const sameMonth = parsed.every(
    (d) => d.month() === parsed[0].month() && d.year() === parsed[0].year(),
  );

  if (sameMonth) {
    const days = parsed.map((d) => d.date()).join(', ');
    return `${days} ${parsed[0].format('MMM')}`;
  }

  return parsed.map((d) => d.format('D MMM')).join(', ');
}

function InitialsAvatar({ initials, tone = 'neutral', size = 36 }) {
  const isAccent = tone === 'accent';
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        typography: 'caption',
        fontWeight: 600,
        bgcolor: 'background.paper',
        color: 'text.primary',
        border: '1.5px solid',
        borderColor: isAccent
          ? (t) =>
              t.palette.mode === 'dark'
                ? 'rgba(251, 146, 60, 0.55)'
                : 'rgba(251, 146, 60, 0.65)'
          : 'divider',
        flexShrink: 0,
      }}
    >
      {initials}
    </Avatar>
  );
}

function SectionHeading({ children }) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ m: 0, mb: 1.25, fontWeight: 500 }}
    >
      {children}
    </Typography>
  );
}

/**
 * Home widget: people in RBAC access scope with APPROVED leave today / this month.
 * @param {{
 *   data?: {
 *     hasTeam: boolean,
 *     today: Array<{ employeeId: string, name: string, employeeCode: string, initials: string }>,
 *     thisMonth: Array<{
 *       employeeId: string,
 *       name: string,
 *       employeeCode: string,
 *       initials: string,
 *       days: number,
 *       dates: string[],
 *     }>,
 *     timezone?: string,
 *   },
 *   isLoading?: boolean,
 *   error?: Error | null,
 * }} props
 */
export function TeamOnLeaveCard({ data, isLoading = false, error = null }) {
  const navigate = useNavigate();

  const today = data?.today ?? [];
  const thisMonth = data?.thisMonth ?? [];

  return (
    <PageCard
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 2.5, sm: 3 },
        overflow: 'auto',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2.5 }}
      >
        <Typography variant="subtitle1" sx={{ m: 0, fontWeight: 700 }}>
          Team On Leave
        </Typography>
        <IconButton
          size="small"
          aria-label="Open Team On Leave"
          onClick={() => navigate('/leave/team-on-leave')}
          sx={{ color: 'text.secondary' }}
        >
          <ArrowForwardRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Stack>

      {isLoading ? (
        <Stack spacing={2.5}>
          <Box>
            <Skeleton width={80} height={20} sx={{ mb: 1 }} />
            <Stack direction="row" spacing={1}>
              <Skeleton variant="circular" width={36} height={36} />
              <Skeleton variant="circular" width={36} height={36} />
            </Stack>
          </Box>
          <Box>
            <Skeleton width={110} height={20} sx={{ mb: 1 }} />
            <Skeleton variant="rounded" height={48} />
          </Box>
        </Stack>
      ) : error ? (
        <Typography variant="body2" color="error">
          {error.message ?? 'Could not load team leave'}
        </Typography>
      ) : (
        <Stack spacing={2.75} sx={{ flex: 1, minHeight: 0 }}>
          <Box>
            <SectionHeading>Today ({today.length})</SectionHeading>
            {today.length === 0 ? (
              <Typography variant="body2" color="text.disabled">
                No one on leave today
              </Typography>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {today.map((person) => (
                  <InitialsAvatar
                    key={person.employeeId}
                    initials={person.initials}
                    tone="neutral"
                  />
                ))}
              </Stack>
            )}
          </Box>

          <Box>
            <SectionHeading>This Month ({thisMonth.length})</SectionHeading>
            {thisMonth.length === 0 ? (
              <Typography variant="body2" color="text.disabled">
                No team leave this month
              </Typography>
            ) : (
              <Stack spacing={1.75}>
                {thisMonth.map((person) => (
                  <Stack
                    key={person.employeeId}
                    direction="row"
                    alignItems="center"
                    spacing={1.35}
                  >
                    <InitialsAvatar
                      initials={person.initials}
                      tone="accent"
                      size={40}
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          m: 0,
                          fontWeight: 600,
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={person.name || undefined}
                      >
                        {person.name || 'Employee'}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ m: 0, display: 'block', mt: 0.2 }}
                      >
                        {person.employeeCode
                          ? `(#${person.employeeCode})`
                          : null}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', flexShrink: 0, maxWidth: '45%' }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ m: 0, display: 'block', fontWeight: 500 }}
                      >
                        {formatDaysCount(person.days)}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{
                          m: 0,
                          display: 'block',
                          mt: 0.2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={formatLeaveDatesLabel(person.dates)}
                      >
                        {formatLeaveDatesLabel(person.dates)}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      )}
    </PageCard>
  );
}
