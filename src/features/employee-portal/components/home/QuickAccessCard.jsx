import { Box, Link, Stack, Typography } from '@mui/material';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { PageCard } from '@/shared/components/ui/PageCard';
import { HomeCardEyebrow } from './HomeCardEyebrow';

const LINK_ICONS = [DescriptionOutlinedIcon, DescriptionOutlinedIcon, DescriptionOutlinedIcon];

/**
 * @param {{ links: Array<{ label: string, href: string }> }} props
 */
export function QuickAccessCard({ links = [] }) {
  return (
    <PageCard sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: { xs: 2.5, sm: 3 } }}>
      <HomeCardEyebrow icon={<BoltOutlinedIcon />}>Quick access</HomeCardEyebrow>
      <Stack spacing={0.25} sx={{ mt: -0.5, flex: 1 }}>
        {links.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No quick links
          </Typography>
        ) : (
          links.map((link, index) => {
            const Icon = LINK_ICONS[index % LINK_ICONS.length];
            return (
              <Link
                key={`${link.label}-${link.href}`}
                href={link.href}
                underline="none"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.35,
                  px: 1,
                  py: 1.15,
                  borderRadius: 1,
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: 'text.primary',
                  transition: 'background 0.12s ease',
                  '&:hover': {
                    bgcolor: (t) => t.palette.custom?.surfaces?.subtle ?? 'action.hover',
                  },
                }}
              >
                <Icon sx={{ fontSize: 18, color: 'secondary.main' }} />
                {link.label}
              </Link>
            );
          })
        )}
      </Stack>
    </PageCard>
  );
}
