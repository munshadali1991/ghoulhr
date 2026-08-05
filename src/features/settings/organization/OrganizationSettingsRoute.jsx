import { OrganizationSettingsPage } from './OrganizationSettingsPage';
import { useOrganizationSettingsForm } from './hooks/useOrganizationSettingsForm';

/**
 * @param {{ organizationId: string, orgSubPath?: string }} props
 */
export function OrganizationSettingsRoute({ organizationId, orgSubPath = '' }) {
  const orgForm = useOrganizationSettingsForm(organizationId);
  return (
    <OrganizationSettingsPage
      organizationId={organizationId}
      orgForm={orgForm}
      orgSubPath={orgSubPath}
    />
  );
}
