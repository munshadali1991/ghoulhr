import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { CrudButton } from '@/shared/components/ui/CrudButton';
import { SKILL_PROFICIENCY_OPTIONS } from '@/features/employee-portal/constants/skillEnums';
import { PageCard } from '@/shared/components/ui/PageCard';

const EMPTY = {
  q: '',
  categoryId: '',
  subcategoryId: '',
  skillId: '',
  proficiency: '',
  minExperienceMonths: '',
};

export function emptySkillSearchFilters() {
  return { ...EMPTY };
}

export function SkillSearchFilters({
  catalog = [],
  value,
  onChange,
  onSearch,
  onReset,
  isSearching,
}) {
  const category = catalog.find((item) => item.id === value.categoryId);
  const subcategory = category?.subcategories?.find((item) => item.id === value.subcategoryId);
  const skills = subcategory?.skills ?? [];

  const patch = (next) => onChange({ ...value, ...next });

  return (
    <PageCard sx={{ mb: 2 }}>
      <Stack spacing={2} sx={{ p: { xs: 1.5, sm: 2 } }} component="form" onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Employee name or ID"
              value={value.q}
              onChange={(event) => patch({ q: event.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="skill-search-category">Category</InputLabel>
              <Select
                labelId="skill-search-category"
                label="Category"
                value={value.categoryId}
                onChange={(event) =>
                  patch({ categoryId: event.target.value, subcategoryId: '', skillId: '' })
                }
              >
                <MenuItem value="">All</MenuItem>
                {catalog.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <FormControl fullWidth size="small" disabled={!value.categoryId}>
              <InputLabel id="skill-search-subcategory">Subcategory</InputLabel>
              <Select
                labelId="skill-search-subcategory"
                label="Subcategory"
                value={value.subcategoryId}
                onChange={(event) => patch({ subcategoryId: event.target.value, skillId: '' })}
              >
                <MenuItem value="">All</MenuItem>
                {(category?.subcategories ?? []).map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small" disabled={!value.subcategoryId}>
              <InputLabel id="skill-search-skill">Skill name</InputLabel>
              <Select
                labelId="skill-search-skill"
                label="Skill name"
                value={value.skillId}
                onChange={(event) => patch({ skillId: event.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                {skills.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="skill-search-proficiency">Proficiency</InputLabel>
              <Select
                labelId="skill-search-proficiency"
                label="Proficiency"
                value={value.proficiency}
                onChange={(event) => patch({ proficiency: event.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                {SKILL_PROFICIENCY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Min experience (months)"
              value={value.minExperienceMonths}
              onChange={(event) => patch({ minExperienceMonths: event.target.value })}
              inputProps={{ min: 0, max: 720, step: 1 }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="flex-end">
              <Button type="button" variant="outlined" onClick={onReset} disabled={isSearching}>
                Reset filters
              </Button>
              <CrudButton intent="view" type="submit" startIcon={<SearchRoundedIcon />} disabled={isSearching}>
                {isSearching ? 'Searching…' : 'Search'}
              </CrudButton>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </PageCard>
  );
}
