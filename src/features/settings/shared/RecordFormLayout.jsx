import {
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { PageCard } from '@/shared/components/ui/PageCard';

/**
 * Full-page SaaS form shell — replaces side drawers for create/edit flows.
 */
export function RecordFormLayout({
  breadcrumbs = [],
  title,
  subtitle,
  onBack,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save changes',
  cancelLabel = 'Cancel',
  readOnly = false,
  children,
}) {
  return (
    <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 720, mx: 'auto', width: '100%' }}>
      <Button
        type="button"
        startIcon={<ArrowBackRoundedIcon />}
        onClick={onBack}
        disabled={isSubmitting}
        sx={{ mb: 2, color: 'text.secondary', fontWeight: 600 }}
      >
        Back
      </Button>

      {breadcrumbs.length > 0 ? (
        <Breadcrumbs sx={{ mb: 1.5 }} aria-label="Form breadcrumb">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            if (isLast) {
              return (
                <Typography key={crumb.label} variant="body2" color="text.primary" fontWeight={600}>
                  {crumb.label}
                </Typography>
              );
            }
            return (
              <Link
                key={crumb.label}
                component="button"
                type="button"
                variant="body2"
                underline="hover"
                color="text.secondary"
                onClick={crumb.onClick}
                sx={{ cursor: 'pointer', border: 0, bgcolor: 'transparent', p: 0 }}
              >
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      ) : null}

      <Typography variant="h5" component="h1" fontWeight={700} letterSpacing="-0.02em">
        {title}
      </Typography>
      {subtitle ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, mb: 3 }}>
          {subtitle}
        </Typography>
      ) : (
        <Box sx={{ mb: 3 }} />
      )}

      <PageCard>
        <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>{children}</Box>

        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          spacing={1.5}
          justifyContent="flex-end"
          sx={{
            px: { xs: 2.5, md: 3.5 },
            py: 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: (theme) => theme.palette.custom.surfaces.subtle,
          }}
        >
          <Button type="button" variant="outlined" onClick={onBack} disabled={isSubmitting}>
            {cancelLabel}
          </Button>
          {!readOnly ? (
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {isSubmitting ? 'Saving…' : submitLabel}
            </Button>
          ) : null}
        </Stack>
      </PageCard>
    </Box>
  );
}
