import { Switch, Tooltip } from '@mui/material';

/**
 * Location-directory style Active toggle for table rows.
 *
 * @param {{
 *   checked: boolean,
 *   onChange: (next: boolean) => void,
 *   disabled?: boolean,
 *   ariaLabel?: string,
 * }} props
 */
export function ActiveSwitchCell({
  checked,
  onChange,
  disabled = false,
  ariaLabel = 'Active',
}) {
  return (
    <Tooltip title={checked ? 'Active' : 'Inactive'}>
      <span>
        <Switch
          size="small"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          inputProps={{ 'aria-label': ariaLabel }}
          onClick={(e) => e.stopPropagation()}
        />
      </span>
    </Tooltip>
  );
}
