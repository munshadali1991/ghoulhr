import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, CircularProgress, Grid, Stack, Typography } from '@mui/material';
import { PageToolbar } from '@/features/employee-portal/components/PageToolbar';
import {
  getHrSkillCatalog,
  getHrSkillEmployeeProfile,
  searchHrSkillEmployees,
} from '../api/hrSkillsApi';
import { emptySkillSearchFilters, SkillSearchFilters } from '../components/SkillSearchFilters';
import { EmployeeSkillResultList } from '../components/EmployeeSkillResultList';
import { EmployeeSkillProfilePanel } from '../components/EmployeeSkillProfilePanel';

const skillSearchKeys = {
  catalog: () => ['hr-skills', 'catalog'],
  search: (filters) => ['hr-skills', 'search', filters],
  profile: (id) => ['hr-skills', 'profile', id],
};

export function SkillSearchPage() {
  const [draft, setDraft] = useState(emptySkillSearchFilters);
  const [applied, setApplied] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const catalogQuery = useQuery({
    queryKey: skillSearchKeys.catalog(),
    queryFn: getHrSkillCatalog,
  });

  const searchQuery = useQuery({
    queryKey: skillSearchKeys.search(applied),
    queryFn: () => searchHrSkillEmployees(applied),
    enabled: Boolean(applied),
  });

  const profileQuery = useQuery({
    queryKey: skillSearchKeys.profile(selectedId),
    queryFn: () => getHrSkillEmployeeProfile(selectedId),
    enabled: Boolean(selectedId),
  });

  const employees = searchQuery.data?.employees ?? [];
  const catalog = catalogQuery.data?.categories ?? [];

  const searched = applied !== null;

  const handleSearch = () => {
    setApplied({ ...draft });
    setSelectedId(null);
  };

  const handleReset = () => {
    setDraft(emptySkillSearchFilters());
    setApplied(null);
    setSelectedId(null);
  };

  const error = catalogQuery.error || searchQuery.error || profileQuery.error;

  const resultPanel = useMemo(() => {
    if (!searched) {
      return (
        <Box sx={{ p: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
            Search to see results
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use the filters above, then click Search.
          </Typography>
        </Box>
      );
    }
    if (searchQuery.isFetching) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      );
    }
    return (
      <EmployeeSkillResultList
        employees={employees}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
    );
  }, [searched, searchQuery.isFetching, employees, selectedId]);

  return (
    <Box data-testid="skill-search-page">
      <PageToolbar
        left={
          <Stack spacing={0.5}>
            <Typography variant="h5" fontWeight={700}>
              Skill search
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Find employees by skill, proficiency, and experience, then open their profile.
            </Typography>
          </Stack>
        }
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message || 'Failed to load skill search.'}
        </Alert>
      ) : null}

      <SkillSearchFilters
        catalog={catalog}
        value={draft}
        onChange={setDraft}
        onSearch={handleSearch}
        onReset={handleReset}
        isSearching={searchQuery.isFetching}
      />

      <Grid container spacing={2} alignItems="stretch">
        <Grid size={{ xs: 12, md: 4 }} sx={{ minHeight: { md: 480 } }}>
          {resultPanel}
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <EmployeeSkillProfilePanel
            hasSelection={Boolean(selectedId)}
            isLoading={profileQuery.isFetching}
            profile={profileQuery.data}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
