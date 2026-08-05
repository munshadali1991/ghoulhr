import { Box, IconButton, Tooltip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

/**
 * Standard icon-only table row actions (Edit / Delete / View + extras).
 *
 * @param {{
 *   onEdit?: () => void,
 *   onDelete?: () => void,
 *   onView?: () => void,
 *   editLabel?: string,
 *   deleteLabel?: string,
 *   viewLabel?: string,
 *   editDisabled?: boolean,
 *   deleteDisabled?: boolean,
 *   viewDisabled?: boolean,
 *   extra?: import('react').ReactNode,
 *   disabled?: boolean,
 *   readOnly?: boolean,
 * }} props
 */
export function TableRowActions({
  onEdit,
  onDelete,
  onView,
  editLabel = 'Edit',
  deleteLabel = 'Delete',
  viewLabel = 'View',
  editDisabled = false,
  deleteDisabled = false,
  viewDisabled = false,
  extra,
  disabled = false,
  readOnly = false,
}) {
  if (readOnly && !onView && !extra) {
    return null;
  }

  return (
    <Box sx={{ display: 'inline-flex', gap: 0.5, alignItems: 'center' }}>
      {onView ? (
        <Tooltip title={viewLabel}>
          <span>
            <IconButton
              size="small"
              color="secondary"
              aria-label={viewLabel}
              onClick={onView}
              disabled={disabled || viewDisabled}
            >
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      ) : null}
      {!readOnly && onEdit ? (
        <Tooltip title={editLabel}>
          <span>
            <IconButton
              size="small"
              color="warning"
              aria-label={editLabel}
              onClick={onEdit}
              disabled={disabled || editDisabled}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      ) : null}
      {!readOnly && onDelete ? (
        <Tooltip title={deleteLabel}>
          <span>
            <IconButton
              size="small"
              color="error"
              aria-label={deleteLabel}
              onClick={onDelete}
              disabled={disabled || deleteDisabled}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      ) : null}
      {extra}
    </Box>
  );
}
