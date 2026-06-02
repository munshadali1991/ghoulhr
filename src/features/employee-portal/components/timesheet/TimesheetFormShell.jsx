import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { BrandedButton } from '@/shared/components/ui/BrandedButton';

/**
 * Full-page form shell matching HR onboarding layout (without stepper).
 */
export function TimesheetFormShell({
  title,
  subtitle,
  onBack,
  onSaveDraft,
  saveDraftDisabled,
  saving,
  children,
  primaryLabel,
}) {
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: { xs: 'calc(100vh - 120px)', md: 'auto' },
        mx: { xs: -1, sm: 0 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          position: { xs: 'sticky', md: 'static' },
          top: 0,
          zIndex: 2,
          px: { xs: 1.5, sm: 2 },
          py: 1.5,
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              color="inherit"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={onBack}
              disabled={saving}
            >
              Back to list
            </Button>
            <Button
              variant="outlined"
              startIcon={<SaveRoundedIcon />}
              onClick={onSaveDraft}
              disabled={saving || saveDraftDisabled}
            >
              Save draft
            </Button>
          </Stack>
          <Box textAlign={{ xs: 'left', sm: 'right' }}>
            <Typography variant="h5" fontWeight={700}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="caption" color="text.secondary" display="block">
                {subtitle}
              </Typography>
            ) : null}
          </Box>
        </Stack>
      </Paper>

      <Card
        elevation={0}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
          <Box sx={{ maxWidth: 900, mx: 'auto', width: '100%' }}>{children}</Box>
        </CardContent>

        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'grey.50',
            position: { xs: 'sticky', sm: 'static' },
            bottom: 0,
          }}
        >
          <Stack
            direction={{ xs: 'column-reverse', sm: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <Button variant="outlined" onClick={onBack} disabled={saving} fullWidth={isNarrow}>
              Cancel
            </Button>
            <BrandedButton
              type="submit"
              disabled={saving}
              fullWidth={isNarrow}
              sx={{ minWidth: { sm: 200 } }}
            >
              {saving ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                primaryLabel
              )}
            </BrandedButton>
          </Stack>
        </Box>
      </Card>
    </Box>
  );
}
