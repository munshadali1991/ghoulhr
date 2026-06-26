import { ToggleButton, ToggleButtonGroup } from '@mui/material';

/**
 * @param {{
 *   value: string,
 *   options: { value: string, label: string }[],
 *   onChange: (value: string) => void,
 *   sx?: object,
 * }} props
 */
export function SegmentedTabs({ value, options, onChange, sx }) {
  return (
    <ToggleButtonGroup
      exclusive
      value={value}
      onChange={(_, next) => {
        if (next) onChange(next);
      }}
      sx={[
        {
          width: '100%',
          display: 'flex',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          '& .MuiToggleButton-root': {
            flex: 1,
            px: { xs: 1, sm: 3 },
            py: 0.75,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: { xs: '0.75rem', sm: 'inherit' },
            border: 'none',
            borderRadius: '4px !important',
            color: 'text.secondary',
            '&.Mui-selected': {
              bgcolor: 'secondary.main',
              color: 'secondary.contrastText',
              '&:hover': { bgcolor: 'secondary.dark' },
            },
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {options.map((opt) => (
        <ToggleButton key={opt.value} value={opt.value}>
          {opt.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
