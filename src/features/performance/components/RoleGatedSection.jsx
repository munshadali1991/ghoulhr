import { Box, Chip, Stack, Typography } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { ANSWER_ROLES, normalizeSectionRoleCode } from '../constants/performanceEnums';
import { SectionBanner } from './SectionBanner';
import { QuestionRow } from './questions/QuestionRow';

function roleDisplayName(section) {
  if (section.filledByRoleName) return section.filledByRoleName;
  const code = normalizeSectionRoleCode(section.role);
  if (code === ANSWER_ROLES.HR_ADMIN) return 'HR';
  if (code === ANSWER_ROLES.MANAGER) return 'the manager';
  if (code === ANSWER_ROLES.TEAM_LEAD) return 'the team lead';
  return code.toLowerCase().replace(/_/g, ' ');
}

/**
 * A restricted non-employee section: blue banner + lock hint when read-only.
 * @param {{
 *   section: object,
 *   editable: boolean,
 *   errors?: Record<string, string>,
 * }} props
 */
export function RoleGatedSection({ section, editable, errors = {} }) {
  const questions = (section.questions ?? []).filter((q) => q.isActive !== false);
  const roleLabel = roleDisplayName(section);

  return (
    <Stack spacing={1.5}>
      <SectionBanner
        title={section.banner}
        action={
          editable ? (
            <Chip
              size="small"
              label="You can edit"
              sx={{ bgcolor: 'rgba(255,255,255,0.22)', color: 'common.white', fontWeight: 600 }}
            />
          ) : (
            <Chip
              size="small"
              icon={<LockRoundedIcon sx={{ color: 'common.white !important', fontSize: 16 }} />}
              label="Locked"
              sx={{ bgcolor: 'rgba(255,255,255,0.22)', color: 'common.white', fontWeight: 600 }}
            />
          )
        }
      />
      {!editable ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          <LockRoundedIcon sx={{ fontSize: 18 }} />
          <Typography variant="caption">
            This section is completed by {roleLabel} and is read-only for you.
          </Typography>
        </Box>
      ) : null}
      <Stack spacing={1.5}>
        {questions.map((question) => (
          <QuestionRow
            key={question.key}
            question={question}
            fillRole={section.role}
            roleLabel={section.filledByRoleName}
            disabled={!editable}
            error={errors[question.key]}
          />
        ))}
      </Stack>
    </Stack>
  );
}
