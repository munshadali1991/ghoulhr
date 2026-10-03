import { Box, Chip, Stack, Typography } from '@mui/material';

/**
 * @param {{
 *   claim: {
 *     claimNumber?: string,
 *     title?: string,
 *     purpose?: string,
 *     currency?: string,
 *     totalAmount?: string,
 *     status?: string,
 *     submittedAt?: string | null,
 *   },
 * }} props
 */
export function ExpenseClaimSummarySection({ claim }) {
  const submittedLabel = claim.submittedAt
    ? new Date(claim.submittedAt).toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={1}
        sx={{ mb: 1.5 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Claim
          </Typography>
          <Typography variant="body1" fontWeight={700}>
            {claim.claimNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {claim.title}
          </Typography>
        </Box>
        {claim.status ? (
          <Chip
            size="small"
            label={String(claim.status).replace(/_/g, ' ')}
            color="warning"
          />
        ) : null}
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1.5,
        }}
      >
        <Field label="Total" value={`${claim.currency || 'INR'} ${claim.totalAmount}`} />
        <Field label="Submitted" value={submittedLabel} />
        <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
          <Field label="Purpose" value={claim.purpose?.trim() || '—'} />
        </Box>
      </Box>
    </Box>
  );
}

/**
 * @param {{ label: string, value: string }} props
 */
function Field({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  );
}
