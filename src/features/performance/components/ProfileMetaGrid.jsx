import dayjs from 'dayjs';
import { Box, Chip, Stack, Typography } from '@mui/material';

function formatDate(value) {
  if (!value) return '--';
  const d = dayjs(value);
  return d.isValid() ? d.format('DD MMM YYYY') : String(value);
}

function MetaCell({ label, value, badge }) {
  return (
    <Box sx={{ px: { xs: 1.5, md: 2 }, py: 1.25, minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}
      >
        {label}
      </Typography>
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.25 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap title={value || '--'}>
          {value || '--'}
        </Typography>
        {badge ? (
          <Chip
            label={badge}
            size="small"
            sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, '& .MuiChip-label': { px: 0.75 } }}
            color="secondary"
          />
        ) : null}
      </Stack>
    </Box>
  );
}

/**
 * Border-isolated employee metadata grid rendered above the control bar.
 * @param {{ header: object }} props
 */
export function ProfileMetaGrid({ header = {} }) {
  const cells = [
    { label: 'Name', value: header.employeeName, badge: header.employeeCode },
    { label: 'Date of Joining', value: formatDate(header.dateOfJoining) },
    { label: 'Location', value: header.location },
    { label: 'Department', value: header.department },
    { label: 'Align Manager', value: header.alignManagerName, badge: header.alignManagerCode },
  ];

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(5, minmax(0, 1fr))',
        },
        '& > *:not(:last-child)': {
          borderRight: { md: '1px solid' },
          borderBottom: { xs: '1px solid', md: 'none' },
          borderColor: { xs: 'divider', md: 'divider' },
        },
      }}
    >
      {cells.map((cell) => (
        <MetaCell key={cell.label} {...cell} />
      ))}
    </Box>
  );
}
