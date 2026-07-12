import { useEffect, useMemo, useState } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { FormProvider, useForm } from 'react-hook-form';
import { PageCard } from '@/shared/components/ui';
import { EmptyState } from '@/features/settings/shared';
import { AssessmentSectionList } from '@/features/performance/components/AssessmentSectionList';
import { getDefaultFormValues } from '@/features/performance/utils/assessmentForm';
import {
  buildPreviewPermissions,
  formValuesToPreviewSchema,
} from '../utils/performanceBuilderPreview';

/**
 * Read-only assessment preview as a selected RBAC role would see it.
 * @param {{
 *   formValues: object,
 *   rbacRoles: object[],
 * }} props
 */
export function RolePreviewPanel({ formValues, rbacRoles = [] }) {
  const sectionRoles = useMemo(() => {
    const codes = [...new Set((formValues.sections ?? []).map((s) => s.role).filter(Boolean))];
    return codes.length ? codes : ['EMPLOYEE'];
  }, [formValues.sections]);

  const [previewRole, setPreviewRole] = useState(sectionRoles[0] ?? 'EMPLOYEE');

  useEffect(() => {
    if (!sectionRoles.includes(previewRole)) {
      setPreviewRole(sectionRoles[0] ?? 'EMPLOYEE');
    }
  }, [sectionRoles, previewRole]);

  const schema = useMemo(
    () => formValuesToPreviewSchema(formValues, rbacRoles),
    [formValues, rbacRoles],
  );

  const perms = useMemo(
    () => buildPreviewPermissions(previewRole, formValues.sections ?? []),
    [previewRole, formValues.sections],
  );

  const roleLabel =
    rbacRoles.find((r) => r.code === previewRole)?.name ?? previewRole;

  const methods = useForm({
    defaultValues: getDefaultFormValues(schema),
  });

  useEffect(() => {
    methods.reset(getDefaultFormValues(schema));
  }, [schema, methods]);

  if (!schema.sections?.length) {
    return (
      <EmptyState
        icon={<VisibilityRoundedIcon sx={{ fontSize: 40 }} />}
        title="Nothing to preview yet"
        description="Add at least one section in Form Builder to see how each role experiences the assessment."
      />
    );
  }

  return (
    <Stack spacing={2.25}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={1.5}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}
        >
          Previewing as
        </Typography>
        <FormControl size="small" sx={{ maxWidth: 240, minWidth: 180 }}>
          <InputLabel>Role</InputLabel>
          <Select
            label="Role"
            value={previewRole}
            onChange={(e) => setPreviewRole(e.target.value)}
          >
            {sectionRoles.map((code) => (
              <MenuItem key={code} value={code}>
                {rbacRoles.find((r) => r.code === code)?.name ?? code}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <PageCard sx={{ p: { xs: 2.5, sm: 3.5 }, maxWidth: 640 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Viewing as <strong>{roleLabel}</strong> at workflow stage{' '}
          <strong>{perms.previewStatus.replace(/_/g, ' ').toLowerCase()}</strong>.
        </Typography>
        <FormProvider {...methods}>
          <AssessmentSectionList sections={schema.sections} perms={perms} />
        </FormProvider>
      </PageCard>
    </Stack>
  );
}
