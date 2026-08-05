import { Chip } from '@mui/material';
import { ANSWER_ROLES, normalizeSectionRoleCode } from '../../constants/performanceEnums';

const ROLE_LABELS = {
  [ANSWER_ROLES.EMPLOYEE]: 'You:',
  [ANSWER_ROLES.MANAGER]: 'Manager:',
  [ANSWER_ROLES.TEAM_LEAD]: 'Team lead:',
  [ANSWER_ROLES.HR]: 'HR:',
  [ANSWER_ROLES.HR_ADMIN]: 'HR:',
};

/**
 * Small green tag identifying who fills a question.
 * @param {{ role: string, roleLabel?: string }} props
 */
export function RoleTag({ role, roleLabel }) {
  const code = normalizeSectionRoleCode(role);
  const label = roleLabel ? `${roleLabel}:` : (ROLE_LABELS[code] ?? `${code}:`);

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: 'success.main',
        color: 'common.white',
        fontWeight: 700,
        height: 22,
        borderRadius: 1,
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
}
