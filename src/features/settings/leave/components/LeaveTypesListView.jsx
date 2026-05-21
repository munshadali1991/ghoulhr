import {
  Box,
  Button,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';
import { BrandedButton } from '@/shared/components/ui/BrandedButton';
import { PageCard } from '@/shared/components/ui/PageCard';
import { accrualLabel, workflowLabel } from '../utils/leaveMappers';

/**
 * @param {{
 *   policyCount: number,
 *   locationCount: number,
 *   searchQuery: string,
 *   onSearchChange: (value: string) => void,
 *   fields: { id: string }[],
 *   watchedLeaves: Record<string, unknown>[],
 *   filteredDisplayIndices: number[],
 *   locationNameById: Map<string, string>,
 *   isDirty: boolean,
 *   onAdd: () => void,
 *   onRowClick: (index: number) => void,
 *   onRemove: (index: number) => void,
 * }} props
 */
export function LeaveTypesListView({
  policyCount,
  locationCount,
  searchQuery,
  onSearchChange,
  fields,
  watchedLeaves,
  filteredDisplayIndices,
  locationNameById,
  isDirty,
  onAdd,
  onRowClick,
  onRemove,
}) {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'flex-start' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Leave types
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {policyCount} {policyCount === 1 ? 'leave' : 'leaves'} across {locationCount} location
            {locationCount === 1 ? '' : 's'}. Click a row to edit details.
          </Typography>
        </Box>
        <BrandedButton startIcon={<AddRoundedIcon />} onClick={onAdd} sx={{ alignSelf: { sm: 'center' } }}>
          Add leave type
        </BrandedButton>
      </Box>

      <PageCard sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by leave name, code, or location..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </PageCard>

      <PageCard>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 880 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell>
                  <strong>Location</strong>
                </TableCell>
                <TableCell>
                  <strong>Leave name</strong>
                </TableCell>
                <TableCell>
                  <strong>Code</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Days / yr</strong>
                </TableCell>
                <TableCell>
                  <strong>Accrual</strong>
                </TableCell>
                <TableCell>
                  <strong>Paid</strong>
                </TableCell>
                <TableCell>
                  <strong>Active</strong>
                </TableCell>
                <TableCell>
                  <strong>Approval</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDisplayIndices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {searchQuery.trim()
                        ? 'No leave types match your search'
                        : 'No leave types yet — add your first policy.'}
                    </Typography>
                    {!searchQuery.trim() ? (
                      <Button variant="outlined" startIcon={<AddRoundedIcon />} sx={{ mt: 2 }} onClick={onAdd}>
                        Add leave type
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ) : (
                filteredDisplayIndices.map((fieldIndex) => {
                  const r = watchedLeaves[fieldIndex] || {};
                  const locName = locationNameById.get(r.locationId) || '—';
                  return (
                    <TableRow
                      key={fields[fieldIndex].id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => onRowClick(fieldIndex)}
                    >
                      <TableCell>{locName}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {r.name?.trim() || 'Untitled'}
                        </Typography>
                      </TableCell>
                      <TableCell>{r.code?.trim() || '—'}</TableCell>
                      <TableCell align="right">{r.annualEntitlementDays ?? 0}</TableCell>
                      <TableCell>{accrualLabel(r.accrualType)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={r.isPaid !== false ? 'Yes' : 'No'}
                          color={r.isPaid !== false ? 'primary' : 'default'}
                          variant={r.isPaid !== false ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={r.isActive !== false ? 'Yes' : 'No'}
                          color={r.isActive !== false ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }} noWrap>
                        {workflowLabel(r.approvalWorkflowPreset)}
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Delete">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={fields.length <= 1}
                              onClick={() => onRemove(fieldIndex)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </PageCard>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
        <PolicyOutlinedIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary">
          {isDirty
            ? 'You have unsaved changes — open a leave type and click Save to publish.'
            : 'All changes saved.'}
        </Typography>
      </Stack>
    </>
  );
}
