import {
  Box,
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
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import RestoreFromTrashRoundedIcon from '@mui/icons-material/RestoreFromTrashRounded';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

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
                mb={2}
              >
                <Typography variant="h6" fontWeight={700}>
                  Organizations
                </Typography>
                <Stack direction="row" spacing={1.2}>
                  <TextField
                    size="small"
                    label="Search org"
                    value={search}
                    onChange={onSearchChange}
                    sx={{ minWidth: { xs: '100%', sm: 200 } }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => navigate('/organizations/new')}
                  >
                    Add Organization
                  </Button>
                </Stack>
              </Stack>

              {isLoading ? (
                <Stack direction="row" justifyContent="center" py={4}>
                  <CircularProgress size={30} />
                </Stack>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Subdomain</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredOrganizations.map((org) => (
                        <TableRow key={org.id} hover>
                          <TableCell>{org.name}</TableCell>
                          <TableCell>{org.subdomain}.ghoulhr.com</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={org.status}
                              color={org.status === 'ACTIVE' ? 'success' : 'warning'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<EditRoundedIcon />}
                                onClick={() => navigate(`/organizations/${org.id}/edit`)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                startIcon={<DeleteRoundedIcon />}
                                onClick={() => onDelete(org.id)}
                              >
                                Delete
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredOrganizations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
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
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
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
                        <TableCell>{org.subdomain}.ghoulhr.com</TableCell>
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
            </CardContent>
          </PageCard>
        </Stack>
      </Grid>
    </Grid>
  );
}

