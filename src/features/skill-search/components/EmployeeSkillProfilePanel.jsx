import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { PageCard } from '@/shared/components/ui/PageCard';
import { ProficiencyBadge } from './ProficiencyBadge';

function formatTimestamp(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

function Metric({ label, value }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, flex: 1, minWidth: 120, borderRadius: 2 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={700}>
        {value}
      </Typography>
    </Paper>
  );
}

export function EmployeeSkillProfilePanel({ profile, isLoading, hasSelection }) {
  if (!hasSelection) {
    return (
      <PageCard sx={{ p: 4, minHeight: 320 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
          Select an employee
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose someone from the search results to view their skill profile.
        </Typography>
      </PageCard>
    );
  }

  if (isLoading || !profile) {
    return (
      <PageCard sx={{ p: 4, minHeight: 320 }}>
        <Typography variant="body2" color="text.secondary">
          Loading profile…
        </Typography>
      </PageCard>
    );
  }

  const groups = profile.groups ?? [];

  return (
    <Stack spacing={2}>
      <PageCard sx={{ p: 2.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <Avatar
            src={profile.profilePhotoPreviewUrl || undefined}
            alt={profile.name}
            sx={{ width: 64, height: 64 }}
          >
            {(profile.name || '?').slice(0, 1)}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              {profile.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profile.designationName || 'No designation'}
              {profile.departmentName ? ` · ${profile.departmentName}` : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manager: {profile.managerName || '—'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total experience:{' '}
              {profile.totalExperienceYears != null && profile.totalExperienceYears !== ''
                ? `${profile.totalExperienceYears} years`
                : '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Last profile update: {formatTimestamp(profile.lastProfileUpdate)}
            </Typography>
          </Box>
        </Stack>
      </PageCard>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <Metric label="Total skills" value={profile.counts?.total ?? 0} />
        <Metric label="Expert" value={profile.counts?.expert ?? 0} />
        <Metric label="Good" value={profile.counts?.good ?? 0} />
        <Metric label="Beginner" value={profile.counts?.beginner ?? 0} />
      </Stack>

      {groups.length === 0 ? (
        <PageCard sx={{ p: 3 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            No skills on this profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This employee has not added any catalog skills yet.
          </Typography>
        </PageCard>
      ) : (
        groups.map((category) => (
          <Accordion key={category.categoryId} defaultExpanded disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={700}>{category.categoryName}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {(category.subcategories ?? []).map((subcategory) => (
                <Box key={subcategory.subcategoryId} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    {subcategory.subcategoryName}
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Skill</TableCell>
                        <TableCell>Experience</TableCell>
                        <TableCell>Proficiency</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(subcategory.skills ?? []).map((skill) => (
                        <TableRow key={skill.skillId}>
                          <TableCell>{skill.skillName}</TableCell>
                          <TableCell>{skill.experienceMonths} mo</TableCell>
                          <TableCell>
                            <ProficiencyBadge value={skill.proficiency} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Stack>
  );
}
