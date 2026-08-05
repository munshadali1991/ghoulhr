import {
  Box,
  Button,
  InputAdornment,
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
import AddIcon from '@mui/icons-material/Add';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Controller } from 'react-hook-form';
import { SettingsSection } from '@/shared/components/settings/SettingsSection';
import { MobileDataCard } from '@/shared/components/data/MobileDataCard';
import { TableRowActions } from '@/shared/components/data/TableRowActions';
import { ActiveSwitchCell } from '@/shared/components/data/ActiveSwitchCell';
import { EmptyState } from '@/features/settings/shared';
import { DraftStatusBar } from '@/features/settings/shell/components/DraftStatusBar';
import { useIsMobileLayout } from '@/shared/hooks/useIsMobileLayout';
import {
  LEAVE_TABLE_COLUMNS,
  LEAVE_TABLE_CONTAINER_SX,
  LEAVE_TABLE_HEADER_CELL_SX,
} from '../constants';
import { accrualLabel, workflowLabel } from '../utils/leaveMappers';

function cellText(value) {
  const v = typeof value === 'string' ? value.trim() : value;
  if (v === null || v === undefined || v === '') return '—';
  return String(v);
}

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
 *   control: import('react-hook-form').Control<{ leaves: unknown[] }>,
 *   isDirty: boolean,
 *   isUpdating?: boolean,
 *   onAdd: () => void,
 *   onRowClick: (index: number) => void,
 *   onRemove: (index: number) => void,
 *   onSave?: () => void,
 *   onDiscard?: () => void,
 *   readOnly?: boolean,
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
  control,
  isDirty,
  isUpdating = false,
  onAdd,
  onRowClick,
  onRemove,
  onSave,
  onDiscard,
  readOnly = false,
}) {
  const isMobileLayout = useIsMobileLayout();

  const rowActions = (fieldIndex) => (
    <TableRowActions
      readOnly={readOnly}
      onEdit={readOnly ? undefined : () => onRowClick(fieldIndex)}
      onDelete={readOnly || !onRemove ? undefined : () => onRemove(fieldIndex)}
      deleteDisabled={fields.length <= 1}
      deleteLabel={fields.length <= 1 ? 'At least one leave type is required' : 'Delete'}
      editLabel="Edit leave type"
    />
  );

  const renderMobile = () => (
    <Stack spacing={1.5}>
      {filteredDisplayIndices.map((fieldIndex, displayIndex) => {
        const row = watchedLeaves[fieldIndex] || {};
        return (
          <MobileDataCard
            key={fields[fieldIndex].id}
            onClick={() => onRowClick(fieldIndex)}
            fields={[
              { label: '#', value: displayIndex + 1 },
              { label: 'Name', value: cellText(row.name) },
              { label: 'Code', value: cellText(row.code) },
              { label: 'Location', value: locationNameById.get(row.locationId) || '—' },
              { label: 'Days/yr', value: row.annualEntitlementDays ?? 0 },
              { label: 'Accrual', value: accrualLabel(row.accrualType) },
              { label: 'Paid', value: row.isPaid !== false ? 'Yes' : 'No' },
              {
                label: 'Active',
                value: (
                  <Controller
                    name={`leaves.${fieldIndex}.isActive`}
                    control={control}
                    render={({ field: f }) => (
                      <ActiveSwitchCell
                        checked={f.value !== false}
                        onChange={(next) => f.onChange(next)}
                        disabled={readOnly}
                        ariaLabel={`Active for leave type ${displayIndex + 1}`}
                      />
                    )}
                  />
                ),
              },
              { label: 'Approval', value: workflowLabel(row.approvalWorkflowPreset) },
            ]}
            actions={rowActions(fieldIndex)}
          />
        );
      })}
    </Stack>
  );

  const renderTable = () => (
    <TableContainer component={Paper} variant="outlined" sx={LEAVE_TABLE_CONTAINER_SX}>
      <Table size="small" stickyHeader sx={{ minWidth: { xs: 0, md: 960 } }}>
        <TableHead>
          <TableRow>
            {LEAVE_TABLE_COLUMNS.map((col) => (
              <TableCell
                key={col.key}
                align={col.align}
                sx={{
                  ...LEAVE_TABLE_HEADER_CELL_SX,
                  ...(col.nowrap ? { whiteSpace: 'nowrap' } : {}),
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredDisplayIndices.map((fieldIndex, displayIndex) => {
            const row = watchedLeaves[fieldIndex] || {};
            return (
              <TableRow
                key={fields[fieldIndex].id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => onRowClick(fieldIndex)}
              >
                <TableCell>{displayIndex + 1}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {cellText(row.name) === '—' ? 'Untitled' : cellText(row.name)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {cellText(row.code)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {locationNameById.get(row.locationId) || '—'}
                  </Typography>
                </TableCell>
                <TableCell align="right">{row.annualEntitlementDays ?? 0}</TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {accrualLabel(row.accrualType)}
                  </Typography>
                </TableCell>
                <TableCell>{row.isPaid !== false ? 'Yes' : 'No'}</TableCell>
                <TableCell
                  align="center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Controller
                    name={`leaves.${fieldIndex}.isActive`}
                    control={control}
                    render={({ field: f }) => (
                      <ActiveSwitchCell
                        checked={f.value !== false}
                        onChange={(next) => f.onChange(next)}
                        disabled={readOnly}
                        ariaLabel={`Active for leave type ${displayIndex + 1}`}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                    {workflowLabel(row.approvalWorkflowPreset)}
                  </Typography>
                </TableCell>
                <TableCell
                  align="right"
                  className="table-actions-cell"
                  onClick={(e) => e.stopPropagation()}
                >
                  {rowActions(fieldIndex)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <>
      <SettingsSection
        icon={<PolicyOutlinedIcon color="primary" />}
        title="Leave types"
        description="Table view stays compact at scale. Scroll inside the table to review many policies."
        actions={
          onAdd && !readOnly ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={onAdd}
              type="button"
            >
              Add leave type
            </Button>
          ) : null
        }
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search by leave name, code, or location..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          {policyCount} {policyCount === 1 ? 'policy' : 'policies'} across {locationCount} location
          {locationCount === 1 ? '' : 's'}
        </Typography>

        {filteredDisplayIndices.length === 0 ? (
          searchQuery.trim() ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No leave types match your search
            </Typography>
          ) : (
            <Box>
              <EmptyState
                title="No leave types yet"
                description="Add your first leave policy for a location. Saving publishes all policies together."
              />
              {onAdd && !readOnly ? (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={onAdd}
                    type="button"
                  >
                    Add leave type
                  </Button>
                </Box>
              ) : null}
            </Box>
          )
        ) : isMobileLayout ? (
          renderMobile()
        ) : (
          renderTable()
        )}
      </SettingsSection>

      {!readOnly && onSave && onDiscard ? (
        <DraftStatusBar
          hasChanges={isDirty}
          isPublishing={isUpdating}
          onPublish={onSave}
          onDiscard={onDiscard}
          changeCount={1}
          maxWidth={1200}
          publishLabel="Save changes"
          publishingLabel="Saving..."
          statusText="Unsaved leave policy changes — Save publishes all leave types."
        />
      ) : null}

      {isDirty ? <Box sx={{ height: 72 }} /> : null}
    </>
  );
}
