import { Stack, Typography } from '@mui/material';
import { ANSWER_ROLES } from '../constants/performanceEnums';
import { isSectionEditable } from '../utils/assessmentAccess';
import { SectionBanner } from './SectionBanner';
import { RoleGatedSection } from './RoleGatedSection';
import { QuestionRow } from './questions/QuestionRow';

function isRoleGatedSection(section) {
  return section.role !== ANSWER_ROLES.EMPLOYEE;
}

/**
 * Renders every section from the assessment snapshot in order.
 * @param {{
 *   sections: object[],
 *   perms: {
 *     employeeEditable: boolean,
 *     canManagerReview: boolean,
 *     canHrReview: boolean,
 *     editableByRole?: Record<string, boolean>,
 *   },
 *   errors?: Record<string, string>,
 * }} props
 */
export function AssessmentSectionList({ sections = [], perms, errors = {} }) {
  const activeSections = sections.filter((s) => s.isActive !== false);

  return (
    <Stack spacing={3}>
      {activeSections.map((section) => {
        const editable = isSectionEditable(section, perms);
        const questions = (section.questions ?? []).filter((q) => q.isActive !== false);
        const roleLabel = section.filledByRoleName;

        if (isRoleGatedSection(section)) {
          return (
            <RoleGatedSection
              key={section.key}
              section={section}
              editable={editable}
              errors={errors}
            />
          );
        }

        return (
          <Stack key={section.key} spacing={1.5}>
            {section.banner ? (
              <SectionBanner title={section.banner} />
            ) : (
              <Typography
                variant="overline"
                sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.08em' }}
              >
                {section.title}
              </Typography>
            )}
            <Stack spacing={1.5}>
              {questions.map((question) => (
                <QuestionRow
                  key={question.key}
                  question={question}
                  fillRole={section.role}
                  roleLabel={roleLabel}
                  disabled={!editable}
                  error={errors[question.key]}
                />
              ))}
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
}
