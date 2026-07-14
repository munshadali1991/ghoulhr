import { Button } from '@mui/material';

/**
 * Semantic CRUD action button.
 *
 * Intent → color:
 * - create | save → green (success) — Create, Save, Submit
 * - view → blue (secondary) — View / Details
 * - edit → orange (warning) — Update / Edit
 * - delete → red (error) — Delete / Reject
 *
 * @param {{
 *   intent?: 'create' | 'save' | 'view' | 'edit' | 'delete',
 * } & import('@mui/material').ButtonProps} props
 */
export function CrudButton({ intent = 'create', variant, color, ...props }) {
  const resolved = INTENT_STYLES[intent] ?? INTENT_STYLES.create;

  return (
    <Button
      variant={variant ?? resolved.variant}
      color={color ?? resolved.color}
      {...props}
    />
  );
}

const INTENT_STYLES = {
  create: { variant: 'contained', color: 'success' },
  save: { variant: 'contained', color: 'success' },
  view: { variant: 'outlined', color: 'secondary' },
  edit: { variant: 'contained', color: 'warning' },
  delete: { variant: 'contained', color: 'error' },
};
