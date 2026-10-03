import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { PageCard } from '@/shared/components/ui/PageCard';
import { MobileDataCard } from '@/shared/components/data/MobileDataCard';
import { useIsMobileLayout } from '@/shared/hooks/useIsMobileLayout';
import { useLeads } from '@/features/super-admin/hooks/useLeads';

const SOURCE_FILTERS = [
  { value: 'all', label: 'All leads' },
  { value: 'contact_us', label: 'Contact us' },
  { value: 'request_for_demo', label: 'Demo requests' },
];

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

function sourceLabel(source) {
  if (source === 'contact_us') return 'Contact us';
  if (source === 'request_for_demo') return 'Demo request';
  return source;
}

function sourceChipColor(source) {
  if (source === 'contact_us') return 'info';
  if (source === 'request_for_demo') return 'secondary';
  return 'default';
}

function formatReceivedAt(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
        {value}
      </Typography>
    </Stack>
  );
}

function ContactLinks({ email, phone }) {
  return (
    <Stack spacing={0.25}>
      {email ? (
        <Link href={`mailto:${email}`} underline="hover" variant="body2">
          {email}
        </Link>
      ) : (
        <Typography variant="body2" color="text.secondary">
          —
        </Typography>
      )}
      {phone ? (
        <Link href={`tel:${phone}`} underline="hover" variant="body2" color="text.secondary">
          {phone}
        </Link>
      ) : null}
    </Stack>
  );
}

