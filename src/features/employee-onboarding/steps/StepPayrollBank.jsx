import {
  Box,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { BANK_VERIFICATION_OPTIONS, TAX_REGIME_OPTIONS } from '../constants';

function maskAccount(v) {
  if (!v || v.length < 4) return v ? '••••' : '';
  return `•••• •••• •••• ${v.slice(-4)}`;
}

export function StepPayrollBank() {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext();
  const acct = watch('bank.accountNumber');

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="overline" color="primary" fontWeight={700}>
          Step 3
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          Payroll & bank
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Compensation and payout details. Account number is masked in the UI; full value is encrypted at rest.
        </Typography>
      </Box>

      <Typography variant="subtitle2" fontWeight={700}>
        Payroll
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="payroll.ctc"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth type="number" label="CTC (annual)" inputProps={{ min: 0, step: 1000 }} />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="payroll.salaryStructure"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth label="Salary structure" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="payroll.taxRegime"
            control={control}
            render={({ field }) => (
              <TextField {...field} select fullWidth label="Tax regime">
                {TAX_REGIME_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="payroll.basicSalary"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth type="number" label="Basic salary" inputProps={{ min: 0, step: 100 }} />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="payroll.hra"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth type="number" label="HRA" inputProps={{ min: 0, step: 100 }} />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="payroll.allowancesJson"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                minRows={2}
                label="Allowances (JSON)"
                placeholder='{"lta": 5000}'
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="payroll.pfApplicable"
            control={control}
            render={({ field }) => (
              <FormControlLabel control={<Switch checked={!!field.value} onChange={(_, c) => field.onChange(c)} />} label="PF applicable" />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="payroll.esicApplicable"
            control={control}
            render={({ field }) => (
              <FormControlLabel control={<Switch checked={!!field.value} onChange={(_, c) => field.onChange(c)} />} label="ESIC applicable" />
            )}
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>
        Bank details
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="bank.accountHolderName"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth label="Account holder name" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="bank.bankName"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth label="Bank name" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="bank.accountNumber"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Account number"
                type="password"
                autoComplete="new-password"
                helperText={acct ? `Masked: ${maskAccount(acct)}` : ''}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="bank.confirmAccountNumber"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Confirm account number"
                type="password"
                error={!!errors.bank?.confirmAccountNumber}
                helperText={errors.bank?.confirmAccountNumber?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="bank.ifscCode"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth label="IFSC code" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="bank.branchName"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth label="Branch name" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="bank.verificationStatus"
            control={control}
            render={({ field }) => (
              <TextField {...field} select fullWidth label="Verification status">
                {BANK_VERIFICATION_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
