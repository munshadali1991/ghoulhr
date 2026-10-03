import { Avatar, Box, Stack, Typography } from '@mui/material';
import { PageCard } from '@/shared/components/ui/PageCard';
import { proficiencyLabel } from '@/features/employee-portal/constants/skillEnums';
import { ProficiencyBadge } from './ProficiencyBadge';

export function EmployeeSkillResultList({ employees = [], selectedId, onSelect }) {
  if (employees.length === 0) {
    return (
      <PageCard sx={{ p: 3, height: '100%' }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
          No employees match
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try a different name, skill, or proficiency filter.
        </Typography>
      </PageCard>
    );
  }

  return (
    <Stack spacing={1.25} sx={{ height: '100%', overflowY: 'auto', pr: 0.5 }}>
      {employees.map((employee) => {
        const selected = employee.id === selectedId;
        return (
          <PageCard
            key={employee.id}
            onClick={() => onSelect(employee.id)}
            sx={{
              p: 1.5,
              cursor: 'pointer',
              borderColor: selected ? 'secondary.main' : 'divider',
              boxShadow: selected ? 2 : 0,
              bgcolor: selected ? 'action.selected' : 'background.paper',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Avatar src={employee.profilePhotoPreviewUrl || undefined} alt={employee.name}>
                {(employee.name || '?').slice(0, 1)}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} noWrap>
                  {employee.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {employee.employeeCode}
                  {employee.designationName ? ` · ${employee.designationName}` : ''}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  {employee.departmentName || 'No department'}
                </Typography>
                <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                  {(employee.topSkills ?? []).map((skill) => (
                    <ProficiencyBadge
                      key={skill.skillId}
                      value={skill.proficiency}
                      label={`${skill.skillName || 'Skill'} · ${proficiencyLabel(skill.proficiency)}`}
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </PageCard>
        );
      })}
    </Stack>
  );
}
