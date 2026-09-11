import { describe, expect, it } from 'vitest';
import { SUPER_ADMIN_NAV_CONFIG, buildSuperAdminNavItems } from './superAdminNav';

describe('superAdminNav', () => {
  it('includes Leads in the navigation config', () => {
    expect(SUPER_ADMIN_NAV_CONFIG).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'leads',
          label: 'Leads',
          path: '/leads',
        }),
      ]),
    );
  });

  it('marks leads as active on /leads', () => {
    const items = buildSuperAdminNavItems('/leads');
    const leads = items.find((item) => item.key === 'leads');
    expect(leads?.active).toBe(true);
  });
});
