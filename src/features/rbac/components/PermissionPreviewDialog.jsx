import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { resolvePermissionPreview } from '../config/permissionPreviewRegistry';
import trackEmptyImg from '@/features/employee-portal/assets/track-empty.png';

const SAMPLE_MONTH = [
  {
    initials: 'GR',
    name: 'Gaurav Rawat',
    code: '661',
    daysLabel: '3 days',
    datesLabel: '21, 28, 31 Aug',
  },
];

function MiniHomeWireframe({ highlightLabel = 'Team On Leave' }) {
  const cells = [
    'Timesheet',
    'Shift',
    'Holidays',
    'Quick',
    'Payslip',
    'Approvals',
    highlightLabel,
    'Notices',
  ];

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        Where it appears on Employee home
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0.75,
          p: 1.25,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1.5,
          bgcolor: 'background.paper',
        }}
      >
        {cells.map((label) => {
          const highlight = label === highlightLabel;
          return (
            <Box
              key={label}
              sx={{
                border: 1,
                borderColor: highlight ? 'secondary.main' : 'divider',
                bgcolor: highlight
                  ? (t) =>
                      t.palette.mode === 'dark'
                        ? 'rgba(59, 130, 246, 0.16)'
                        : 'rgba(59, 130, 246, 0.08)'
                  : 'action.hover',
                borderRadius: 1,
                px: 0.75,
                py: 1,
                typography: 'caption',
                color: highlight ? 'secondary.main' : 'text.disabled',
                fontWeight: highlight ? 600 : 400,
                textAlign: 'center',
                gridColumn: highlight ? 'span 2' : 'span 1',
              }}
            >
              {label}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function TeamOnLeaveMockCard() {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1.5,
        p: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="subtitle2" sx={{ m: 0, mb: 2, fontWeight: 700 }}>
        Team On Leave
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Today (1)
      </Typography>
      <Avatar
        sx={{
          width: 36,
          height: 36,
          typography: 'caption',
          fontWeight: 600,
          bgcolor: 'background.paper',
          color: 'text.primary',
          border: '1.5px solid',
          borderColor: 'divider',
          mb: 2.5,
        }}
      >
        GR
      </Avatar>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
        This Month (1)
      </Typography>
      {SAMPLE_MONTH.map((person) => (
        <Stack
          key={person.code}
          direction="row"
          alignItems="center"
          spacing={1.35}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              typography: 'caption',
              fontWeight: 600,
              bgcolor: 'background.paper',
              color: 'text.primary',
              border: '1.5px solid',
              borderColor: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(251, 146, 60, 0.55)'
                  : 'rgba(251, 146, 60, 0.65)',
            }}
          >
            {person.initials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} sx={{ m: 0 }}>
              {person.name}
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ m: 0 }}>
              (#{person.code})
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              {person.daysLabel}
            </Typography>
            <Typography variant="caption" color="text.disabled" display="block">
              {person.datesLabel}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Box>
  );
}

function TrackEmptyMockCard() {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1.5,
        p: 2,
        bgcolor: 'background.paper',
        textAlign: 'center',
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ m: 0, mb: 2, fontWeight: 700, textAlign: 'left' }}
      >
        Track
      </Typography>
      <Box
        component="img"
        src={trackEmptyImg}
        alt=""
        sx={{ width: '100%', maxWidth: 180, height: 'auto', mb: 1.5 }}
      />
      <Typography variant="body2" color="text.secondary">
        All good! You&apos;ve nothing new to track.
      </Typography>
    </Box>
  );
}

function TrackListMockCard() {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1.5,
        p: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="subtitle2" sx={{ m: 0, mb: 1.5, fontWeight: 700 }}>
        Track
      </Typography>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ py: 1, borderTop: 0 }}
      >
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ m: 0 }}>
            Casual Leave
          </Typography>
          <Typography variant="caption" color="text.secondary">
            21–22 Aug 2026
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          2 days
        </Typography>
      </Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ py: 1, borderTop: 1, borderColor: 'divider' }}
      >
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ m: 0 }}>
            Sick Leave
          </Typography>
          <Typography variant="caption" color="text.secondary">
            28 Aug 2026
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          1 day
        </Typography>
      </Stack>
    </Box>
  );
}

