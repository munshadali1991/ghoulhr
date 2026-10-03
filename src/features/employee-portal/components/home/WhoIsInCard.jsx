import {
  Avatar,
  Box,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useNavigate } from 'react-router-dom';
import { PageCard } from '@/shared/components/ui/PageCard';

const SECTIONS = [
  {
    key: 'notYetIn',
    title: 'Not Yet In',
    empty: "We couldn't find your team around",
  },
  {
    key: 'lateArrivals',
    title: 'Late Arrivals',
    empty: "Team's on the way",
  },
  {
    key: 'onTime',
    title: 'On Time',
    empty: 'No one on time yet',
  },
];

/**
 * @param {{
 *   data?: object,
 *   isLoading?: boolean,
 *   error?: Error | null,
 * }} props
 */
export function WhoIsInCard({ data, isLoading = false, error = null }) {
  const navigate = useNavigate();

  const lists = {
    notYetIn: data?.notYetIn ?? [],
    lateArrivals: data?.lateArrivals ?? [],
    onTime: data?.onTime ?? [],
  };

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
          Who is in?
        </Typography>
        <IconButton
          size="small"
          aria-label="Open Who is in"
          onClick={() => navigate('/attendance/who-is-in')}
          sx={{ color: 'text.secondary' }}
        >
          <ArrowForwardRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Stack>

      {isLoading ? (
        <Stack spacing={2}>
          <Skeleton height={48} />
          <Skeleton height={48} />
          <Skeleton height={48} />
        </Stack>
      ) : error ? (
        <Typography variant="body2" color="error">
          {error.message ?? 'Could not load Who is in'}
        </Typography>
      ) : (
        <Stack spacing={2.5}>
          {SECTIONS.map((section) => {
            const people = lists[section.key];
            return (
              <Box key={section.key}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ m: 0, mb: 1, fontWeight: 500 }}
                >
                  {section.title}
                  {people.length > 0 ? ` (${people.length})` : ''}
                </Typography>
                {people.length === 0 ? (
                  <Typography variant="body2" color="text.disabled">
                    {section.empty}
                  </Typography>
                ) : (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {people.slice(0, 8).map((p) => (
                      <Avatar
                        key={p.employeeId}
                        title={p.name}
                        sx={{
                          width: 32,
                          height: 32,
                          typography: 'caption',
                          fontWeight: 600,
                          bgcolor: 'background.paper',
                          color: 'text.primary',
                          border: '1.5px solid',
                          borderColor: 'divider',
                        }}
                      >
                        {p.initials}
                      </Avatar>
                    ))}
                    {people.length > 8 ? (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ alignSelf: 'center' }}
                      >
                        +{people.length - 8}
                      </Typography>
                    ) : null}
                  </Stack>
                )}
              </Box>
            );
          })}
        </Stack>
      )}
    </PageCard>
  );
}
