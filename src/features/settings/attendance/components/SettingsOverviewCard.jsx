import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

/** Read-only summary row before opening a full-page settings form. */
export function SettingsOverviewCard({ title, description, rows, onEdit }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: (theme) => theme.palette.custom.surfaces.subtle,
        }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
          {description ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 520 }}>
              {description}
            </Typography>
          ) : null}
        </Box>
        <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={onEdit}>
          Edit
        </Button>
      </Box>
      <Stack spacing={0} divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
        {rows.map((row) => (
          <Box
            key={row.label}
            sx={{
              px: { xs: 2, md: 3 },
              py: 1.75,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 0.5, sm: 4 },
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160, fontWeight: 500 }}>
              {row.label}
            </Typography>
            <Box sx={{ flex: 1 }}>{row.value}</Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
