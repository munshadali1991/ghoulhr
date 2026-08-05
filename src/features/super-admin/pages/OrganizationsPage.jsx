import {
  Button,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { PageCard } from '@/shared/components/ui/PageCard';
import { CrudButton } from '@/shared/components/ui/CrudButton';
import { MobileDataCard } from '@/shared/components/data/MobileDataCard';
import { TableRowActions } from '@/shared/components/data/TableRowActions';
import { useIsMobileLayout } from '@/shared/hooks/useIsMobileLayout';
import RestoreFromTrashRoundedIcon from '@mui/icons-material/RestoreFromTrashRounded';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatSubscriptionType } from '@/features/super-admin/utils/subscriptionPeriodUtils';

function subscriptionChip(org) {
  const summary = org.subscriptionSummary;
  if (!summary) {
    return { label: 'No plan', color: 'warning' };
  }
  if (summary.isValid) {
    const typeLabel = summary.type ? formatSubscriptionType(summary.type) : 'Active';
    return { label: typeLabel, color: 'success' };
  }
  if (summary.reason === 'missing') {
    return { label: 'No plan', color: 'warning' };
  }
  if (summary.reason === 'expired') {
    return { label: 'Expired', color: 'error' };
  }
  return { label: 'Inactive', color: 'default' };
}

function subdomainLabel(org) {
  return `${org.subdomain}.ghoulhr.com`;
}

function StatusChip({ status }) {
  return (
    <Chip
      size="small"
      label={status}
      color={status === 'ACTIVE' ? 'success' : 'warning'}
      variant="outlined"
    />
  );
}

function SubscriptionChip({ org }) {
  const subChip = subscriptionChip(org);
  return (
    <Chip
      size="small"
      label={subChip.label}
      color={subChip.color}
      variant="outlined"
    />
  );
}

export function OrganizationsPage({
  organizations,
  deletedOrganizations,
  isLoading,
  error: _error,
  search,
  onSearchChange,
  onEdit: _onEdit,
  onDelete,
  onRestore,
}) {
  const navigate = useNavigate();
  const isMobileLayout = useIsMobileLayout();
  const filteredOrganizations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return organizations;
    }
    return organizations.filter((org) => {
      return (
        org.name?.toLowerCase().includes(query) ||
        org.subdomain?.toLowerCase().includes(query)
      );
    });
  }, [organizations, search]);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Stack spacing={2}>
          <PageCard>
            <CardContent>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
                mb={2}
              >
                <Typography variant="h6" fontWeight={700}>
                  Organizations
                </Typography>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.2}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  <TextField
                    size="small"
                    label="Search org"
                    value={search}
                    onChange={onSearchChange}
                    fullWidth={isMobileLayout}
                    sx={{ minWidth: { sm: 200 } }}
                  />
                  <CrudButton
                    intent="create"
                    onClick={() => navigate('/organizations/new')}
                    sx={{ width: { xs: '100%', sm: 'auto' }, flexShrink: 0 }}
                  >
                    Add Organization
                  </CrudButton>
                </Stack>
              </Stack>

              {isLoading ? (
                <Stack direction="row" justifyContent="center" py={4}>
                  <CircularProgress size={30} />
                </Stack>
              ) : isMobileLayout ? (
                <Stack spacing={1.5}>
                  {filteredOrganizations.map((org) => (
                    <MobileDataCard
                      key={org.id}
                      fields={[
                        { label: 'Name', value: org.name },
                        {
                          label: 'Subdomain',
                          value: (
                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                              {subdomainLabel(org)}
                            </Typography>
                          ),
                        },
                        { label: 'Status', value: <StatusChip status={org.status} /> },
                        { label: 'Subscription', value: <SubscriptionChip org={org} /> },
                      ]}
                      actions={
                        <TableRowActions
                          onEdit={() => navigate(`/organizations/${org.id}/edit`)}
                          onDelete={() => onDelete(org.id)}
                        />
                      }
                    />
                  ))}
                  {filteredOrganizations.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                      No organizations found
                    </Typography>
                  ) : null}
                </Stack>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 720 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Subdomain</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Subscription</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredOrganizations.map((org) => (
                        <TableRow key={org.id} hover>
                          <TableCell>{org.name}</TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap title={subdomainLabel(org)}>
                              {subdomainLabel(org)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <StatusChip status={org.status} />
                          </TableCell>
                          <TableCell>
                            <SubscriptionChip org={org} />
                          </TableCell>
                          <TableCell align="right" className="table-actions-cell">
                            <TableRowActions
                              onEdit={() => navigate(`/organizations/${org.id}/edit`)}
                              onDelete={() => onDelete(org.id)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredOrganizations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            No organizations found
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </PageCard>

          <PageCard>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Recycle Bin (Soft Deleted Organizations)
              </Typography>
              {isMobileLayout ? (
                <Stack spacing={1.5}>
                  {deletedOrganizations.map((org) => (
                    <MobileDataCard
                      key={org.id}
                      fields={[
                        { label: 'Name', value: org.name },
                        {
                          label: 'Subdomain',
                          value: (
                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                              {subdomainLabel(org)}
                            </Typography>
                          ),
                        },
                        {
                          label: 'Deleted At',
                          value: org.deletedAt ? new Date(org.deletedAt).toLocaleString() : '-',
                        },
                      ]}
                      actions={
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<RestoreFromTrashRoundedIcon />}
                          onClick={() => onRestore(org.id)}
                        >
                          Restore
                        </Button>
                      }
                    />
                  ))}
                  {deletedOrganizations.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                      Recycle bin is empty
                    </Typography>
                  ) : null}
                </Stack>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 560 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Subdomain</TableCell>
                        <TableCell>Deleted At</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {deletedOrganizations.map((org) => (
                        <TableRow key={org.id} hover>
                          <TableCell>{org.name}</TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap title={subdomainLabel(org)}>
                              {subdomainLabel(org)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {org.deletedAt ? new Date(org.deletedAt).toLocaleString() : '-'}
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<RestoreFromTrashRoundedIcon />}
                              onClick={() => onRestore(org.id)}
                            >
                              Restore
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {deletedOrganizations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            Recycle bin is empty
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </PageCard>
        </Stack>
      </Grid>
    </Grid>
  );
}
