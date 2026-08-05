import { Box, Typography } from '@mui/material';

/**
 * @param {{
 *   fields: { label: string, value: import('react').ReactNode }[],
 *   onClick?: () => void,
 *   actions?: import('react').ReactNode,
 *   sx?: object,
 * }} props
 */
export function MobileDataCard({ fields, onClick, actions, sx }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        p: 1.5,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default',
        cursor: onClick ? 'pointer' : 'default',
        ...sx,
      }}
    >
      {fields.map((field, i) => (
        <Box
          key={field.label}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 2,
            py: 0.5,
            borderBottom: i < fields.length - 1 || actions ? '1px solid' : 'none',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ flexShrink: 0 }}>
            {field.label}
          </Typography>
          <Box sx={{ textAlign: 'right', minWidth: 0 }}>{field.value}</Box>
        </Box>
      ))}
      {actions ? (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, pt: 1 }} onClick={(e) => e.stopPropagation()}>
          {actions}
        </Box>
      ) : null}
    </Box>
  );
}
