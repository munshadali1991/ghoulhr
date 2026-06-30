import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { OrganizationSettingsToolbar } from '@/features/settings/organization/components/OrganizationSettingsToolbar';
import { ORGANIZATION_TABS } from '@/features/settings/organization/organizationTabs';
import { SidebarContent } from '@/shared/components/layout/SidebarContent';

function StubPage({ testId }) {
  return <div data-testid={testId}>{testId}</div>;
}

function SettingsRoutes() {
  return (
    <Routes>
      <Route path="/settings/organization" element={<StubPage testId="settings-organization-page" />} />
      <Route
        path="/settings/organization/calendar"
        element={<StubPage testId="settings-organization-calendar-page" />}
      />
      <Route path="/settings/locations" element={<StubPage testId="settings-locations-page" />} />
      <Route path="/settings/employees" element={<StubPage testId="settings-employees-page" />} />
    </Routes>
  );
}

function NavProbe() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div>
      <div data-testid="pathname">{location.pathname}</div>
      <button type="button" onClick={() => navigate('/settings/locations')}>
        Go locations
      </button>
      <SettingsRoutes />
    </div>
  );
}

function OrgToolbarNavProbe() {
  const location = useLocation();
  const activeTab =
    location.pathname === '/settings/organization/calendar'
      ? ORGANIZATION_TABS.calendar
      : ORGANIZATION_TABS.profile;

  return (
    <div>
      <div data-testid="pathname">{location.pathname}</div>
      <OrganizationSettingsToolbar activeTab={activeTab} />
      <SettingsRoutes />
    </div>
  );
}

function buildSettingsSidebarNavItems(pathname) {
  return [
    {
      key: 'settings',
      label: 'Settings',
      expandPathPrefix: '/settings',
      submenuOpen: true,
      children: [
        {
          key: 'settings-organization',
          label: 'Organization',
          path: '/settings/organization',
          active: pathname.startsWith('/settings/organization'),
        },
        {
          key: 'settings-locations',
          label: 'Locations',
          path: '/settings/locations',
          active: pathname.startsWith('/settings/locations'),
        },
      ],
    },
  ];
}

function LayoutWithOutletAndSidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div>
      <div data-testid="pathname">{pathname}</div>
      <SidebarContent
        user={{ email: 'test@example.com', role: 'ORG_ADMIN' }}
        navItems={buildSettingsSidebarNavItems(pathname)}
        pathname={pathname}
        onItemClick={() => {}}
      />
      <Outlet />
    </div>
  );
}

describe('settings navigation routes', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders organization page at /settings/organization', () => {
    render(
      <MemoryRouter initialEntries={['/settings/organization']}>
        <SettingsRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('settings-organization-page')).toBeInTheDocument();
  });

  it('renders calendar page at /settings/organization/calendar', () => {
    render(
      <MemoryRouter initialEntries={['/settings/organization/calendar']}>
        <SettingsRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('settings-organization-calendar-page')).toBeInTheDocument();
  });

  it('renders locations page at /settings/locations', () => {
    render(
      <MemoryRouter initialEntries={['/settings/locations']}>
        <SettingsRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('settings-locations-page')).toBeInTheDocument();
  });

  it('updates rendered page when navigate() is called programmatically', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/settings/organization']}>
        <NavProbe />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('settings-organization-page')).toBeInTheDocument();
    expect(screen.getByTestId('pathname')).toHaveTextContent('/settings/organization');

    await user.click(screen.getByRole('button', { name: 'Go locations' }));

    expect(screen.getByTestId('pathname')).toHaveTextContent('/settings/locations');
    expect(screen.getByTestId('settings-locations-page')).toBeInTheDocument();
    expect(screen.queryByTestId('settings-organization-page')).not.toBeInTheDocument();
  });

  it('updates RR location and mounted page when sidebar Link is clicked inside layout with Outlet', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/settings/organization']}>
        <Routes>
          <Route element={<LayoutWithOutletAndSidebar />}>
            <Route
              path="/settings/organization"
              element={<StubPage testId="settings-organization-page" />}
            />
            <Route path="/settings/locations" element={<StubPage testId="settings-locations-page" />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('pathname')).toHaveTextContent('/settings/organization');
    expect(screen.getByTestId('settings-organization-page')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Locations' }));

    expect(screen.getByTestId('pathname')).toHaveTextContent('/settings/locations');
    expect(screen.getByTestId('settings-locations-page')).toBeInTheDocument();
    expect(screen.queryByTestId('settings-organization-page')).not.toBeInTheDocument();
  });
});

describe('OrganizationSettingsToolbar', () => {
  afterEach(() => {
    cleanup();
  });

  it('navigates to calendar route when calendar tab is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/settings/organization']}>
        <OrgToolbarNavProbe />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('pathname')).toHaveTextContent('/settings/organization');
    expect(screen.getByTestId('settings-organization-page')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Calendar' }));

    expect(screen.getByTestId('pathname')).toHaveTextContent('/settings/organization/calendar');
    expect(screen.getByTestId('settings-organization-calendar-page')).toBeInTheDocument();
  });
});
