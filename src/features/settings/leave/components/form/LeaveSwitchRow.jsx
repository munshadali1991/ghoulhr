import { Stack, Switch, Typography } from '@mui/material';
import { Controller } from 'react-hook-form';
import { LeaveFormRow } from './LeaveFormRow';

/**
 * @param {{
 *   control: import('react-hook-form').Control<{ leaves: unknown[] }>,
 *   name: string,
 *   label: string,
 *   hint?: string,
 * }} props
 */
export function LeaveSwitchRow({ control, name, label, hint }) {
  return (
    <LeaveFormRow label={label} hint={hint}>
      <Controller
        name={name}
        control={control}
        render={({ field: f }) => (
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minHeight: 40 }}>
            <Switch size="small" checked={!!f.value} onChange={(e) => f.onChange(e.target.checked)} />
            <Typography variant="body2" color="text.secondary">
              {f.value ? 'On' : 'Off'}
            </Typography>
          </Stack>
        )}
      />
    </LeaveFormRow>
  );
}
