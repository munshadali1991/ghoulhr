import { ToggleButton, ToggleButtonGroup } from '@mui/material';

/**
 * Compact inner tabs — content-sized, not stretched to full width.
 *
 * @param {{
 *   value: string,
 *   options: { value: string, label: string }[],
 *   onChange: (value: string) => void,
 * }} props
 */
export function DocumentCentreSubtabs({ value, options, onChange }) {
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value}
      onChange={(_, next) => {
        if (next) onChange(next);
      }}
      sx={{
        display: 'inline-flex',
        width: 'auto',
        bgcolor: 'action.hover',
        borderRadius: 2,
        p: 0.4,
        '& .MuiToggleButton-root': {
          flex: '0 0 auto',
          px: 1.75,
          py: 0.5,
          minWidth: 0,
          textTransform: 'none',
          fontWeight: 600,
          typography: 'body2',
          border: 'none',
          borderRadius: '8px !important',
          color: 'text.secondary',
          '&.Mui-selected': {
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: 1,
            '&:hover': { bgcolor: 'background.paper' },
          },
        },
      }}
    >
      {options.map((opt) => (
        <ToggleButton key={opt.value} value={opt.value}>
          {opt.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
