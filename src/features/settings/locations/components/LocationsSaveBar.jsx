import { Button, Card, CardContent, CircularProgress, Typography } from '@mui/material';

/**
 * @param {{
 *   isDirty: boolean,
 *   isUpdating: boolean,
 *   canSave: boolean,
 * }} props
 */
export function LocationsSaveBar({ isDirty, isUpdating, canSave }) {
  return (
    <Card
      variant="outlined"
      sx={{
        mt: 3,
        borderRadius: 2,
        position: 'sticky',
        bottom: 16,
        zIndex: 1,
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
          {isDirty ? 'You have unsaved changes.' : 'All changes are saved.'}
        </Typography>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isUpdating || !isDirty || !canSave}
          sx={{ minWidth: 160 }}
        >
          {isUpdating ? <CircularProgress size={24} color="inherit" /> : 'Save changes'}
        </Button>
      </CardContent>
    </Card>
  );
}
