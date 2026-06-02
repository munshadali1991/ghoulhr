import { Box, Tab, Tabs, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ORGANIZATION_TABS,
  organizationPathForTab,
  organizationTabFromPath,
} from './organizationTabs';
import { OrganizationSettingsContent } from './OrganizationSettingsContent';
import { OrganizationCalendarTab } from './calendar/OrganizationCalendarTab';

/**
 * @param {{
 *   organizationId: string,
 *   orgForm: ReturnType<import('./hooks/useOrganizationSettingsForm').useOrganizationSettingsForm>,
 * }} props
 */
export function OrganizationSettingsPage({ organizationId, orgForm }) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = organizationTabFromPath(location.pathname);

  const handleTabChange = (_, tab) => {
    navigate(organizationPathForTab(tab));
  };

  const isProfile = activeTab === ORGANIZATION_TABS.profile;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" fontWeight={700} letterSpacing="-0.02em">
          Organization
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 560 }}>
          Organization profile and the company-wide holiday calendar employees follow.
        </Typography>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ mt: 2, minHeight: 40 }}
          aria-label="Organization settings tabs"
        >
          <Tab label="Profile" value={ORGANIZATION_TABS.profile} sx={{ minHeight: 40 }} />
          <Tab label="Calendar" value={ORGANIZATION_TABS.calendar} sx={{ minHeight: 40 }} />
        </Tabs>
      </Box>

      {isProfile ? (
        <OrganizationSettingsContent
          register={orgForm.register}
          errors={orgForm.errors}
          logoPreview={orgForm.logoPreview}
          onLogoUpload={orgForm.handleLogoUpload}
        />
      ) : (
        <OrganizationCalendarTab organizationId={organizationId} />
      )}
    </Box>
  );
}
