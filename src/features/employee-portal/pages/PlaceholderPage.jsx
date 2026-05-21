import { CardContent, Typography } from '@mui/material';
import { PageCard } from '@/shared/components/ui/PageCard';

/**
 * @param {{ title: string }} props
 */
export function PlaceholderPage({ title }) {
  return (
    <PageCard>
      <CardContent>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This feature is under development.
        </Typography>
      </CardContent>
    </PageCard>
  );
}
