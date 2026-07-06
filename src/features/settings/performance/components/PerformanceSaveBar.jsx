import { Box, Button, Card, CardContent, CircularProgress, Tooltip, Typography } from '@mui/material';

/**
 * @param {{
 *   hasChanges: boolean,
 *   isSaving: boolean,
 *   onSave: () => void,
 *   onDiscard: () => void,
 *   validationIssues?: string[],
 *   readOnly?: boolean,
 * }} props
 */
export function PerformanceSaveBar({
  hasChanges,
  isSaving,
  onSave,
  onDiscard,
  validationIssues = [],
  readOnly = false,
}) {
  if (readOnly) {
    return null;
  }

  const isValid = validationIssues.length === 0;
  const issueTooltip = validationIssues.length
    ? validationIssues.map((issue, index) => `${index + 1}. ${issue}`).join('\n')
    : '';

  const saveButton = (
    <Button
      variant="contained"
      onClick={onSave}
      disabled={isSaving || !hasChanges}
    >
      {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Save master'}
    </Button>
  );

  return (
    <Card
      variant="outlined"
      sx={{
        mt: 3,
        borderRadius: 2,
        position: 'sticky',
        bottom: 16,
        zIndex: 2,
        boxShadow: (theme) => theme.shadows[2],
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
          {hasChanges
            ? isValid
              ? 'You have unsaved changes — save to apply them to new assessments.'
              : `${validationIssues.length} issue${validationIssues.length === 1 ? '' : 's'} to fix before saving.`
            : 'All changes saved.'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={onDiscard} disabled={isSaving || !hasChanges}>
            Discard
          </Button>
          {!isValid && hasChanges ? (
            <Tooltip
              title={
                <Box component="span" sx={{ whiteSpace: 'pre-line' }}>
                  {issueTooltip}
                </Box>
              }
              placement="top"
            >
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