function LeadDetailsDialog({ lead, open, onClose }) {
  if (!lead) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack spacing={0.5}>
          <Typography variant="h6" fontWeight={700}>
            {lead.name}
          </Typography>
          <Chip
            size="small"
            label={sourceLabel(lead.source)}
            color={sourceChipColor(lead.source)}
            variant="outlined"
            sx={{ width: 'fit-content' }}
          />
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <DetailRow label="Company" value={lead.company} />
          <DetailRow label="Email" value={lead.email} />
          <DetailRow label="Phone" value={lead.phone || lead.mobile || lead.contact} />
          <DetailRow label="Company size" value={lead.companySize} />
          <DetailRow label="Company type" value={lead.companyType} />
          <DetailRow label="Address" value={lead.address} />
          <DetailRow
            label="Location"
            value={[lead.city, lead.country].filter(Boolean).join(', ')}
          />
          <DetailRow label="Message" value={lead.message} />
          <DetailRow label="Received" value={formatReceivedAt(lead.createdAt)} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export function LeadsPage() {
  const isMobileLayout = useIsMobileLayout();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [source, setSource] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    const next = searchInput.trim();
    if (next === debouncedSearch) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setDebouncedSearch(next);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, debouncedSearch]);

  useEffect(() => {
    setPage(0);
  }, [source]);

  const queryParams = useMemo(
    () => ({
      page: page + 1,
      limit: rowsPerPage,
      search: debouncedSearch,
      source,
    }),
    [page, rowsPerPage, debouncedSearch, source],
  );

  const { data, isLoading, isFetching, error, refetch } = useLeads(queryParams);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const counts = data?.counts ?? { all: 0, contactUs: 0, requestForDemo: 0 };

  const countForFilter = (value) => {
    if (value === 'contact_us') return counts.contactUs;
    if (value === 'request_for_demo') return counts.requestForDemo;
    return counts.all;
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <PageCard>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              All leads
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {counts.all}
            </Typography>
          </CardContent>
        </PageCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <PageCard>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Contact enquiries
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {counts.contactUs}
            </Typography>
          </CardContent>
        </PageCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <PageCard>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Demo requests
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {counts.requestForDemo}
            </Typography>
          </CardContent>
        </PageCard>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <PageCard>
          <CardContent>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', md: 'center' }}
              mb={2}
            >
              <Typography variant="h6" fontWeight={700}>
                Leads
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.2}
                sx={{ width: { xs: '100%', md: 'auto' } }}
              >
                <TextField
                  size="small"
                  placeholder="Search name, email, phone, company…"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  sx={{ minWidth: { sm: 280 } }}
                />
                <Tooltip title="Refresh">
                  <span>
                    <IconButton onClick={() => refetch()} disabled={isFetching}>
                      <RefreshRoundedIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={2}>
              {SOURCE_FILTERS.map((filter) => (
                <Chip
                  key={filter.value}
                  label={`${filter.label} (${countForFilter(filter.value)})`}
                  color={source === filter.value ? 'primary' : 'default'}
                  variant={source === filter.value ? 'filled' : 'outlined'}
                  onClick={() => setSource(filter.value)}
                  clickable
                />
              ))}
            </Stack>

            {isLoading && !data ? (
              <Stack direction="row" justifyContent="center" py={6}>
                <CircularProgress size={28} />
              </Stack>
            ) : null}

            {error ? (
              <Stack spacing={1.5} alignItems="flex-start" py={3}>
                <Typography variant="body2" color="error">
                  {error.message || 'Failed to load leads.'}
                </Typography>
                <Button variant="outlined" size="small" onClick={() => refetch()}>
                  Retry
                </Button>
              </Stack>
            ) : null}

            {!error && !isLoading && total === 0 ? (
              <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  No leads found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {debouncedSearch
                    ? 'Try a different search term or clear the source filter.'
                    : 'Contact and demo submissions will appear here.'}
                </Typography>
              </Paper>
            ) : null}

            {!error && total > 0 ? (
              <Box sx={{ opacity: isFetching ? 0.7 : 1 }}>
                {isMobileLayout ? (
                  <Stack spacing={1.25}>
                    {items.map((lead) => (
                      <MobileDataCard
                        key={lead.id}
                        fields={[
                          { label: 'Name', value: lead.name },
                          { label: 'Company', value: lead.company },
                          {
                            label: 'Source',
                            value: (
                              <Chip
                                size="small"
                                label={sourceLabel(lead.source)}
                                color={sourceChipColor(lead.source)}
                                variant="outlined"
                              />
                            ),
                          },
                          {
                            label: 'Contact',
                            value: <ContactLinks email={lead.email} phone={lead.phone} />,
                          },
                          {
                            label: 'Received',
                            value: formatReceivedAt(lead.createdAt),
                          },
                        ]}
                        actions={
                          <Button
                            size="small"
                            startIcon={<VisibilityRoundedIcon />}
                            onClick={() => setSelectedLead(lead)}
                          >
                            View
                          </Button>
                        }
                      />
                    ))}
                  </Stack>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Person / Company</TableCell>
                          <TableCell>Contact</TableCell>
                          <TableCell>Source</TableCell>
                          <TableCell>Received</TableCell>
                          <TableCell align="right">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.map((lead) => (
                          <TableRow key={lead.id} hover>
                            <TableCell>
                              <Stack spacing={0.25}>
                                <Typography variant="body2" fontWeight={600}>
                                  {lead.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {lead.company}
                                  {lead.companySize ? ` · ${lead.companySize}` : ''}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <ContactLinks email={lead.email} phone={lead.phone} />
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={sourceLabel(lead.source)}
                                color={sourceChipColor(lead.source)}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatReceivedAt(lead.createdAt)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="View details">
                                <IconButton
                                  size="small"
                                  onClick={() => setSelectedLead(lead)}
                                  aria-label={`View lead ${lead.name}`}
                                >
                                  <VisibilityRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <Divider sx={{ mt: 2 }} />
                <TablePagination
                  component="div"
                  count={total}
                  page={page}
                  onPageChange={(_event, nextPage) => setPage(nextPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                />
              </Box>
            ) : null}
          </CardContent>
        </PageCard>
      </Grid>

      <LeadDetailsDialog
        lead={selectedLead}
        open={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
      />
    </Grid>
  );
}
