import { Box, Button, Card, CardContent, CircularProgress, Typography } from '@mui/material';

/**
 * @param {{
 *   hasChanges: boolean,
 *   isSaving: boolean,
 *   onSave: () => void,
 *   onDiscard: () => void,
 * }} props
 */
export function OrganizationProfileSaveBar({ hasChanges, isSaving, onSave, onDiscard }) {
  return (
    <Card variant="outlined" sx={{ mt: 3, borderRadius: 2 }}>
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
          {hasChanges ? 'You have unsaved changes' : 'No unsaved changes'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={onDiscard} disabled={isSaving || !hasChanges}>
            Discard
          </Button>
          <Button variant="contained" onClick={onSave} disabled={isSaving || !hasChanges}>
            {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Save changes'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
