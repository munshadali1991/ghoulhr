import { Tooltip, Typography } from '@mui/material';

/**
 * @param {{ value: unknown, maxWidth?: number }} props
 */
export function EllipsisCell({ value, maxWidth = 160 }) {
  const s = value == null || value === '' ? '—' : String(value);

  return (
    <Tooltip title={s === '—' ? '' : s} placement="top-start" enterDelay={400}>
      <Typography
        variant="body2"
        noWrap
        sx={{ maxWidth: { xs: 120, sm: maxWidth }, display: 'block' }}
      >
        {s}
      </Typography>
    </Tooltip>
  );
}
