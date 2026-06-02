import {
  Divider,
  FormControlLabel,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import {
  ACCRUAL_TYPES,
  APPLIES_TO_OPTIONS,
  WORKFLOW_PRESETS,
} from '../constants';
import { workflowChainLabel } from '../utils/leaveMappers';
import { LeaveFormRow } from './form/LeaveFormRow';
import { LeaveSectionCard } from './form/LeaveSectionCard';
import { LeaveSelectFormRow } from './form/LeaveSelectFormRow';
import { LeaveSwitchRow } from './form/LeaveSwitchRow';

/**
 * @param {{
 *   wizardStep: number,
 *   idx: number,
 *   row: Record<string, unknown>,
 *   register: import('react-hook-form').UseFormRegister<{ leaves: unknown[] }>,
 *   control: import('react-hook-form').Control<{ leaves: unknown[] }>,
 *   errors: import('react-hook-form').FieldErrors<{ leaves: unknown[] }>,
 *   savedLocations: { id: string, name: string, code?: string }[],
 * }} props
 */
export function LeaveWizardStepContent({
  wizardStep,
  idx,
  row,
  register,
  control,
  errors,
  savedLocations,
}) {
  if (wizardStep === 0) {
    return (
      <LeaveSectionCard title="Leave details">
        <Stack divider={<Divider flexItem />} spacing={0}>
          <LeaveFormRow label="Leave name" required>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. Sick leave"
              hiddenLabel
              inputProps={{ 'aria-label': 'Leave name' }}
              {...register(`leaves.${idx}.name`, { required: true })}
              error={!!errors.leaves?.[idx]?.name}
              helperText={errors.leaves?.[idx]?.name?.message}
            />
          </LeaveFormRow>
          <LeaveFormRow label="Leave code" hint="Short code for reports and balances">
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. SL"
              hiddenLabel
              inputProps={{ 'aria-label': 'Leave code' }}
              {...register(`leaves.${idx}.code`)}
            />
          </LeaveFormRow>
          <LeaveFormRow label="Description" hint="Optional — visible to approvers">
            <TextField
              fullWidth
              multiline
              minRows={2}
              size="small"
              placeholder="Notes for employees and approvers"
              hiddenLabel
              inputProps={{ 'aria-label': 'Description' }}
              {...register(`leaves.${idx}.description`)}
            />
          </LeaveFormRow>
          <LeaveSelectFormRow
            control={control}
            name={`leaves.${idx}.locationId`}
            label="Location"
            required
            hint="Leave applies to this location"
            rules={{ required: 'Location is required' }}
            fieldError={errors.leaves?.[idx]?.locationId?.message}
            options={savedLocations.map((loc) => ({
              value: String(loc.id),
              label: `${loc.name}${loc.code ? ` · ${loc.code}` : ''}`,
            }))}
          />
        </Stack>
      </LeaveSectionCard>
    );
  }

  if (wizardStep === 1) {
    return (
      <LeaveSectionCard title="Allocation & balance">
        <Stack divider={<Divider flexItem />} spacing={0}>
          <LeaveFormRow label="Annual allocation" hint="Days credited per year">
            <TextField
              fullWidth
              size="small"
              type="number"
              hiddenLabel
              inputProps={{ 'aria-label': 'Annual allocation', min: 0, max: 366, step: 0.5 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">days</InputAdornment>,
              }}
              {...register(`leaves.${idx}.annualEntitlementDays`, { valueAsNumber: true })}
            />
          </LeaveFormRow>
          <LeaveSelectFormRow
            control={control}
            name={`leaves.${idx}.accrualType`}
            label="Accrual type"
            hint="How entitlement is granted over time"
            options={ACCRUAL_TYPES}
          />
          <LeaveSwitchRow
            control={control}
            name={`leaves.${idx}.allowCarryForward`}
            label="Carry forward"
            hint="Allow unused balance to roll into the next period"
          />
          <LeaveFormRow label="Max carry limit" hint="Cap when carry forward is on">
            <TextField
              fullWidth
              size="small"
              type="number"
              disabled={!row.allowCarryForward}
              hiddenLabel
              inputProps={{ 'aria-label': 'Max carry limit', min: 0, max: 366, step: 0.5 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">days</InputAdornment>,
              }}
              {...register(`leaves.${idx}.maxCarryForwardDays`)}
            />
          </LeaveFormRow>
          <LeaveSwitchRow
            control={control}
            name={`leaves.${idx}.encashmentAllowed`}
            label="Encashment"
            hint="Allow converting unused leave to pay where policy allows"
          />
          <LeaveSwitchRow
            control={control}
            name={`leaves.${idx}.isPaid`}
            label="Paid leave"
            hint="Counts toward paid time off balance"
          />
        </Stack>
      </LeaveSectionCard>
    );
  }

  if (wizardStep === 2) {
    return (
      <Stack spacing={3}>
        <LeaveSectionCard title="Usage rules">
          <Stack divider={<Divider flexItem />} spacing={0}>
            <LeaveSwitchRow
              control={control}
              name={`leaves.${idx}.allowHalfDay`}
              label="Half day leave"
              hint="Employees may book half-day increments"
            />
            <LeaveSwitchRow
              control={control}
              name={`leaves.${idx}.negativeBalanceAllowed`}
              label="Negative balance"
              hint="Allow balance to go below zero when booking"
            />
            <LeaveSwitchRow
              control={control}
              name={`leaves.${idx}.requiresSupportingDocument`}
              label="Attachment needed"
              hint="Require proof (e.g. medical certificate)"
            />
            <LeaveFormRow
              label="Attachment after (days)"
              hint="Minimum consecutive leave days before an attachment is required"
            >
              <TextField
                fullWidth
                size="small"
                type="number"
                disabled={!row.requiresSupportingDocument}
                hiddenLabel
                inputProps={{
                  'aria-label': 'Attachment after days',
                  min: 0,
                  max: 365,
                  step: 1,
                }}
                {...register(`leaves.${idx}.supportingDocumentAfterDays`, {
                  valueAsNumber: true,
                })}
              />
            </LeaveFormRow>
            <LeaveFormRow
              label="Max consecutive days"
              hint="Maximum days allowed in a single leave request; leave blank for no limit"
            >
              <TextField
                fullWidth
                size="small"
                type="number"
                hiddenLabel
                inputProps={{
                  'aria-label': 'Max consecutive days',
                  min: 1,
                  max: 366,
                  step: 1,
                }}
                {...register(`leaves.${idx}.maxConsecutiveDays`, {
                  valueAsNumber: true,
                })}
              />
            </LeaveFormRow>
            <LeaveSelectFormRow
              control={control}
              name={`leaves.${idx}.appliesTo`}
              label="Applies to"
              hint="Whether this leave type applies only to the selected location, or to every location in your organization"
              options={APPLIES_TO_OPTIONS}
            />
            <LeaveSwitchRow
              control={control}
              name={`leaves.${idx}.isActive`}
              label="Policy active"
              hint="Inactive types are hidden from new bookings"
            />
          </Stack>
        </LeaveSectionCard>

        <LeaveSectionCard title="Calendar behaviour">
          <Stack divider={<Divider flexItem />} spacing={0}>
            <LeaveFormRow label="Weekends count?" hint="Whether weekend days consume leave balance">
              <Controller
                name={`leaves.${idx}.weekendsCountAsLeave`}
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    row
                    value={field.value ? 'yes' : 'no'}
                    onChange={(e) => field.onChange(e.target.value === 'yes')}
                  >
                    <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                  </RadioGroup>
                )}
              />
            </LeaveFormRow>
            <LeaveFormRow label="Holidays count?" hint="Whether public holidays consume leave balance">
              <Controller
                name={`leaves.${idx}.holidaysCountAsLeave`}
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    row
                    value={field.value ? 'yes' : 'no'}
                    onChange={(e) => field.onChange(e.target.value === 'yes')}
                  >
                    <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                  </RadioGroup>
                )}
              />
            </LeaveFormRow>
          </Stack>
        </LeaveSectionCard>
      </Stack>
    );
  }

  if (wizardStep === 3) {
    return (
      <LeaveSectionCard title="Approval workflow">
        <Stack divider={<Divider flexItem />} spacing={0}>
          <LeaveSelectFormRow
            control={control}
            name={`leaves.${idx}.approvalWorkflowPreset`}
            label="Approval chain"
            hint="Order of reviewers for this leave type"
            options={WORKFLOW_PRESETS}
          />
          <LeaveFormRow label="Preview" hint="How the chain will read to employees">
            <Paper
              variant="outlined"
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: 1,
                bgcolor: 'action.hover',
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                {workflowChainLabel(row.approvalWorkflowPreset)}
              </Typography>
            </Paper>
          </LeaveFormRow>
        </Stack>
      </LeaveSectionCard>
    );
  }

  return null;
}
