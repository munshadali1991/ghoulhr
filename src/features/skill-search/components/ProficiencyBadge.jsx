import { Chip } from '@mui/material';
import { proficiencyLabel, SKILL_PROFICIENCY } from '@/features/employee-portal/constants/skillEnums';

export function proficiencyBadgeSx(value) {
  if (value === SKILL_PROFICIENCY.EXPERT) {
    return { bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600 };
  }
  if (value === SKILL_PROFICIENCY.GOOD) {
    return { bgcolor: '#fff8e1', color: '#ed6c02', fontWeight: 600 };
  }
  return { bgcolor: '#e3f2fd', color: '#0288d1', fontWeight: 600 };
}

export function ProficiencyBadge({ value, size = 'small', label }) {
  if (!value) return null;
  return (
    <Chip size={size} label={label || proficiencyLabel(value)} sx={proficiencyBadgeSx(value)} />
  );
}
