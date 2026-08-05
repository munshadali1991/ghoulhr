import { Box, Button, Card, CardContent, CircularProgress, Tooltip, Typography } from '@mui/material';
import { CrudButton } from './CrudButton';

/**
 * Sticky (or static) save bar with Discard + green Save.
 *
 * @param {{
 *   statusText: import('react').ReactNode,
 *   onSave?: () => void,
 *   onDiscard?: () => void,
 *   saveLabel?: string,
 *   discardLabel?: string,
 *   isSaving?: boolean,
 *   isDirty?: boolean,
 *   canSave?: boolean,
 *   sticky?: boolean,
 *   saveType?: 'button' | 'submit',
 *   saveTooltip?: import('react').ReactNode,
 *   hideDiscard?: boolean,
 * }} props
 */
export function StickySaveBar({
  statusText,
  onSave,
  onDiscard,
  saveLabel = 'Save changes',
  discardLabel = 'Discard',
  isSaving = false,
  isDirty = false,
  canSave = true,
  sticky = true,
  saveType = 'button',
  saveTooltip,
  hideDiscard = false,
}) {
  const saveDisabled = isSaving || !isDirty || !canSave;

  const saveButton = (
    <CrudButton
      intent="save"
      type={saveType}
      size="large"
      onClick={saveType === 'submit' ? undefined : onSave}
      disabled={saveDisabled}
      sx={{ minWidth: 160 }}
    >
      {isSaving ? <CircularProgress size={24} color="inherit" /> : saveLabel}
    </CrudButton>
  );

  return (
    <Card
      variant="outlined"
      sx={{
        mt: 3,
        borderRadius: 2,
        ...(sticky
          ? {
              position: 'sticky',
              bottom: 16,
              zIndex: 2,
              boxShadow: (theme) => theme.shadows[2],
            }
          : {}),
        bgcolor: 'background.paper',
      }}
    >
      <CardContent
        sx={{
          py: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {statusText}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {!hideDiscard && onDiscard ? (
            <Button variant="outlined" onClick={onDiscard} disabled={isSaving || !isDirty}>
              {discardLabel}
            </Button>
          ) : null}
          {saveTooltip ? (
            <Tooltip title={saveTooltip} placement="top">
              <span>{saveButton}</span>
            </Tooltip>
          ) : (
            saveButton
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
