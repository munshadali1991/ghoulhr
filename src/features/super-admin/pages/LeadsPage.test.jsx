import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LeadsPage } from './LeadsPage';

vi.mock('@/features/super-admin/api/leadsApi', () => ({
  listLeads: vi.fn(),
}));

vi.mock('@/shared/hooks/useIsMobileLayout', () => ({
  useIsMobileLayout: () => false,
}));

import { listLeads } from '@/features/super-admin/api/leadsApi';

function renderPage() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <LeadsPage />
    </QueryClientProvider>,
  );
}

describe('LeadsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders leads list and opens details', async () => {
    listLeads.mockResolvedValue({
      items: [
        {
          id: 'contact_us:1',
          source: 'contact_us',
          sourceId: '1',
          name: 'Alice Smith',
          email: 'alice@acme.com',
          phone: '111-222',
          company: 'Acme',
          companySize: '51-200',
          companyType: null,
          message: 'Need pricing details',
          contact: 'Alice',
          mobile: '111-222',
          address: null,
          country: null,
          city: null,
          createdAt: '2026-08-02T10:00:00.000Z',
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
      counts: { all: 3, contactUs: 1, requestForDemo: 2 },
    });

    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText(/Acme/)).toBeInTheDocument();
    expect(screen.getByText('All leads')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    await user.click(screen.getByLabelText('View lead Alice Smith'));
    expect(await screen.findByText('Need pricing details')).toBeInTheDocument();
  });

  it('shows empty state when there are no leads', async () => {
    listLeads.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      counts: { all: 0, contactUs: 0, requestForDemo: 0 },
    });

    renderPage();

    expect(await screen.findByText('No leads found')).toBeInTheDocument();
  });

  it('shows error state with retry', async () => {
    listLeads.mockRejectedValue(new Error('Network down'));

    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText('Network down')).toBeInTheDocument();
    listLeads.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      counts: { all: 0, contactUs: 0, requestForDemo: 0 },
    });
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => {
      expect(listLeads).toHaveBeenCalledTimes(2);
    });
  });
});
