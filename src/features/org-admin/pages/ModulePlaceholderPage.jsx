import { Alert, CardContent, Typography } from '@mui/material';
import { PageCard } from '@/shared/components/ui/PageCard';

/**
 * @param {{ title: string }} props
 */
export function ModulePlaceholderPage({ title }) {
  return (
    <PageCard>
      <CardContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={600}>
            {title} Module - Coming Soon
          </Typography>
        </Alert>
        <Typography variant="body2" color="text.secondary">
          The {title.toLowerCase()} module is currently under development. Check back soon for
          updates!
        </Typography>
      </CardContent>
    </PageCard>
  );
}
