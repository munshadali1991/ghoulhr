import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Breadcrumbs,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { PageCard } from '@/shared/components/ui/PageCard';
import { useAuthorization } from '@/features/auth/hooks/useAuthorization';
import { PEOPLE_MODULE_ACCESS } from '@/features/auth/config/accessRegistry';
import { usePeopleFilterOptions, usePeopleList } from '../hooks/usePeopleQueries';
import { PeopleList } from '../components/PeopleList';
import { PeopleListFilters } from '../components/PeopleListFilters';
import { PeopleProfileDialog } from '../components/PeopleProfileDialog';

const DEFAULT_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

function tabToView(tabKey) {
  return tabKey === 'my-team' ? 'team' : 'everyone';
}

function tabLabel(tabKey) {
  return tabKey === 'my-team' ? 'My Team' : 'Everyone';
}

function buildStatusQuery(showMode) {
  if (showMode === 'active') {
    return { status: 'ACTIVE', includeAllStatuses: false };
  }
  if (showMode === 'inactive') {
    return { status: 'INACTIVE', includeAllStatuses: false };
  }
  return { includeAllStatuses: true };
}

export function PeoplePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getAllowedTabs } = useAuthorization();
  const tabs = getAllowedTabs(PEOPLE_MODULE_ACCESS.tabs);

  const tabFromUrl = searchParams.get('tab');
  const personId = searchParams.get('person') || '';
  const activeTabKey = useMemo(() => {
    if (tabs.some((t) => t.key === tabFromUrl)) return tabFromUrl;
    return tabs[0]?.key ?? 'everyone';
  }, [tabFromUrl, tabs]);

  const view = tabToView(activeTabKey);

  const [searchInput, setSearchInput] = useState(() => searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(() =>
    (searchParams.get('q') || '').trim(),
  );
  const [page, setPage] = useState(() => Math.max(1, Number(searchParams.get('page')) || 1));
  const [limit, setLimit] = useState(() =>
    Math.min(50, Math.max(1, Number(searchParams.get('limit')) || DEFAULT_LIMIT)),
  );
  const [departmentId, setDepartmentId] = useState(() => searchParams.get('departmentId') || '');
  const [designationId, setDesignationId] = useState(
    () => searchParams.get('designationId') || '',
  );
  const [showMode, setShowMode] = useState(() => {
    const show = searchParams.get('show');
    if (show === 'all' || show === 'inactive') return show;
    return 'active';
  });

  const filterOptionsQuery = usePeopleFilterOptions(tabs.length > 0);
  const departments = filterOptionsQuery.data?.departments ?? [];
  const designations = filterOptionsQuery.data?.designations ?? [];

  useEffect(() => {
    const handle = setTimeout(() => {
      const next = searchInput.trim();
      setDebouncedSearch((prev) => {
        if (prev !== next) setPage(1);
        return next;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    const next = new URLSearchParams();
    next.set('tab', activeTabKey);
    if (debouncedSearch) next.set('q', debouncedSearch);
    if (page > 1) next.set('page', String(page));
    if (limit !== DEFAULT_LIMIT) next.set('limit', String(limit));
    if (departmentId) next.set('departmentId', departmentId);
    if (designationId) next.set('designationId', designationId);
    if (showMode !== 'active') next.set('show', showMode);
    if (personId) next.set('person', personId);
    setSearchParams(next, { replace: true });
  }, [
    activeTabKey,
    debouncedSearch,
    page,
    limit,
    departmentId,
    designationId,
    showMode,
    personId,
    setSearchParams,
  ]);

  const statusQuery = useMemo(() => buildStatusQuery(showMode), [showMode]);

  const listParams = useMemo(
    () => ({
      view,
      page,
      limit,
      search: debouncedSearch || undefined,
      departmentId: departmentId || undefined,
      designationId: designationId || undefined,
      ...statusQuery,
    }),
    [view, page, limit, debouncedSearch, departmentId, designationId, statusQuery],
  );

  const listQuery = usePeopleList(listParams, tabs.length > 0);
  const items = listQuery.data?.items ?? [];

  const openPerson = (id) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('person', id);
        return next;
      },
      { replace: false },
    );
  };

  const closePerson = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('person');
        return next;
      },
      { replace: true },
    );
  };

  const handleTabChange = (_, index) => {
    const nextKey = tabs[index]?.key;
    if (!nextKey || nextKey === activeTabKey) return;
    setPage(1);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', nextKey);
        next.delete('page');
        return next;
      },
      { replace: true },
    );
  };

  const handleShowModeChange = (mode) => {
    setShowMode(mode);
    setPage(1);
  };

  const emptyCopy =
    view === 'team'
      ? {
          title: debouncedSearch
            ? 'No people match your search'
            : 'You don’t have any team members assigned yet',
          description: debouncedSearch
            ? 'Try a different name, code, or department.'
            : 'When employees are assigned to you as their reporting manager, they will appear here.',
        }
      : {
          title: debouncedSearch ? 'No people match your search' : 'No people to show',
          description: debouncedSearch
            ? 'Try a different name, code, or department.'
            : 'There are no employees visible in your directory scope.',
        };

  if (tabs.length === 0) {
    return (
      <Alert severity="warning">
        You don’t have permission to view the People directory.
      </Alert>
    );
  }

  const tabIndex = Math.max(
    0,
    tabs.findIndex((t) => t.key === activeTabKey),
  );

  return (
    <Box>
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 1.5, borderBottom: 1, borderColor: 'divider' }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.key} label={tab.label} />
        ))}
      </Tabs>

      <Breadcrumbs sx={{ mb: 0.75 }} aria-label="People breadcrumb">
        <Typography variant="body2" color="text.secondary">
          People
        </Typography>
        <Typography variant="body2" color="text.primary" fontWeight={600}>
          {tabLabel(activeTabKey)}
        </Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        {tabLabel(activeTabKey)}
      </Typography>

      <PageCard sx={{ p: 2.5 }}>
        <Box sx={{ mb: 2 }}>
          <PeopleListFilters
            search={searchInput}
            onSearchChange={setSearchInput}
            departmentId={departmentId}
            onDepartmentChange={(v) => {
              setDepartmentId(v);
              setPage(1);
            }}
            designationId={designationId}
            onDesignationChange={(v) => {
              setDesignationId(v);
              setPage(1);
            }}
            showMode={showMode}
            onShowModeChange={handleShowModeChange}
            departments={departments}
            designations={designations}
          />
        </Box>

        {listQuery.error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {listQuery.error.message || 'Failed to load people. Please try again.'}
          </Alert>
        ) : null}

        <PeopleList
          items={items}
          total={listQuery.data?.total ?? 0}
          page={listQuery.data?.page ?? page}
          limit={listQuery.data?.limit ?? limit}
          loading={listQuery.isFetching}
          emptyTitle={emptyCopy.title}
          emptyDescription={emptyCopy.description}
          onPageChange={(zeroBased) => setPage(zeroBased + 1)}
          onRowsPerPageChange={(nextLimit) => {
            setLimit(nextLimit);
            setPage(1);
          }}
          onSelect={(person) => openPerson(person.id)}
        />
      </PageCard>

      <PeopleProfileDialog
        open={Boolean(personId)}
        employeeId={personId}
        onClose={closePerson}
        onOpenPerson={openPerson}
      />
    </Box>
  );
}