/**
 * @param {{
 *   open: boolean,
 *   permission: import('../types/rbac.types').RbacPermission | null,
 *   onClose: () => void,
 * }} props
 */
export function PermissionPreviewDialog({ open, permission, onClose }) {
  if (!permission) return null;

  const preview = resolvePermissionPreview(permission.code, permission);
  const isTeamOnLeave = preview.previewKind === 'team-on-leave';
  const isTrack = preview.previewKind === 'track';
  const isWhoIsIn = preview.previewKind === 'who-is-in';
  const isEmployeeSwipes = preview.previewKind === 'employee-swipes';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
          {preview.title}
        </Typography>
        <Typography
          variant="caption"
          color="text.disabled"
          display="block"
          sx={{ mt: 0.5, fontFamily: 'monospace' }}
        >
          {preview.code}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          <Chip size="small" label={preview.kind} color="secondary" variant="outlined" />
          <Chip size="small" label={preview.location} variant="outlined" />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {preview.summary}
        </Typography>

        {preview.placementHint ? (
          <Typography variant="caption" color="text.disabled" display="block" sx={{ mb: 2 }}>
            Placement: {preview.placementHint}
          </Typography>
        ) : null}

        {isTeamOnLeave ? (
          <Stack spacing={2.5}>
            <MiniHomeWireframe highlightLabel="Team On Leave" />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 1, display: 'block' }}
              >
                Sample card (mock data)
              </Typography>
              <TeamOnLeaveMockCard />
            </Box>
            {preview.scopeNote ? (
              <Typography variant="caption" color="text.secondary">
                Access scope: {preview.scopeNote}
              </Typography>
            ) : null}
          </Stack>
        ) : null}

        {isTrack ? (
          <Stack spacing={2.5}>
            <MiniHomeWireframe highlightLabel="Track" />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 1, display: 'block' }}
              >
                Empty state
              </Typography>
              <TrackEmptyMockCard />
            </Box>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 1, display: 'block' }}
              >
                With pending leave (mock)
              </Typography>
              <TrackListMockCard />
            </Box>
            {preview.scopeNote ? (
              <Typography variant="caption" color="text.secondary">
                Access scope: {preview.scopeNote}
              </Typography>
            ) : null}
          </Stack>
        ) : null}

        {isWhoIsIn ? (
          <Stack spacing={2.5}>
            <MiniHomeWireframe highlightLabel="Who is in?" />
            <Box
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1.5,
                p: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                Who is in?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Not Yet In
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mb: 1.5 }}>
                We couldn&apos;t find your team around
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Late Arrivals
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mb: 1.5 }}>
                Teams on the way
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                On Time
              </Typography>
              <Typography variant="body2" color="text.disabled">
                We couldn&apos;t find your team around
              </Typography>
            </Box>
            {preview.scopeNote ? (
              <Typography variant="caption" color="text.secondary">
                Access scope: {preview.scopeNote}
              </Typography>
            ) : null}
          </Stack>
        ) : null}

        {isEmployeeSwipes ? (
          <Stack spacing={2}>
            <Box
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1.5,
                p: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Employee Swipes
              </Typography>
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ m: 0 }}>
                    Sample Employee
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    #E-0001
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="body2" fontWeight={600} sx={{ m: 0 }}>
                    17:05:33
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Web sign in
                  </Typography>
                </Box>
              </Stack>
              <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, display: 'block' }}>
                Door/Address blank · no biometric fields
              </Typography>
            </Box>
            {preview.scopeNote ? (
              <Typography variant="caption" color="text.secondary">
                Access scope: {preview.scopeNote}
              </Typography>
            ) : null}
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
